import React, { useState, useEffect, useMemo, useCallback } from "react";
import { postMessage } from "../utils/postMessage";
import { CommandStructures, Commands } from "../../../commands/src/commands";
import Diagram from "../components/Diagram/Diagram";
import Loader from "../components/shared/Loader";
import ITableData from "../interfaces/ITableData";
import { mapDiagramValueData } from "../components/Diagram/diagramUtils";
import { DiagramLayout } from "../interfaces/DataLayoutsType";
import { ReactFlowProvider } from "reactflow";
import { ViewpointPaths, useLayoutData } from "../providers/LayoutProvider";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { useCommandData } from "../contexts/CommandProvider";
import { useWizards } from "../providers/WizardController";

const DiagramView: React.FC = () => {
  const { openWizard } = useWizards();
  const { commands } = useCommandData();
  const { layouts, isLoadingLayoutContext } = useLayoutData();
  const [webviewPath, setWebviewPath] = useState<string>("");
  const [diagramLayout, setDiagramLayout] = useState<DiagramLayout | null>(
    null
  );
  const [data, setData] = useState<{ [key: string]: ITableData[] }>({});
  const [filter, setFilter] = useState<{
    iris: string[];
    filterObject: Record<string, string[]> | null;
  }>({ iris: [], filterObject: null });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [instances, setInstances] = useState<string[]>([""]);
  const [relations, setRelations] = useState<string[]>([""]);

  useEffect(() => {
    // Only start fetching data when context is loaded
    if (isLoadingLayoutContext) return;

    let diagramLayouts: any = {};

    // layouts[LayoutPaths.Pages] comes from the pages.json file structure and key-value pairs
    layouts[ViewpointPaths.Pages]?.forEach((layout: any) => {
      layout.children?.forEach((page: any) => {
        if (page.type === "diagram") {
          // Locally scoped variable which is used to set the key of the JSON object
          let _path = "";
          // Path comes from the pages.json file with the .json file identifier
          _path = page.path + ".json";
          // Use object spread to merge all tables into tableLayouts object
          diagramLayouts = { ...diagramLayouts, ...layouts[_path] };
        }
      });
    });

    const root = document.getElementById("root");
    let webviewPath = root?.getAttribute("data-webview-path") || "";

    if (!webviewPath) {
      setErrorMessage("No diagram path specified");
      setIsLoading(false);
      return;
    } else if (Object.keys(diagramLayouts).length === 0) {
      setErrorMessage(
        "Diagram layouts not found in `src/vision/layouts/diagrams`"
      );
      setIsLoading(false);
      return;
    } else if (!diagramLayouts.hasOwnProperty(webviewPath)) {
      setErrorMessage("No JSON layout found for diagram path: " + webviewPath);
      setIsLoading(false);
      return;
    }

    const layout = diagramLayouts[webviewPath] as DiagramLayout;
    setDiagramLayout(layout);
    setWebviewPath(webviewPath);

    postMessage({
      command: Commands.GET_ALL_ELEMENT_RELATIONS,
      payload: {
        webviewPath: webviewPath,
      },
    });

    postMessage({
      command: Commands.GET_ALL_INSTANCE_CATEGORIES,
      payload: {
        webviewPath: webviewPath,
      },
    });

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        webviewPath: webviewPath,
        queries: layout.queries,
      },
    });
    const handler = (event: MessageEvent) => {
      const message = event.data;

      let specificMessage;
      switch (message.command) {
        case Commands.LOADED_TABLE_DATA:
          specificMessage =
            message as CommandStructures[Commands.LOADED_TABLE_DATA];
          if (specificMessage.errorMessage) {
            console.error(specificMessage.errorMessage);
            postMessage({
              command: Commands.ALERT,
              text: specificMessage.errorMessage,
            });
            setErrorMessage(specificMessage.errorMessage);
            setIsLoading(false);
            return;
          }

          const results = specificMessage.payload;
          const queryResults = results || {};
          setData(queryResults);

          setIsLoading(false);
          break;
        case Commands.CREATE_FILTERED_DIAGRAM:
          specificMessage =
            message as CommandStructures[Commands.CREATE_FILTERED_DIAGRAM];
          /* Hacky way to prevent this command from preemptively setting isLoading
            to false before loadedTableData finishes processing */
          let shouldShowLoader = !isLoading;
          if (shouldShowLoader) setIsLoading(true);

          const filterResults = specificMessage.payload;
          const filteredIris = filterResults.iriArray || [];
          const filterObject = filterResults.rowTypesObject || null;
          setFilter({ iris: filteredIris, filterObject });

          if (shouldShowLoader) setIsLoading(false);
          break;

        case "updateLocalValue":
          postMessage({
            command: Commands.GENERATE_TABLE_DATA,
            payload: {
              webviewPath: webviewPath,
              queries: layout.queries,
            },
          });
          break;

        case Commands.CREATE_QUERY:
          specificMessage = message as CommandStructures[Commands.CREATE_QUERY];
          postMessage({
            command: Commands.CREATE_QUERY,
            query: message.query,
            selectedElements: message.selectedElements,
          });
          postMessage({
            command: Commands.REFRESH_TABLE_DATA,
          });
          break;

        case Commands.READ_QUERY:
          specificMessage = message as CommandStructures[Commands.READ_QUERY];
          postMessage({
            command: Commands.READ_QUERY,
            query: message.query,
            selectedElements: message.selectedElements,
          });
          postMessage({
            command: Commands.REFRESH_TABLE_DATA,
          });
          break;

        case Commands.UPDATE_QUERY:
          specificMessage = message as CommandStructures[Commands.UPDATE_QUERY];
          postMessage({
            command: Commands.UPDATE_QUERY,
            query: message.query,
            selectedElements: message.selectedElements,
            before_parameters: message.parameters,
            after_parameters: message.parameters,
          });
          postMessage({
            command: Commands.REFRESH_TABLE_DATA,
          });
          break;

        case Commands.DELETE_QUERY:
          specificMessage = message as CommandStructures[Commands.DELETE_QUERY];
          postMessage({
            command: Commands.DELETE_QUERY,
            query: message.query,
            selectedElements: message.selectedElements,
          });
          postMessage({
            command: Commands.REFRESH_TABLE_DATA,
          });
          break;

        case Commands.LOADED_ALL_ELEMENT_RELATIONS:
          specificMessage =
            message as CommandStructures[Commands.LOADED_ALL_ELEMENT_RELATIONS];
          setRelations(message.payload.relations);

        case Commands.LOADED_ALL_INSTANCE_CATEGORIES:
          specificMessage =
            message as CommandStructures[Commands.LOADED_ALL_INSTANCE_CATEGORIES];
          setInstances(message.payload.instances);
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, [layouts, isLoadingLayoutContext]);

  const createPageContent = useMemo(() => {
    if (!diagramLayout || Object.keys(data).length === 0) {
      return { nodes: [], edges: [], legendItems: [] };
    }
    return mapDiagramValueData(
      diagramLayout,
      data,
      filter.iris,
      filter.filterObject
    );
  }, [data, filter, diagramLayout]);

  /**  
    This function handles when a node is clicked in the Diagram View.  
    @remarks This method uses the {@link https://react.dev/reference/react/useCallback | useCallback} React hook
    @param node - The node and its data that is clicked
  */
  const handleClickNode = useCallback((node: ITableData) => {
    // Every row should have an IRI, but if somehow it doesn't,
    // hide the properties sheet.
    if (!node.data.iri) {
      postMessage({
        command: Commands.HIDE_PROPERTIES,
      });
      return;
    }

    postMessage({
      command: Commands.ROW_CLICKED,
      payload: node.data.iri,
    });
  }, []);

  /**  
    This function handles when a node is double clicked in the Diagram View.  
    @remarks This method uses the {@link https://react.dev/reference/react/useCallback | useCallback} React hook
    @param node - The node and its data that is clicked
  */
  const handleDoubleClickNode = useCallback((node: ITableData) => {
    // If there is a iri in the node's data then execute the command to open the modal.
    if (node.data.iri) {
      openWizard("RelationElementsWizard", { iriArray: [node.data.iri] });
      // UI indication to users
      postMessage({
        command: Commands.INFORM,
        text: "Opening Relations Wizard...",
      });
    }
  }, []);

  const refreshData = () => {
    setIsLoading(true);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        webviewPath: webviewPath,
        queries: diagramLayout?.queries ?? {},
      },
    });
  };

  if (isLoading || isLoadingLayoutContext) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Loading diagram..."} />
      </div>
    );
  }

  return (
    <div
      className="table-container"
      data-vscode-context={`{"webviewPath": "${webviewPath}"}`}
    >
      {/* We don't check if edges exist in case of edgeless graph w*/}
      {createPageContent.nodes.length > 0 && diagramLayout != null ? (
        <ReactFlowProvider>
          <Diagram
            initData={createPageContent}
            instances={instances}
            relations={relations}
            webviewPath={webviewPath}
            hasFilter={filter.iris.length > 0}
            clearFilter={() => setFilter({ iris: [], filterObject: null })}
            onNodeClicked={handleClickNode}
            onNodeDoubleClicked={handleDoubleClickNode}
            // TODO: Use onNodeSelected while node is highlighted/selected
            onNodeSelected={handleClickNode}
            modelCommands={commands}
            layout={diagramLayout}
          />
        </ReactFlowProvider>
      ) : (
        <div className="h-screen flex flex-col text-center space-y-4 justify-center items-center">
          <p className="text-[color:var(--vscode-foreground)]">
            {errorMessage ? errorMessage : "No data found"}
          </p>
          <VSCodeButton onClick={refreshData}>
            Refresh
            <span slot="start" className="codicon codicon-refresh"></span>
          </VSCodeButton>
        </div>
      )}
    </div>
  );
};

export default DiagramView;
