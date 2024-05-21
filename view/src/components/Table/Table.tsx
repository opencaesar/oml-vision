import React from "react";
import {
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
} from "@nasa-jpl/react-stellar";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  ColumnSort,
  SortingState,
  flexRender,
  Row
} from '@tanstack/react-table'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useWizards } from '../../providers/WizardController'
import { getLifecycleStateStyles, getRowRange } from './tableUtils'
import ITableData from '../../interfaces/ITableData'
import ITableDataQuery from '../../interfaces/ITableDataQuery'
import { TableLayout } from '../../interfaces/DataLayoutsType'
import TableFilter from './TableFilter'
import './Table.css'
import useContextMenu from "../ContextMenu/useContextMenu";
import ContextMenu from "../ContextMenu/ContextMenu";
import { TableFontSizeType } from "../../interfaces/TableFontSizeType";
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";

const MIN_SIZE = 100;
const SIZE = 250;

function Table({
  className,
  rowData,
  columnData,
  fetchSize = 25,
  modelCommands,
  layout,
  onClickRow = () => {},
  onRightClickRow = () => {},
}: {
  className?: string;
  rowData: ITableData[];
  columnData: string[];
  fetchSize?: number;
  modelCommands: Record<string, Record<string, any>>;
  layout: TableLayout;
  onClickRow?: Function;
  onRightClickRow?: Function;
}) {
  const { openWizard } = useWizards();
  const { rightClick, setRightClick, coordinates, setCoordinates } =
    useContextMenu();
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [fontSize, setFontSize] = React.useState<TableFontSizeType>("medium");
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const lastSelectedId = React.useRef<string>();

  // Set the Font Size
  React.useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.style.setProperty("--font-size", `${fontSize}`);
    }
  }, [fontSize]);

  // We always have a predefined first "_" column for
  // the special labelFormat field in tableLayouts.json
  const columns: ColumnDef<ITableData, any>[] = ["_", ...columnData].map(
    (item, index) => {
      if (index === 0) {
        return {
          id: item,
          header: ({ table }) => (
            <div className={`flex items-center`}>
              <>
                <button
                  {...{
                    onClick: (e) => {
                      e.stopPropagation();
                      table.getToggleAllRowsExpandedHandler()(e);
                    },
                  }}
                >
                  {table.getIsAllRowsExpanded() ? (
                    <IconChevronDown
                      className="pr-[8px] flex-shrink-0 flex-grow-0"
                      color="white"
                      width="20"
                      height="20"
                    />
                  ) : (
                    <IconChevronRight
                      className="pr-[8px] flex-shrink-0 flex-grow-0"
                      color="white"
                      width="20"
                      height="20"
                    />
                  )}
                </button>{" "}
                {item === "_" ? "" : item}
              </>
            </div>
          ),
          accessorFn: (row) => row[item],
          cell: ({ row, getValue }) => (
            <div
              className={`flex items-center`}
              style={{
                // use the row.depth property and paddingLeft
                // to visually indicate the depth of the row
                paddingLeft: `${row.depth * 1.4}rem`,
              }}
            >
              <>
                {row.getCanExpand() ? (
                  <button
                    {...{
                      onClick: (e) => {
                        e.stopPropagation();
                        row.getToggleExpandedHandler()();
                      },
                      style: { cursor: "pointer" },
                    }}
                  >
                    {row.getIsExpanded() ? (
                      <IconChevronDown
                        className="pr-[8px] flex-shrink-0 flex-grow-0"
                        color="white"
                        width="20"
                        height="20"
                      />
                    ) : (
                      <IconChevronRight
                        className="pr-[8px] flex-shrink-0 flex-grow-0"
                        color="white"
                        width="20"
                        height="20"
                      />
                    )}
                  </button>
                ) : (
                  <div className="w-[20px]"></div> // makes the value even with or without chevron
                )}{" "}
                {getValue()}
              </>
            </div>
          ),
          minSize: MIN_SIZE,
          size: SIZE,
        };
      }

      return {
        id: item,
        accessorFn: (row) => row[item],
        header: () => (item === "_" ? "" : item),
        cell: (info) => info.getValue(),
        minSize: MIN_SIZE,
      };
    }
  );

  const fetchData = (start: number, size: number, sorting: SortingState) => {
    const allRows = [...rowData];

    // Handle sorting the data
    if (sorting.length) {
      const sort = sorting[0] as ColumnSort;
      const { id, desc } = sort as { id: keyof ITableData; desc: boolean };
      allRows.sort((a, b) => {
        if (desc) {
          return a[id] < b[id] ? 1 : -1;
        }
        return a[id] > b[id] ? 1 : -1;
      });
    }

    return {
      data: allRows.slice(start, start + size),
      meta: {
        totalRowCount: allRows.length,
      },
    };
  };

  const { data, fetchNextPage, isError, isFetching, isLoading } =
    useInfiniteQuery<ITableDataQuery>({
      queryKey: ["table-data", columnFilters, sorting, JSON.stringify(rowData)], // adding sorting state as key causes table to reset and fetch from new beginning upon sort
      queryFn: async ({ pageParam = 0 }) => {
        const start = pageParam * fetchSize;
        const fetchedData = fetchData(start, fetchSize, sorting);
        return fetchedData;
      },
      getNextPageParam: (_lastGroup, groups) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    });

  // we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  // //called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (
          scrollHeight - scrollTop - clientHeight < 300 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount]
  );

  const handleRowSelect = async (
    evt: React.MouseEvent,
    row: Row<ITableData>
  ) => {
    if (evt.ctrlKey || evt.metaKey) {
      row.toggleSelected(true);
    } else if (evt.shiftKey && lastSelectedId?.current) {
      const { rows, rowsById } = table.getRowModel();
      const rowsToToggle = getRowRange(rows, row.id, lastSelectedId?.current);
      const isLastSelected = rowsById[lastSelectedId?.current].getIsSelected();
      rowsToToggle.forEach((row) => row.toggleSelected(isLastSelected));
    } else {
      await table.resetRowSelection(false);
      row.toggleSelected(true);
      onClickRow(evt, row);
    }

    lastSelectedId.current = row.id;
  };

  const handleDeleteRows = async (
    evt: React.KeyboardEvent,
    iriArray: string[],
    labelArray: string[]
  ) => {
    if (
      evt.key !== "Backspace" ||
      iriArray.length === 0 ||
      shouldAllowDelete === false
    )
      return;
    openWizard("DeleteElementsWizard", { iriArray, labelArray });
  };

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      columnFilters,
      expanded,
      sorting,
      rowSelection,
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetExpanded: false,
    enableSubRowSelection: false,
    filterFromLeafRows: true,
    debugTable: true,
  });

  React.useEffect(() => {
    // Any selected rows after a deletion event were deleted, so deselect them
    const deselectDeletedRows = () => {
      table.toggleAllRowsSelected(false);
    };

    window.addEventListener("deleteSuccess", deselectDeletedRows);
    return () =>
      window.removeEventListener("deleteSuccess", deselectDeletedRows);
  }, []);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: rows.length,
    overscan: 10,
    estimateSize: React.useCallback(() => 35, []),
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // Used for handling Context Menu data-vscode-context
  // (useMemo makes operation more efficient and calculates selected rows each time a new row is selected)
  const selectedRowModel = React.useMemo(() => {
    return table.getSelectedRowModel();
  }, [table.getSelectedRowModel()]);

  const {
    iriArray,
    labelArray,
    maturityArray,
    shouldAllowDelete,
    rowTypesObject,
  } = React.useMemo(() => {
    return selectedRowModel.flatRows.reduce<{
      iriArray: string[];
      labelArray: string[];
      maturityArray: string[];
      shouldAllowDelete: boolean;
      rowTypesObject: Record<string, string[]>;
    }>(
      (acc, row: Row<ITableData>) => {
        acc.iriArray.push(row.original.iri);
        acc.maturityArray.push(row.original.maturity || "");
        acc.shouldAllowDelete =
          acc.shouldAllowDelete &&
          !["Baseline", "Retracted", "Deprecated"].includes(
            row.original.maturity || ""
          ) &&
          row.original.shouldAllowDelete === true;
        // _ is the formatted label key
        acc.labelArray.push(row.original._);

        // Check if the rowType already exists in rowTypesObject, if not add a new array
        if (!acc.rowTypesObject[row.original.rowType]) {
          acc.rowTypesObject[row.original.rowType] = [];
        }

        // Add the iri to the corresponding rowType array in rowTypesObject
        acc.rowTypesObject[row.original.rowType].push(row.original.iri);

        return acc;
      },
      {
        iriArray: [],
        labelArray: [],
        maturityArray: [],
        shouldAllowDelete: true,
        rowTypesObject: {},
      }
    );
  }, [selectedRowModel]);

  const oneRowTypeSelected = Object.keys(rowTypesObject).length === 1;
  const selectedRowType = oneRowTypeSelected
    ? Object.keys(rowTypesObject)[0]
    : "";
  const hasDiagram =
    !!layout.diagrams?.["all-rows"] ||
    Object.keys(layout.diagrams || {}).includes(selectedRowType);
  const diagram =
    layout.diagrams?.["all-rows"] ||
    (hasDiagram ? layout.diagrams?.[selectedRowType] : "");

  return (
    <div
      className={`${className} w-full h-screen overflow-auto`}
      onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      ref={tableContainerRef}
    >
      <table className={"vision-table"}>
        <thead className="text-left bg-opacity-gray rounded-md">
          <div className="vision-table-visible">
            <div className="">
              <div className="vision-table-visible-header">Hide/Show Columns</div>
              <div className="vision-table-visible-select">
                <label>
                  <input
                    {...{
                      type: "checkbox",
                      checked: table.getIsAllColumnsVisible(),
                      onChange: table.getToggleAllColumnsVisibilityHandler(),
                    }}
                  />{" "}
                  Toggle All
                </label>
                {table.getAllLeafColumns().map((column) => {
                  return (
                    <div key={column.id} className="px-1">
                      <label>
                        <input
                          {...{
                            type: "checkbox",
                            checked: column.getIsVisible(),
                            onChange: column.getToggleVisibilityHandler(),
                          }}
                        />{" "}
                        {column.id}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={`flex flex-col`}>
              <div className="font-bold mb-2">Font Size</div>
              <VSCodeDropdown
                className={``}
              >
                <VSCodeOption
                  onClick={() => setFontSize("x-small")}
                  value="x-small"
                  selected={fontSize === "x-small"}
                >
                  Extra Small
                </VSCodeOption>
                <VSCodeOption
                  onClick={() => setFontSize("small")}
                  value="small"
                  selected={fontSize === "small"}
                >
                  Small
                </VSCodeOption>
                <VSCodeOption
                  onClick={() => setFontSize("medium")}
                  value="medium"
                  selected={fontSize === "medium"}
                >
                  Medium
                </VSCodeOption>
                <VSCodeOption
                  onClick={() => setFontSize("large")}
                  value="large"
                  selected={fontSize === "large"}
                >
                  Large
                </VSCodeOption>
                <VSCodeOption
                  onClick={() => setFontSize("x-large")}
                  value="x-large"
                  selected={fontSize === "x-large"}
                >
                  Extra Large
                </VSCodeOption>
              </VSCodeDropdown>
            </div>
          </div>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={`font-normal text-[14px] ${
                    header.column.getCanSort() && "cursor-pointer select-none"
                  }`}
                  key={header.id}
                  style={{
                    width: header.getSize(),
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between h-full border-box">
                        <span>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        {{
                          asc: (
                            <IconChevronUp
                              className="pl-[8px] flex-shrink-0 flex-grow-0"
                              color="white"
                              width="20"
                              height="20"
                            />
                          ),
                          desc: (
                            <IconChevronDown
                              className="pl-[8px] flex-shrink-0 flex-grow-0"
                              color="white"
                              width="20"
                              height="20"
                            />
                          ),
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div className="flex items-center">
                          <TableFilter
                            column={header.column}
                            table={table}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                  <div
                    {...{
                      onClick: (e) => e.stopPropagation(),
                      onDoubleClick: () => header.column.resetSize(),
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `column-resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`,
                    }}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="text-left">
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index] as Row<ITableData>;
            return (
              <tr
                className={`select-none border-0
                  ${
                    row.original.maturity &&
                    getLifecycleStateStyles(row.original.maturity)
                  }
                  ${row.getIsSelected() && "row-selected"}`}
                data-index={virtualRow.index}
                id={row.id}
                key={row.id}
                ref={rowVirtualizer.measureElement}
                onClick={(e) => handleRowSelect(e, row)}
                onKeyDown={(e) => handleDeleteRows(e, iriArray, labelArray)}
                // use onMouseDown instead of onContextMenu to avoid issues with
                // vscode context `preventDefaultContextMenuItems`
                onMouseDown={async (e) => {
                  // on right-click IF row isn't selected
                  if (e.button === 2 && !row.getIsSelected()) {
                    // highlight row just like left click without shift/cmd click
                    await table.resetRowSelection(false);
                    row.toggleSelected(true);
                    onRightClickRow(e, row);
                  }
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setRightClick(true);
                  setCoordinates({
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
                // Set context to handle Context Menus for right click row events
                data-vscode-context={`{
                  "preventDefaultContextMenuItems": true,
                  "rowType": "${selectedRowType}",
                  "rowTypesObject": ${JSON.stringify(rowTypesObject)},
                  "oneRowTypeSelected": ${
                    oneRowTypeSelected &&
                    row.original.rowType == selectedRowType
                  },
                  "iri": ${JSON.stringify(iriArray)},
                  "labelArray": ${JSON.stringify(labelArray)},
                  "maturityArray": ${JSON.stringify(maturityArray)},
                  "shouldAllowDelete": ${shouldAllowDelete},
                  "hasDiagram": ${hasDiagram},
                  ${hasDiagram ? `"diagram": "${diagram}"` : ""}
                }`}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <td
                    tabIndex={cellIndex}
                    key={cellIndex}
                    style={{
                      width: cell.column.getSize(),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </tbody>
      </table>
      {rightClick && layout.contextMenu && (
        <ContextMenu
          selectedElements={iriArray}
          top={coordinates.y}
          left={coordinates.x}
          modelCommands={modelCommands}
          layout={layout}
        />
      )}
    </div>
  );
}

export default Table;
