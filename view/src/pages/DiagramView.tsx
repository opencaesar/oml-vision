import React, { useState, useEffect, useMemo } from 'react';
import { postMessage } from '../utils/postMessage';
import { CommandStructures, Commands } from '../../../commands/src/commands';
import Diagram from '../components/Diagram/Diagram';
import Loader from '../components/shared/Loader';
import ITableData from '../interfaces/ITableData';
import { mapDiagramValueData } from '../components/Diagram/diagramUtils';
import { DiagramLayout } from '../interfaces/DataLayoutsType';
import { ReactFlowProvider } from 'reactflow';
import { LayoutPaths, useLayoutData } from '../contexts/LayoutProvider';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

const DiagramView: React.FC = () => {
  const { layouts, isLoadingLayoutContext } = useLayoutData();
  const [tablePath, setTablePath] = useState<string>("");
  const [diagramLayout, setDiagramLayout] = useState<DiagramLayout | null>(null);
  const [data, setData] = useState<{[key: string]: ITableData[]}>({});
  const [filter, setFilter] = useState<{ iris: string[], filterObject: Record<string, string[]> | null }>({ iris: [], filterObject: null });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only start fetching data when context is loaded
    if (isLoadingLayoutContext) return;

    const diagramLayouts = layouts[LayoutPaths.DiagramPanel] ?? {};
    const root = document.getElementById("root");
    let tablePath = root?.getAttribute("data-table-path") || "";

    if (!tablePath) {
      setErrorMessage("No diagram path specified");
      setIsLoading(false);
      return;
    } else if (Object.keys(diagramLayouts).length === 0) {
      setErrorMessage("Diagram layouts not found in `src/vision/layouts`");
      setIsLoading(false);
      return;
    } else if (!diagramLayouts.hasOwnProperty(tablePath)) {
      setErrorMessage("No JSON layout found for diagram path: " + tablePath);
      setIsLoading(false);
      return;
    }

    const layout = diagramLayouts[tablePath] as DiagramLayout;
    setDiagramLayout(layout);
    setTablePath(tablePath);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        tablePath: tablePath,
        queries: layout.queries,
      }
    });
    const handler = (event: MessageEvent) => {
      const message = event.data;

      let specificMessage;
      switch (message.command) {
        case Commands.LOADED_TABLE_DATA:
          specificMessage = message as CommandStructures[Commands.LOADED_TABLE_DATA];
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
          specificMessage = message as CommandStructures[Commands.CREATE_FILTERED_DIAGRAM]
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
        case 'updateLocalValue':
          postMessage({
            command: Commands.GENERATE_TABLE_DATA,
            payload: {
              tablePath: tablePath,
              queries: layout.queries,
            }
          });
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, [layouts, isLoadingLayoutContext]);

  const createPageContent = useMemo(() => {
    if (!diagramLayout || Object.keys(data).length === 0) {
        return { nodes: [], edges: [], legendItems: [] };
    }
    return mapDiagramValueData(diagramLayout, data, filter.iris, filter.filterObject);
  },
    [data, filter, diagramLayout],
  );

  const handleClickRow = (tableRow: ITableData) => {
    // Every row should have an IRI, but if somehow it doesn't,
    // hide the properties sheet.
    if (!tableRow.data.iri) {
      postMessage({
        command: Commands.HIDE_PROPERTIES,
      });
      return;
    };

    postMessage({
      command: Commands.ROW_CLICKED,
      payload: tableRow.data.iri,
    });
  }

  const refreshData = () => {
    setIsLoading(true);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        tablePath: tablePath,
        queries: diagramLayout?.queries ?? {},
      }
    });
  }

  if (isLoading || isLoadingLayoutContext) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Loading diagram..."} />
      </div>
    )
  }

  return (
    <div className="table-container" data-vscode-context={`{"tablePath": "${tablePath}"}`}>
      { /* We don't check if edges exist in case of edgeless graph w*/}
      {createPageContent.nodes.length > 0 ? (
        <ReactFlowProvider>
          <Diagram
            initData={createPageContent}
            tablePath={tablePath}
            hasFilter={filter.iris.length > 0}
            clearFilter={() => setFilter({ iris: [], filterObject: null })}
            onNodeSelected={handleClickRow}
          />
        </ReactFlowProvider>
      ) : (
        <div className='h-screen flex flex-col text-center space-y-4 justify-center items-center'>
          <p className='text-[color:var(--vscode-foreground)]'>{errorMessage ? errorMessage : "No data found"}</p>
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