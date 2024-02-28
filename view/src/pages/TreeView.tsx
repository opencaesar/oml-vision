import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import { postMessage } from "../utils/postMessage";
import { CommandStructures, Commands } from "../../../commands/src/commands";
import Tree from "../components/Tree/Tree";
import Loader from "../components/shared/Loader";
import ITableData from "../interfaces/ITableData";
import {
  mapTreeValueData,
  areArraysOfObjectsEqual,
} from "../components/Tree/treeUtils";
import { TreeLayout } from "../interfaces/DataLayoutsType";
import { LayoutPaths, useLayoutData } from "../contexts/LayoutProvider";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const TreeView: React.FC = () => {
  const { layouts, isLoadingLayoutContext } = useLayoutData();
  const [tablePath, setTablePath] = useState<string>("");
  const [data, setData] = useState<{ [key: string]: ITableData[] }>({});
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [treeLayout, setTreeLayout] = useState<TreeLayout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only start fetching data when context is loaded
    if (isLoadingLayoutContext) return;

    let treeLayouts: any = {};

    // layouts[LayoutPaths.Pages][1]["children"] comes from pages.json file structure and key-value pairs
    layouts[LayoutPaths.Pages][1]["children"].forEach((tree: any) => {
      if (tree.isTree) {
        // Locally scoped variable which is used to set the key of the JSON object
        let _path = "";
        // Path comes from the pages.json file with the .json file identifier
        _path = tree.path + ".json";
        // Use object spread to merge all trees into treeLayouts object
        treeLayouts = { ...treeLayouts, ...layouts[_path] };
      }
    });

    const root = document.getElementById("root");
    let tablePath = root?.getAttribute("data-table-path") || "";

    if (!tablePath) {
      setErrorMessage("No tree path specified");
      setIsLoading(false);
      return;
    } else if (Object.keys(treeLayouts).length === 0) {
      setErrorMessage("Tree layouts not found in `src/vision/layouts/trees`");
      setIsLoading(false);
      return;
    } else if (!treeLayouts.hasOwnProperty(tablePath)) {
      setErrorMessage("No JSON layout found for tree path: " + tablePath);
      setIsLoading(false);
      return;
    }

    const layout = treeLayouts[tablePath] as TreeLayout;
    setTreeLayout(layout);
    setTablePath(tablePath);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        tablePath: tablePath,
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
          // This prevents UI bugs in the tree view by looking at the queries & subViewMappings in the treeLayouts.json
          if (
            areArraysOfObjectsEqual({ ...specificMessage.payload }) &&
            Object.keys({ ...specificMessage.payload }).length > 2
          ) {
            console.error(
              "2 identical keys.  Fix queries & subRowMappings treeLayouts.json"
            );
            postMessage({
              command: Commands.ALERT,
              text: "2 identical keys.  Fix queries & subRowMappings treeLayouts.json",
            });
          }
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

        case Commands.UPDATE_LOCAL_VALUE:
          postMessage({
            command: Commands.GENERATE_TABLE_DATA,
            payload: {
              tablePath: tablePath,
              queries: layout.queries,
            },
          });
          break;
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, [layouts, isLoadingLayoutContext]);

  const createPageContent = useMemo(() => {
    if (!treeLayout || Object.keys(data).length === 0) {
      return [];
    }
    return mapTreeValueData(treeLayout, data);
  }, [data, treeLayout]);

  const refreshData = () => {
    setIsLoading(true);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        tablePath: tablePath,
        queries: treeLayout?.queries ?? {},
      },
    });
  };

  const handleClickRow = (tableRow: ITableData) => {
    // Every row should have an IRI, but if somehow it doesn't,
    // hide the properties sheet.
    if (!tableRow.iri) {
      postMessage({
        command: Commands.HIDE_PROPERTIES,
      });
      return;
    }

    postMessage({
      command: Commands.ROW_CLICKED,
      payload: tableRow.iri,
    });
  };

  if (isLoading || isLoadingLayoutContext) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Loading tree data..."} />
      </div>
    );
  }

  return (
    <div
      className="table-container"
      data-vscode-context={`{"tablePath": "${tablePath}"}`}
    >
      {createPageContent.length > 0 && treeLayout != null ? (
        <Tree
          className="w-auto"
          rowData={createPageContent}
          tablePath={tablePath}
          layout={treeLayout}
          onClickRow={handleClickRow}
        />
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

export default TreeView;
