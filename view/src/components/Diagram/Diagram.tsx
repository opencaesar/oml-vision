import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
} from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  ControlButton,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  useOnSelectionChange,
  useNodesInitialized,
  NodeProps,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
} from "reactflow";

// Icons
import { IconDownload } from "@nasa-jpl/react-stellar";
import LockIcon from "./Icons/Lock";
import UnlockIcon from "./Icons/Unlock";

import { toPng, toSvg } from "html-to-image";
import Loader from "../shared/Loader";
import ITableData from "../../interfaces/ITableData";
import { LegendItem } from "../../interfaces/LegendItemType";
import {
  VSCodeButton,
  VSCodeDropdown,
  VSCodeOption,
} from "@vscode/webview-ui-toolkit/react";
import { getLayoutedElements, useCanvasInteractivity } from "./diagramUtils";
import Legend from "./Legend";
import "reactflow/dist/style.css";
import "./Diagram.css";

const nodeTypes = {
  overlay: OverlayNode,
};

function Diagram({
  initData,
  tablePath,
  hasFilter,
  clearFilter = () => {},
  onNodeSelected = () => {},
}: {
  initData: {
    nodes: ITableData[];
    edges: Edge[];
    legendItems: LegendItem[];
  };
  tablePath: string;
  hasFilter: boolean;
  clearFilter: Function;
  onNodeSelected?: Function;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [autoLayout, setAutoLayout] = useState("");
  const diagramRef = useRef<HTMLDivElement>(null);
  const nodesInitialized = useNodesInitialized();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const { fitView } = useReactFlow();
  const { isInteractive, setInteractivity, toggleInteractivity } =
    useCanvasInteractivity();

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes);
      if (nodes.length === 1) {
        onNodeSelected(nodes[0]);
      }
    },
  });

  const highlightPath = (
    selectedNodes: Node[],
    nodes: Node[],
    edges: Edge[]
  ) => {
    // Empty Node[] to capture all selected incoming and outgoing nodes
    let allIncomers: Node[] = [];
    let allOutgoers: Node[] = [];

    // Loop over selected nodes to find all incoming and outgoing nodes.  Push to empty lists
    for (const n of selectedNodes) {
      const incomers = getIncomers(n, nodes, edges);
      const outgoers = getOutgoers(n, nodes, edges);
      allIncomers.push(...incomers);
      allOutgoers.push(...outgoers);
    }

    // Find the connected edges to the incoming and outgoing nodes
    const in_connected = getConnectedEdges(allIncomers, edges);
    const out_connected = getConnectedEdges(allOutgoers, edges);

    // Determine the edges that are not connected to any incoming or outgoing selected nodes
    let notConnected = edges.filter(
      (e) => !in_connected.some((in_e) => in_e.id === e.id)
    );
    notConnected = edges.filter(
      (e) => !out_connected.some((out_e) => out_e.id === e.id)
    );

    // Set the opacity of those edges to 25%
    notConnected.map((n) => {
      n.style = {
        ...n.style,
        opacity: 0.25,
      };
    });

    // Set the opacity of incoming edges to 25%
    in_connected.map((i) => {
      i.style = {
        ...i.style,
        opacity: 1,
      };
    });

    // Set the opacity of outgoing edges to 25%
    out_connected.map((o) => {
      o.style = {
        ...o.style,
        opacity: 1,
      };
    });

    // Combine the arrays while ensuring uniqueness based on the 'id' property
    const combinedArray = Array.from(
      new Set([...notConnected, ...out_connected, ...in_connected])
    );

    setEdges([...combinedArray]);
  };

  const unHighlightPath = (edges: Edge[]) => {
    // Set the opacity of all edges to 100%
    edges.map((e) => {
      e.style = {
        ...e.style,
        opacity: 1,
      };
    });

    setEdges([...edges]);
  };

  const onLayout = useCallback(
    ({ useInitialNodes = true }: { useInitialNodes?: boolean }) => {
      setIsLoading(true);
      const ns = useInitialNodes ? initData.nodes : nodes;
      const es = useInitialNodes ? initData.edges : edges;

      getLayoutedElements(ns, es, autoLayout).then((layoutedGraph) => {
        if (layoutedGraph) {
          setNodes(layoutedGraph.nodes || []);
          setEdges(layoutedGraph.edges || []);
          // This defaults nodesDraggable to false.
          setInteractivity(false);
          setIsLoading(false);
        }
      });
    },
    [initData, nodes, edges]
  );

  const getNodeColor = (node: Node) => {
    return node.style?.backgroundColor || "var(--vscode-editor-foreground)";
  };

  const pngDownloadDiagram = React.useCallback(() => {
    if (diagramRef.current === null) return;
    fitView();
    toPng(diagramRef.current, {
      filter: (node: any) =>
        !(
          node?.classList?.contains("react-flow__minimap") ||
          node?.classList?.contains("react-flow__controls") ||
          node?.classList?.contains("flow-panel")
        ),
    }).then((dataUrl: any) => {
      const a = document.createElement("a");
      a.setAttribute("download", `${tablePath}.png`);
      a.setAttribute("href", dataUrl);
      a.click();
    });
  }, [diagramRef]);

  const svgDownloadDiagram = React.useCallback(() => {
    if (diagramRef.current === null) return;
    fitView();
    toSvg(diagramRef.current, {
      filter: (node: any) =>
        !(
          node?.classList?.contains("react-flow__minimap") ||
          node?.classList?.contains("react-flow__controls") ||
          node?.classList?.contains("flow-panel")
        ),
    }).then((dataUrl: any) => {
      const a = document.createElement("a");
      a.setAttribute("download", `${tablePath}.svg`);
      a.setAttribute("href", dataUrl);
      a.click();
    });
  }, [diagramRef]);

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({});
  }, [initData, autoLayout]);

  useEffect(() => {
    if (nodesInitialized) {
      window.requestAnimationFrame(() => fitView());
    }
  }, [nodesInitialized]);

  // Used for handling Context Menu data-vscode-context (useMemo makes operation more efficient)
  // Add more fields if necessary
  const { iriArray } = React.useMemo(() => {
    return selectedNodes.reduce<{ iriArray: string[] }>(
      (acc, node: Node) => {
        acc.iriArray.push(node.data.iri);
        return acc;
      },
      { iriArray: [] }
    );
  }, [selectedNodes]);

  if (isLoading) {
    return (
      <div className="table-container h-screen flex justify-center">
        <Loader message={"Generating graph layout..."} />
      </div>
    );
  }

  return (
    <div
      className="w-screen h-screen"
      data-vscode-context={`{
        "preventDefaultContextMenuItems": true,
        "hasSelection": ${selectedNodes.length > 0},
        "iri": ${JSON.stringify(iriArray)}
      }`}
    >
      <ReactFlow
        ref={diagramRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onSelectionChange={(selectedElements) => {
          setSelectedNodes(selectedElements.nodes);
          if (selectedNodes.length > 0)
            highlightPath(selectedNodes, nodes, edges);
        }}
        onPaneClick={() => {
          setSelectedNodes([]);
          unHighlightPath(edges);
        }}
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
        nodesConnectable={false}
        fitView={true}
        minZoom={0.01}
      >
        {initData.legendItems.length > 0 && (
          <Panel className="flow-panel" position="top-left">
            <Legend items={initData.legendItems} />
          </Panel>
        )}
        <Panel className="flow-panel" position="top-right">
          <div className="flex items-center z-10 space-x-2 p-2 rounded shadow-md bg-[var(--vscode-banner-background)]">
            <VSCodeButton appearance="secondary" onClick={() => fitView()}>
              Fit View
              <span slot="start" className="codicon codicon-zoom-in"></span>
            </VSCodeButton>
            {hasFilter ? (
              <VSCodeButton
                appearance="secondary"
                onClick={() => clearFilter()}
              >
                Clear Filter
                <span slot="start" className="codicon codicon-filter"></span>
              </VSCodeButton>
            ) : (
              /* TODO: Implement Add Filter functionality */
              <VSCodeButton onClick={() => {}}>
                Add Filter
                <span slot="start" className="codicon codicon-filter"></span>
              </VSCodeButton>
            )}
          </div>
        </Panel>
        <Panel className="flow-panel" position="top-center">
          <div className="flex items-center z-10 space-x-2 p-2 rounded shadow-md bg-[var(--vscode-banner-background)]">
            <span slot="auto-layout">Auto Layout</span>
            <VSCodeDropdown
              // @ts-ignore
              onChange={(select: React.FormEvent<HTMLInputElement>) =>
                setAutoLayout(select.currentTarget.value)
              }
            >
              <VSCodeOption value="left">Left</VSCodeOption>
              <VSCodeOption value="right">Right</VSCodeOption>
              <VSCodeOption value="top">Top</VSCodeOption>
              <VSCodeOption value="bottom">Bottom</VSCodeOption>
            </VSCodeDropdown>
          </div>
        </Panel>
        <Controls className="flow-controls" showInteractive={false}>
          {/* Implemented custom interactive button to avoid disabling selection in diagram */}
          <ControlButton
            className="react-flow__controls-interactive"
            onClick={toggleInteractivity}
            title="toggle interactivity"
            aria-label="toggle interactivity"
          >
            {isInteractive ? <UnlockIcon /> : <LockIcon />}
          </ControlButton>
          <ControlButton
            onClick={pngDownloadDiagram}
            title="download diagram"
            aria-label="download diagram"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconDownload
                className="flex-shrink-0 flex-grow-0"
                color="var(--vscode-button-secondaryForeground)"
                width="16"
                height="16"
              />
              <span style={{ marginTop: "0.25px", fontSize: 9.5 }}>PNG</span>
            </div>
          </ControlButton>
          <ControlButton
            onClick={svgDownloadDiagram}
            title="download diagram"
            aria-label="download diagram"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <IconDownload
                className="flex-shrink-0 flex-grow-0"
                color="var(--vscode-button-secondaryForeground)"
                width="16"
                height="16"
              />
              <span style={{ marginTop: "0.25px", fontSize: 9.5 }}>SVG</span>
            </div>
          </ControlButton>
        </Controls>
        <MiniMap
          className="flow-mini-map"
          zoomable
          pannable
          nodeColor={getNodeColor}
        />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

function OverlayNode({ data, id }: NodeProps) {
  return (
    <div className="flex justify-center items-start w-full h-full">
      <div
        className="overlay-node__header text-center text-xxs px-0.5"
        style={{
          border: "1px solid red",
          background: "rgba(255, 0, 0, 0.2)",
        }}
        id={id}
      >
        {data.label}
      </div>
    </div>
  );
}

export default Diagram;
