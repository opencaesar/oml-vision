import React, { useState } from 'react'
import {
  IconChevronRight,
  IconChevronDown,
  IconChevronUp
} from '@nasa-jpl/react-stellar'
import { cloneDeep } from 'lodash';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import useResizeObserver from "use-resize-observer";
import escaperegexp from 'lodash.escaperegexp'
import { NodeApi, NodeRendererProps, Tree as ArboristTree, TreeApi } from "react-arborist";
import ITableData from '../../interfaces/ITableData'
import './Tree.css'
import { FillFlexParent } from './FillFlexParent';
import { TreeLayout } from '../../interfaces/DataLayoutsType';
import { useWizards } from '../../contexts/WizardController';
import { useVisionTree } from './use-vision-tree';
import useContextMenu from '../ContextMenu/useContextMenu';
import ContextMenu from '../ContextMenu/ContextMenu';

const INDENT_STEP = 30;

function flattenRows(data: ITableData[]) {
  const flattened: ITableData[] = [];

  const helper = (rows: ITableData[]) => {
    for (const row of rows) {
      flattened.push(row);
      if (row.children) {
        helper(row.children);
      }
    }
  };

  helper(data);
  return flattened;
}

function Tree({
  className,
  rowData,
  webviewPath,
  modelCommands,
  layout,
  onClickRow = () => { }
}: {
  className?: string
  rowData: ITableData[]
  webviewPath: string
  modelCommands: Record<string, Record<string, any>>;
  layout: TreeLayout
  onClickRow?: Function
}) {
  const { openWizard } = useWizards();
  const { rightClick, setRightClick, coordinates, setCoordinates } =
    useContextMenu();
  const { data, onToggle, onMove } = useVisionTree(rowData);
  const [currentTree, setCurrentTree] = useState<TreeApi<ITableData> | null | undefined>(null);
  const [currentRowData, setCurrentRowData] = useState<ITableData[]>(rowData);
  const [flatData, setFlatData] = useState<ITableData[]>([]);
  const [active, setActive] = useState<ITableData | null>(null);
  const [isAllRowsExpanded, setIsAllRowsExpanded] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<NodeApi<ITableData>[]>([]);
  const [count, setCount] = useState(0);
  const [focused, setFocused] = useState<ITableData | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ITableData[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const { ref: headerRef, height: headerHeight = 0 } = useResizeObserver({ box: "border-box" });

  React.useEffect(() => {
    // flat data used for search functionality
    const flatData = flattenRows(data);
    setFlatData(flatData);
  }, [data]);

  React.useEffect(() => {
    setCount(currentTree?.visibleNodes.length ?? 0);
  }, [currentTree, searchTerm]);

  const toggleExpandOrCollapseAll = () => {
    setIsAllRowsExpanded(previousExpansionState => {

      if (previousExpansionState === false) currentTree?.openAll();
      else currentTree?.closeAll();

      return !previousExpansionState
    });
  }

  const navigateResults = (forward: boolean) => {
    setCurrentResultIndex(prev => {
      let id;
      if (forward) {
        id = (prev + 1) % searchResults.length
      } else {
        id = prev > 0 ? prev - 1 : searchResults.length - 1
      }
      if (searchResults.length === 0 || id > searchResults.length) return -1;
      currentTree?.scrollTo(searchResults[id].id, "auto")
      return id;
    });
  };
  // Used for handling Context Menu data-vscode-context (useMemo makes operation more efficient)
  const { iriArray, labelArray, maturityArray, shouldAllowDelete, rowTypesObject } = React.useMemo(() => {
    return selectedRows.reduce<{ iriArray: string[], labelArray: string[], maturityArray: string[], shouldAllowDelete: boolean, rowTypesObject: Record<string, string[]> }>((acc, node: NodeApi<ITableData>) => {
      acc.iriArray.push(node.data.iri);
      acc.maturityArray.push(node.data.maturity || "");
      acc.shouldAllowDelete = acc.shouldAllowDelete
        && !["Baseline", "Retracted", "Deprecated"].includes(node.data.maturity || "")
        && node.data.shouldAllowDelete === true;
      acc.labelArray.push(node.data.name);
      
      // Check if the rowType already exists in rowTypesObject, if not add a new array
      if (!acc.rowTypesObject[node.data.rowType]) {
        acc.rowTypesObject[node.data.rowType] = [];
      }

      // Add the iri to the corresponding rowType array in rowTypesObject
      acc.rowTypesObject[node.data.rowType].push(node.data.iri);

      return acc;
    }, { iriArray: [], labelArray: [], maturityArray: [], shouldAllowDelete: true, rowTypesObject: {} });
  }, [selectedRows]);

  const oneRowTypeSelected = Object.keys(rowTypesObject).length === 1;
  const selectedRowType = oneRowTypeSelected ? Object.keys(rowTypesObject)[0] : '';
  const hasDiagram = !!layout.diagrams?.["all-rows"] || Object.keys(layout.diagrams || {}).includes(selectedRowType);
  const diagram = layout.diagrams?.["all-rows"] || (hasDiagram ? layout.diagrams?.[selectedRowType] : "");

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "f" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }
  };

  const handleDeleteRows = async (evt: React.KeyboardEvent, iriArray: string[], labelArray: string[]) => {
    if (evt.key !== "Backspace" || iriArray.length === 0 || shouldAllowDelete === false) return;
    openWizard("DeleteElementsWizard", { iriArray, labelArray })
  }

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [iriArray, searchResults, currentResultIndex]);

  return (
    <div
      className={`${className} flex-1 w-full h-screen min-h-0 min-w-0 overflow-none`}
      // Set context to handle Context Menus for right click row events
      data-vscode-context={`{
        "rowType": "${selectedRowType}",
        "iri": ${JSON.stringify(iriArray)},
        "rowTypesObject": ${JSON.stringify(rowTypesObject)},
        "labelArray": ${JSON.stringify(labelArray)},
        "maturityArray": ${JSON.stringify(maturityArray)},
        "shouldAllowDelete": ${shouldAllowDelete},
        "hasDiagram": ${hasDiagram},
        ${hasDiagram ? `"diagram": "${diagram}"` : ""}
      }`}
    >
      <div className="tree-header" ref={headerRef}>
        <div className="flex justify-between items-center h-full border-box">
          <div className="flex w-1/3">
            <button
              {...{
                onClick: (e) => {
                  e.stopPropagation();
                  toggleExpandOrCollapseAll();
                },
                className: "flex"
              }}
            >
              {isAllRowsExpanded ?
                <IconChevronDown
                  className="pr-[8px] flex-shrink-0 flex-grow-0"
                  color="white"
                  width="20"
                  height="20"
                /> :
                <IconChevronRight
                  className="pr-[8px] flex-shrink-0 flex-grow-0"
                  color="white"
                  width="20"
                  height="20"
                />
              }
            </button>
          </div>
          <div className="w-2/3 flex items-center">
            <VSCodeTextField
              // @ts-ignore
              ref={searchInputRef}
              className="vscode-input-rounded w-1/2 mt-[1.25px]"
              type="text"
              value={(searchTerm ?? '') as string}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  navigateResults(true);
                }
              }}
              onInput={e => {
                // @ts-ignore
                const newSearchTerm = e.currentTarget.value;
                setSearchTerm(newSearchTerm);
                const newResults = newSearchTerm
                  ? flatData.filter(node => node.name.toLowerCase().includes(newSearchTerm.toLowerCase()))
                  : [];
                setSearchResults(newResults);
                setCurrentResultIndex(newResults.length > 0 ? 0 : -1);
                if (newResults.length > 0) currentTree?.scrollTo(newResults[0].id, "auto")
              }}
              placeholder={`Search...`}
            />
            {searchResults.length > 0 && (
              <div className="flex w-1/2 items-center">
                <button
                  onClick={() => navigateResults(false)}
                  className="ml-2"
                >
                  <IconChevronUp
                    className="pr-[8px] flex-shrink-0 flex-grow-0"
                    color="white"
                    width="20"
                    height="20"
                  />
                </button>
                <button
                  onClick={() => navigateResults(true)}
                  className="ml-2"
                >
                  <IconChevronDown
                    className="pr-[8px] flex-shrink-0 flex-grow-0"
                    color="white"
                    width="20"
                    height="20"
                  />
                </button>
                <div className="ml-2 text-[color:var(--vscode-foreground)] opacity-75 text-xs">
                  {`${currentResultIndex + 1}/${searchResults.length}`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <FillFlexParent headerHeight={headerHeight} onKeyDown={e => handleDeleteRows(e, iriArray, labelArray)}>
        {(dimens) => (
          <ArboristTree
            {...dimens}
            data={data}
            selectionFollowsFocus={true}
            disableMultiSelection={false}
            ref={(t) => setCurrentTree(t)}
            openByDefault={false}
            selection={active?.id}
            className={'vision-tree'}
            rowClassName={'row'}
            rowHeight={38}
            indent={INDENT_STEP}
            overscanCount={8}
            disableEdit={true}
            onMove={onMove}
            onSelect={(selected) => setSelectedRows(selected)}
            onActivate={(node) => { setActive(node.data); onClickRow(node.data) }}
            onFocus={(node) => setFocused(node.data)}
            onToggle={() => {
              if (isAllRowsExpanded) setIsAllRowsExpanded(false);
              setTimeout(() => {
                setCount(currentTree?.visibleNodes.length ?? 0);
              });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setRightClick(true);
              setCoordinates({
                x: e.pageX,
                y: e.pageY,
              });
            }}
          >
            {(props) =>
              <Node
                {...props}
                oneRowTypeSelected={oneRowTypeSelected}
                selectedRowType={selectedRowType}
                searchTerm={searchTerm}
                searchResults={searchResults}
                currentResultIndex={currentResultIndex}
              />}
          </ArboristTree>
        )}
      </FillFlexParent>
      {rightClick && (
        <ContextMenu
          selectedElements={selectedRows}
          top={coordinates.y}
          left={coordinates.x}
          modelCommands={modelCommands}
          layout={layout}
        />
      )}
    </div>
  )
}

function Node({
  node,
  tree,
  style,
  dragHandle,
  oneRowTypeSelected,
  selectedRowType,
  searchTerm,
  searchResults,
  currentResultIndex
}: NodeRendererProps<ITableData> & {
  oneRowTypeSelected: boolean,
  selectedRowType: string,
  searchTerm: string,
  searchResults: ITableData[],
  currentResultIndex: number
}) {
  const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`);
  const isCurrentResult = searchResults[currentResultIndex]?.id === node.data.id;

  const createHighlight = (text: string, highlight: string) => {
    return text.split(new RegExp(`(${escaperegexp(highlight)})`, 'gi')).map((chunk, i) => (
      chunk.toLowerCase() === highlight.toLowerCase() ?
        <span key={i} className={`highlighted-text ${isCurrentResult && 'currently-selected'}`}>{chunk}</span> :
        chunk
    ));
  };

  return (
    <div
      ref={dragHandle}
      style={style}
      className={`node ${node.willReceiveDrop && 'will-receive-drop'}`}
      // use onMouseDown instead of onContextMenu to avoid issues with
      // vscode context `preventDefaultContextMenuItems`
      onMouseDown={async (e) => {
        // on right-click IF row isn't selected
        if (e.button === 2 && !node.isSelected) {
          // highlight row just like left click without shift/cmd click
          tree.deselectAll()
          node.select()
          node.activate()
        }
      }}
      data-vscode-context={`{
        "oneRowTypeSelected": ${oneRowTypeSelected && node.data.rowType == selectedRowType},
        "preventDefaultContextMenuItems": true}
      `}
    >
      <div className={'flex p-[var(--st-table-th-padding)]'}>
        <div className={'indentLines'}>
          {new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
            return <div key={index}></div>;
          })}
        </div>
        <FolderArrow onClick={() => node.isInternal && node.toggle()} node={node} />
        <span className={'text'}>
          {searchTerm ? createHighlight(node.data.name, searchTerm) : node.data.name}
        </span>
      </div>
    </div>
  );
}

// to be repurposed for value editing
function Input({ node }: { node: NodeApi<ITableData> }) {
  return (
    <VSCodeTextField
      autoFocus
      className="vscode-input-rounded"
      // @ts-ignore
      type="text"
      // @ts-ignore
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()}
      value={node.data.name}
      onKeyDown={(e) => {
        if (e.key === "Escape") node.reset();
        // @ts-ignore
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
}

function FolderArrow({ node, onClick }: { node: NodeApi<ITableData>; onClick: () => void }) {
  return (
    node.isInternal ? (
      <button
        {...{
          onClick: (e) => {
            e.stopPropagation();
            onClick();
          },
          className: "cursor-pointer",
        }}
      >
        {node.isOpen ? (
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
    ) : null
  );
}

export default Tree