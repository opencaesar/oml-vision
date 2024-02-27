import React, { useState, useEffect, useMemo, MouseEvent } from 'react';
import { postMessage } from '../utils/postMessage';
import { CommandStructures, Commands } from '../../../commands/src/commands';
import Table from '../components/Table/Table';
import Loader from '../components/shared/Loader'
import ITableData from '../interfaces/ITableData';
import { mapValueData } from '../components/Table/tableUtils';
import { TableLayout } from '../interfaces/DataLayoutsType';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { LayoutPaths, useLayoutData } from '../contexts/LayoutProvider';

const TableView: React.FC = () => {
  const { layouts, isLoadingLayoutContext } = useLayoutData();
  const [tablePath, setTablePath] = useState<string>("");
  const [data, setData] = useState<{[key: string]: ITableData[]}>({});
  const [columns, setColumns] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tableLayout, setTableLayout] = useState<TableLayout | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Only start fetching data when context is loaded
    if (isLoadingLayoutContext) return;

    const tableLayouts = layouts[LayoutPaths.TablePanel] ?? {};
    const root = document.getElementById("root");
    let tablePath = root?.getAttribute("data-table-path") || "";

    if (!tablePath) {
      setErrorMessage("No table path specified");
      setIsLoading(false);
      return;
    } else if (Object.keys(tableLayouts).length === 0) {
      setErrorMessage("Table layouts not found in `src/vision/layouts/tables`");
      setIsLoading(false);
      return;
    } else if (!tableLayouts.hasOwnProperty(tablePath)) {
      setErrorMessage("No JSON layout found for table path: " + tablePath);
      setIsLoading(false);
      return;
    }

    const layout = tableLayouts[tablePath] as TableLayout;
    setTableLayout(layout);
    setTablePath(tablePath);
    setColumns(Object.values(layout.columnNames));

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

        case Commands.UPDATE_LOCAL_VALUE:
          postMessage({
            command: Commands.GENERATE_TABLE_DATA,
            payload: {
              tablePath: tablePath,
              queries: layout.queries,
            }
          });
          break;

        case Commands.CLONED_ELEMENTS:
          postMessage({
            command: Commands.REFRESH_TABLE_DATA
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
    if (!tableLayout || Object.keys(data).length === 0) {
        return [];
    }
    return mapValueData(tableLayout, data);
  },
    [data, tableLayout],
  );

  const refreshData = () => {
    setIsLoading(true);

    postMessage({
      command: Commands.GENERATE_TABLE_DATA,
      payload: {
        tablePath: tablePath,
        queries: tableLayout?.queries ?? {},
      }
    });
  }


  const handleClickRow = (e: MouseEvent<HTMLTableRowElement, MouseEvent>, tableRow: ITableData) => {
    // Every row should have an IRI, but if somehow it doesn't,
    // hide the properties sheet.
    if (!tableRow.original.iri) {
      postMessage({
        command: Commands.HIDE_PROPERTIES
      });
      return;
    };

    postMessage({
      command: Commands.ROW_CLICKED,
      payload: tableRow.original.iri,
    });
  }

  if (isLoading || isLoadingLayoutContext) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Loading table data..."} />
      </div>
    )
  }

  return (
    <div className="table-container" data-vscode-context={`{"tablePath": "${tablePath}"}`}>
      {createPageContent.length > 0 &&
        tableLayout != null ? (
        <Table
          className='w-auto'
          rowData={createPageContent}
          columnData={columns}
          layout={tableLayout}
          onClickRow={handleClickRow}
        />
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

export default TableView;