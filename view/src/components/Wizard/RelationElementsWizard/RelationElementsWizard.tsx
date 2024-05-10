import React, { useEffect, useState, useMemo } from "react";
import Modal from "../../shared/Modal";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react";
import { useWizards } from "../../../providers/WizardController";
import { postMessage } from "../../../utils/postMessage";
import {
  CommandStructures,
  Commands,
} from "../../../../../commands/src/commands";
import Loader from "../../shared/Loader";
import { v4 as uuid } from "uuid";
import ITableData from "../../../interfaces/ITableData";
import "./RelationWizard.css";
import {
  Column,
  PaginationState,
  Table,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IconChevronDown, IconChevronUp } from "@nasa-jpl/react-stellar";

const INDENT_STEP = 30;

function RelationElementsWizard({
  labelArray,
  iriArray,
}: {
  labelArray?: string[];
  iriArray: string[];
}) {
  const [wizardId, setWizardId] = useState("");
  const [webviewPath, setWebviewPath] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [relations, setRelations] = useState<ITableData[]>([]);
  const { closeWizard } = useWizards();

  useEffect(() => {
    const root = document.getElementById("root");
    let webviewPath = root?.getAttribute("data-webview-path") || "";
    setWebviewPath(webviewPath);

    const wizardId = uuid();
    setWizardId(wizardId);

    postMessage({
      command: Commands.GET_ELEMENT_RELATIONS_TOTAL,
      wizardId: wizardId,
      payload: {
        webviewPath: webviewPath,
        iriArray: iriArray,
      },
    });
    const handler = (event: MessageEvent) => {
      const message = event.data;
      // Only use messages that originated from the same wizard
      if (message.wizardId !== wizardId) return;

      let specificMessage;
      switch (message.command) {
        case Commands.LOADED_ELEMENT_RELATIONS_TOTAL:
          specificMessage =
            message as CommandStructures[Commands.LOADED_ELEMENT_RELATIONS_TOTAL];
          if (specificMessage.errorMessage) {
            console.error(specificMessage.errorMessage);
            setErrorMessage(specificMessage.errorMessage);
            setIsLoading(false);
            return;
          }
          try {
            const results = specificMessage.payload.relations;
            if (results) {
              setRelations(results);
            } else {
              console.error("No relations for selected IRI!");
            }
          } catch (error) {
            let errorMessage = "";
            if (error instanceof SyntaxError) {
              errorMessage = `Failed to parse JSON data: ${error.message}`;
            } else {
              errorMessage = "Failed to parse JSON data: Invalid JSON format.";
            }

            // Send the error message back to the extension
            postMessage({
              command: Commands.ALERT,
              text: errorMessage,
            });
          }
          setIsLoading(false);
          break;
      }
    };
    window.addEventListener("message", handler);
    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  const refetchRelations = () => {
    setIsLoading(true);
    postMessage({
      command: Commands.GET_ELEMENT_RELATIONS_TOTAL,
      wizardId,
      payload: {
        webviewPath,
        iriArray,
      },
    });
  };

  return (
    <Modal
      className="h-fit w-3/5 max-w-3xl min-w-fit relative py-4 px-5"
      onClickOutside={() => closeWizard("RelationElementsWizard")}
    >
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="flex w-full items-center justify-between mb-4">
          <h1 className="modal-wizard-header pl-2.5 text-[var(--vscode-foreground)]">
            Relations
          </h1>
          <button
            type="button"
            onClick={() => closeWizard("RelationElementsWizard")}
            className="bg-transparent rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center text-[var(--vscode-icon-foreground)] hover:bg-[var(--vscode-toolbar-hoverBackground)]"
          >
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span className="sr-only">Close Modal</span>
          </button>
        </div>
        {!isLoading && !errorMessage ? (
          <div className="justify-left text-xs w-full px-2.5 py-1.5">
            This OML instance has the following OML instances and relations:
            <br />
            <a
              className="hover:underline text-[var(--vscode-charts-blue)] text-xxs w-full"
              href="http://www.opencaesar.io/oml/#Relations"
            >
              Please refer to the official OML docs to learn more about OML
              relations
            </a>
          </div>
        ) : (
          <div className="pt-4"></div>
        )}
        <div className="flex justify-center space-x-4 w-full px-2.5 pb-4">
          {isLoading ? (
            <Loader />
          ) : errorMessage ? (
            <p className="text-[color:var(--vscode-foreground)]">
              {errorMessage}
            </p>
          ) : (
            <div>
              <RelationTable data={relations}></RelationTable>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center space-x-4 w-full px-2.5 mt-4 mb-2.5">
          <div>
            {errorMessage !== "" && (
              <VSCodeButton
                appearance="primary"
                className="rounded-sm"
                onClick={refetchRelations}
              >
                Refetch Relations
                <span slot="start" className="codicon codicon-refresh"></span>
              </VSCodeButton>
            )}
          </div>
          <div className="flex space-x-4">
            <VSCodeButton
              appearance="secondary"
              type="button"
              onClick={() => closeWizard("RelationElementsWizard")}
              className="rounded-sm bg-[var(--vscode-button-secondaryBackground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]"
            >
              Exit
            </VSCodeButton>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default RelationElementsWizard;

const RelationTable: React.FC<{ data: ITableData[] }> = ({ data }) => {
  // Please refer to https://tanstack.com/table/latest/docs/framework/react/examples/pagination for an example
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // This will not cause an infinite loop of re-renders because `columns` is a stable reference.  Refer to https://tanstack.com/table/latest/docs/guide/data
  const columns = useMemo(
    () => [
      {
        header: "Verb",
        accessorKey: "verb",
      },
      {
        header: "Object",
        accessorKey: "object",
      },
    ],
    []
  );

  // This data is used to render an empty array if the data is undefined
  const backupData: ITableData = React.useMemo(() => [], []);

  const table = useReactTable({
    columns: columns,
    debugTable: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    //no need to pass pageCount or rowCount with client-side pagination as it is calculated automatically
    state: {
      pagination,
    },
    data: data ?? backupData,
  });

  return (
    <div className="p-1">
      <table className="relation-table flex-column w-full h-[40vh] overflow-y-auto overflow-x-hidden bg-[color:var(--vscode-panel-background)] rounded-md">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: (
                            <IconChevronUp
                              className="flex-shrink-0 flex-grow-0"
                              color="white"
                              width="12"
                              height="12"
                            />
                          ),
                          desc: (
                            <IconChevronDown
                              className="flex-shrink-0 flex-grow-0"
                              color="white"
                              width="12"
                              height="12"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div className="p-1">
                          <Filter column={header.column} table={table} />
                        </div>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="relation-table-buttons flex items-center gap-2">
        <VSCodeButton
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </VSCodeButton>
        <VSCodeButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </VSCodeButton>
        <VSCodeButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </VSCodeButton>
        <VSCodeButton
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </VSCodeButton>
        <span className="flex items-center gap-1">
          <div>Page</div>
          <strong>
            {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          | Go to page:
          <input
            type="number"
            defaultValue={table.getState().pagination.pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              table.setPageIndex(page);
            }}
            className="relation-table-go-to bg-[var(--vscode-background)] border p-1 w-16"
          />
        </span>
        <VSCodeDropdown
          value={table.getState().pagination.pageSize.toLocaleString()}
          onChange={(e) => {
            // @ts-ignore
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <VSCodeOption key={pageSize} value={pageSize.toLocaleString()}>
              Show {pageSize}
            </VSCodeOption>
          ))}
        </VSCodeDropdown>
        <div>
          Showing &thinsp;
          <strong>
            {table.getRowModel().rows.length.toLocaleString()} of{" "}
            {table.getCoreRowModel().rows.length.toLocaleString()} Rows
          </strong>
        </div>
      </div>
    </div>
  );
};

// Please refer to https://tanstack.com/table/latest/docs/framework/react/examples/pagination for an example
function Filter({
  column,
  table,
}: {
  column: Column<any, any>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  return typeof firstValue === "number" ? (
    <div
      className="relation-filter flex space-x-2"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            e.target.value,
            old?.[1],
          ])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <input
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ""}
        onChange={(e) =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            e.target.value,
          ])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : (
    <VSCodeTextField
      // @ts-ignore
      onInput={(e) => column.setFilterValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      placeholder={`Search...`}
      clientHeight={12}
      value={(columnFilterValue ?? "") as string}
    />
  );
}
