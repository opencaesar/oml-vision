import { v4 as uuidv4 } from "uuid";
import ITableData from "../../interfaces/ITableData";
import {
  IRowMapping,
  DataLayoutsType,
  DiagramLayout,
  IDiagramRowMapping,
  IDiagramEdgeMapping,
  IDiagramOverlay,
} from "../../interfaces/DataLayoutsType";
import {
  Edge,
  MarkerType,
  Node,
  ReactFlowState,
  useStoreApi,
  Position,
  useStore,
} from "reactflow";
import "reactflow/dist/style.css";
import "./Diagram.css";
import ELK from "elkjs/lib/elk.bundled";
import { LegendItem } from "../../interfaces/LegendItemType";

const DEFAULT_NODE_COLORS = "#FFFFFF";
const DEFAULT_NODE_TEXT_COLORS = "#000000";

// Color generation function
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 100%, 75%)`;
};

/* Process the TREE json data into content
   that React-Table can render. */
export const mapDiagramValueData = (
  layout: DiagramLayout,
  // 'key' is the sparql query
  data: { [key: string]: ITableData[] },
  allFilteredIris: string[],
  filterObject: Record<string, string[]> | null
): {
  nodes: ITableData[];
  edges: Edge[];
  legendItems: LegendItem[];
} => {
  // Create a colorMap to store the edge's color associations
  const colorMap = new Map();

  // Filter nodes of filterType to only include matches for IRI
  let filteredData: { [key: string]: ITableData[] } = JSON.parse(
    JSON.stringify(data)
  );

  if (filterObject && Object.keys(filterObject).length > 0) {
    Object.entries(filterObject).forEach(([filterType, filteredIris]) => {
      filteredData[filterType] = (filteredData[filterType] || []).filter(
        (row) => {
          // Get all properties ending with 'Iri'
          const iriProps = Object.keys(row).filter((prop) =>
            prop.endsWith("Iri")
          );
          // Check each IRI property
          for (const prop of iriProps) {
            // If the property is a parent IRI and not included in allFilteredIris, delete it
            if (prop !== "iri" && !allFilteredIris.includes(row[prop])) {
              delete row[prop];
            }
          }

          return filteredIris.includes(row.iri);
        }
      );
    });

    // Obtain overlay and edge IDs
    const overlayIds = layout.overlays?.map((overlay) => overlay.id) || [];
    const edgeIds = layout.edges.map((edge) => edge.id);
    const allowedKeys = new Set([
      ...Object.keys(filterObject),
      ...overlayIds,
      ...edgeIds,
    ]);

    // Set all other keys in filteredData to empty array, other than overlays, edges and those in filterObject
    Object.keys(filteredData).forEach((key) => {
      if (!allowedKeys.has(key)) {
        filteredData[key] = [];
      }
    });
  }

  const processEntry = (
    entry: ITableData,
    rowMapping: IDiagramRowMapping | IDiagramOverlay,
    id: string,
    parentId?: string,
    extent?: "parent"
  ) => {
    const label = rowMapping.labelFormat.replace(
      /{([^}]+)}/g,
      (match, placeholder) => {
        const entry_placeholder = entry[placeholder];
        // Remove double quotes from string literal
        const format_entry_placeholder =
          typeof entry_placeholder === "string"
            ? entry[placeholder].replace(/['"]+/g, "")
            : entry[placeholder];
        return format_entry_placeholder || "";
      }
    );
    const iri = entry["iri"] || "";
    // @ts-ignore
    const edgeKey = rowMapping.edgeMatchKey ? entry[rowMapping.edgeMatchKey] || "" : null;
    // @ts-ignore
    const containmentId = rowMapping.attachesTo || null;

    // defines the node color
    // @ts-ignore
    const nodeColor = rowMapping.nodeColor || DEFAULT_NODE_COLORS;

    // defines the node text color
    // @ts-ignore
    const nodeTextColor = rowMapping.nodeTextColor || DEFAULT_NODE_TEXT_COLORS;

    // @ts-ignore
    const nodeType = rowMapping.nodeType || undefined;

    // Contained entries should be concatenated with a comma (see getFaultContainmentRegions query)
    // @ts-ignore
    const containedEntries = rowMapping.attachesTo ? entry[rowMapping.attachesTo].split(",") : null;

    // TODO: handle colorKey here from diagramLayouts, add to legend
    let processedEntry: ITableData = {
      id: id,
      position: { x: 0, y: 0 },
      type: nodeType,
      data: {
        label,
        iri,
        edgeKey,
        parentId,
        extent,
        containmentId,
        containedEntries,
        nodeColor,
        nodeTextColor
      },
    };

    if (containedEntries) {
      processedEntry.data.isOverlay = true;
    } else {
      processedEntry.data.containedId = rowMapping.id;
    }

    return processedEntry;
  };

  const flatNodes: ITableData[] = [];

  const recursiveMapper = (
    rowMapping: IDiagramRowMapping,
    parentId?: string,
    parentIri?: string,
    extent?: "parent",
    parentIdentifier?: string
  ): ITableData[] => {
    if (!filteredData[rowMapping.id]) return [];
    return (
      filteredData[rowMapping.id]
        .filter((row) => {
          // If there's no parentIri specified, we're looking for root nodes
          // If there is a parentIri, we're looking for children of a specific parent
          if (parentIri) {
            return row[`${parentId}Iri`] === parentIri;
          } else {
            return !row["parentIri"];
          }
        })
        // .slice(0, 5)
        .map((row: ITableData, index: number) => {
          let identifier = parentIdentifier
            ? `${parentIdentifier}-${index}`
            : `${index}`;
          let processedRow = processEntry(
            row,
            rowMapping,
            identifier,
            parentIdentifier,
            extent
          );

          let children: ITableData[] = [];

          /* If the row is recursive, get its children and add to allChildren
            Otherwise, check for subRowMappings */
          if (rowMapping.isRecursive) {
            children = recursiveMapper(
              rowMapping,
              "parent",
              row.iri,
              "parent",
              identifier
            );
          } else if (rowMapping.subRowMappings) {
            children = rowMapping.subRowMappings.flatMap(
              (subMapping: IDiagramRowMapping) =>
                recursiveMapper(
                  subMapping,
                  rowMapping.id,
                  row.iri,
                  "parent",
                  identifier
                )
            );
          }

          flatNodes.push(processedRow);
          if (children.length > 0) {
            processedRow["children"] = children;
            flatNodes.push(...children);
          }

          return processedRow;
        })
    );
  };

  const mapOverlayNodes = (overlay: IDiagramOverlay): ITableData[] => {
    if (!filteredData[overlay.id]) return [];
    return filteredData[overlay.id].map((row: ITableData) =>
      processEntry(row, overlay, uuidv4())
    );
  };

  const mapEdges = (
    edgeMapping: IDiagramEdgeMapping,
    edgeData: ITableData[]
  ): Edge[] => {
    let edges: Edge[] = [];

    edgeData.forEach((edge: ITableData) => {
      let sourceNode = flatNodes.find(
        (node: ITableData) => node.data.edgeKey === edge[edgeMapping.sourceKey]
      );
      let targetNode = flatNodes.find(
        (node: ITableData) => node.data.edgeKey === edge[edgeMapping.targetKey]
      );
      let flow = edge.flow || "=";
      let colorIdentifier = edge[edgeMapping.colorKey] || "";
      const label = edgeMapping.labelFormat.replace(
        /{([^}]+)}/g,
        (match, placeholder) => {
          return edge[placeholder] || "";
        }
      );

      if (sourceNode && targetNode) {
        let edgeId = `${sourceNode.id}-${targetNode.id}`;

        // Only add color to the map aka Legend if it exists, otherwise default and don't add to legend.
        if (colorIdentifier && !colorMap.has(colorIdentifier)) {
          colorMap.set(colorIdentifier, {
            color: stringToColor(colorIdentifier),
            isEdge: true,
          });
        }

        let color = colorIdentifier
          ? colorMap.get(colorIdentifier).color
          : "var(--vscode-banner-foreground)";

        let newEdge: Edge = {
          id: edgeId,
          label: label,
          source: sourceNode.id,
          target: targetNode.id,
          style: { stroke: color },
        };

        // Set direction of edge
        if (flow === "<" || flow === "=")
          newEdge.markerStart = {
            type: MarkerType.ArrowClosed,
            width: 30,
            height: 30,
          };
        if (flow === ">" || flow === "=")
          newEdge.markerEnd = {
            type: MarkerType.ArrowClosed,
            width: 30,
            height: 30,
          };

        edges.push(newEdge);
      }
    });

    return edges;
  };

  const startMappingFromAnyNode = (
    rowMapping: IDiagramRowMapping,
    filterObject: Record<string, string[]> | null
  ): ITableData[] => {
    if (!filterObject || (filterObject && filterObject[rowMapping.id])) {
      return recursiveMapper(rowMapping);
    } else if (rowMapping.subRowMappings) {
      return rowMapping.subRowMappings.flatMap((subMapping) =>
        startMappingFromAnyNode(subMapping, filterObject)
      );
    } else {
      return [];
    }
  };

  const nodes = startMappingFromAnyNode(layout.rowMapping, filterObject);
  const overlayNodes =
    layout.overlays?.flatMap((overlay) => mapOverlayNodes(overlay)) ?? [];
  nodes.push(...overlayNodes);
  const edges = layout.edges.flatMap((edgeLayout) =>
    mapEdges(edgeLayout, filteredData[edgeLayout.id])
  );
  const legendItems = Array.from(
    colorMap,
    ([label, { color, isEdge = false }]) => ({ label, color, isEdge })
  );

  return { nodes, edges, legendItems };
};

/* START React Flow Interactivity Toggle */

const isInteractiveSelector = (s: ReactFlowState) =>
  s.nodesDraggable && s.nodesConnectable;

export const useCanvasInteractivity = () => {
  const store = useStoreApi();
  const isInteractiveState = useStore(isInteractiveSelector);

  const setInteractivity = (isInteractive: boolean) => {
    store.setState({
      nodesDraggable: isInteractive,
      nodesConnectable: isInteractive,
    });
  };

  const toggleInteractivity = () => setInteractivity(!isInteractiveState);

  return {
    isInteractive: isInteractiveState,
    setInteractivity,
    toggleInteractivity,
  };
};

/* END React Flow Interactivity Toggle */

/* ELKjs Layouting Algorithm */
const DEFAULT_WIDTH = 150;
const DEFAULT_HEIGHT = 70;
const MARGIN = 10;
const PADDING = 25;

const elkOptions = {
  "elk.padding": "[left=50, top=75, right=50, bottom=50]",
  "elk.direction": "DOWN",
  "elk.algorithm": "layered",
  // "elk.hierarchyHandling": "SEPARATE_CHILDREN",
  // "elk.separateConnectedComponents": "false",
  "org.eclipse.elk.spacing.componentComponent": "50",
  "elk.spacing.nodeNode": "150",
  "elk.layered.spacing.nodeNodeBetweenLayers": "120",
  "elk.spacing.edgeEdge": "20",
  "elk.spacing.edgeNode": "20",
  "elk.spacing.edgeEdgeBetweenLayers": "50",
  "elk.edgeRouting": "ORTHOGONAL",
  // "elk.portAlignment.default": "DISTRIBUTED",
  // "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
  // "elk.layered.layering.coffmanGraham.layerBound": "4",
  // "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
  // "elk.layered.crossingMinimization.strategy": "INTERACTIVE",
  // "elk.layered.nodePlacement.favorStraightEdges": "true",
  // "elk.layered.nodePlacement.bk.edgeStraightening": "IMPROVE_STRAIGHTNESS",
  // "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
};

const elk = new ELK({
  defaultLayoutOptions: elkOptions,
});

const calculateNodeSize = (node: any, isHorizontal: boolean) => {
  if (!node.children || node.children.length === 0) {
    return { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
  }

  let totalWidth = 0;
  let totalHeight = 0;

  for (const child of node.children) {
    const childSize = calculateNodeSize(child, isHorizontal);
    totalWidth += childSize.width;
    totalHeight += childSize.height;
  }

  const childCount = node.children.length;
  totalWidth += (childCount - 1) * MARGIN; // MARGIN is the space between child nodes
  totalHeight += (childCount - 1) * MARGIN;

  return {
    width: Math.max(DEFAULT_WIDTH, totalWidth),
    height: Math.max(DEFAULT_HEIGHT, totalHeight),
  };
};

// A helper function that assigns a color to a node based on node and node text colors.
const assignNodeColor = (
  nodeColor: string | string[],
  nodeTextColor: string | string[],
  isOverlay: boolean = false
) => {
  // Define colors for each layer. Extend this list for more layers.
  let backgroundColor = nodeColor;
  let color = nodeTextColor;

  if (isOverlay) {
    color = "var(--vscode-banner-foreground)";
    backgroundColor = "rgb(255, 255, 255, 0.2)";
  }
  return { backgroundColor, color };
};

const processNodes = (
  nodes: ITableData,
  parentNodeId = null,
  isHorizontal = false
) => {
  return nodes.map((node: any) => {
    // Calculate size before processing node
    const { width, height } = calculateNodeSize(node, isHorizontal);

    const processedNode: any = {
      id: node.id,
      data: node.data,
      type: node.type,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      parentNode: parentNodeId,
      extent: parentNodeId ? "parent" : undefined,
      width,
      height,
      style: assignNodeColor(
        node.data.nodeColor,
        node.data.nodeTextColor,
        node.data.isOverlay || node.type === "overlay"
      ),
    };

    console.log("Node data: ");
    console.log(node.data);
    console.log(node);

    if (node.children) {
      processedNode.children = processNodes(
        node.children,
        node.id,
        isHorizontal
      );
    } else {
      // Don't let edges overlap leaf nodes
      processedNode.zIndex = 11;
    }

    return processedNode;
  });
};

const flattenNodes = (nodes: any, parentX: number = 0, parentY: number = 0) => {
  // @ts-ignore
  return nodes.reduce((flattenedNodes, node) => {
    // calculate absolute positions from canvas perspective, not relative to parent node
    // (used for overlay positioning)
    node.canvasX = node.x + parentX;
    node.canvasY = node.y + parentY;

    let nodes = [node];
    if (node.children) {
      nodes = [
        ...nodes,
        ...flattenNodes(node.children, node.canvasX, node.canvasY),
      ];
      delete node.children;
    }
    return [...flattenedNodes, ...nodes];
  }, []);
};

const getOverlayBoundingBoxes = (
  overlayNodes: ITableData[],
  nodes: ITableData[]
): ITableData[] => {
  return overlayNodes.reduce((acc: ITableData[], overlay: ITableData) => {
    const includedNodes = nodes.filter(
      (node) =>
        overlay.data.containmentId === node.data.containedId &&
        overlay.data.containedEntries.includes(node.data.iri)
    );

    // If no includedNodes are found, skip processing
    if (includedNodes.length === 0) {
      return acc;
    }

    // Calculate bounding box coordinates
    const minX =
      Math.min(...includedNodes.map((node) => node.canvasX)) - PADDING;
    const minY =
      Math.min(...includedNodes.map((node) => node.canvasY)) - PADDING;
    const maxX =
      Math.max(...includedNodes.map((node) => node.canvasX + node.width)) +
      PADDING;
    const maxY =
      Math.max(...includedNodes.map((node) => node.canvasY + node.height)) +
      PADDING;

    acc.push({
      ...overlay,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      zIndex: 10,
    });

    return acc;
  }, []);
};

/**
 * Function `getLayoutedElements` calculates the layout for a set of nodes and edges using the ELK (Eclipse Layout Kernel) algorithm.
 * The function processes input nodes and edges, applies the layout, and then formats the result to be used with React Flow.
 *
 * @param {ITableData} nodes - Input nodes data.
 * @param {Edge[]} edges - Array of edges data.
 * @returns {Promise} - Returns a promise that resolves to an object containing the layouted nodes and edges.
 */
export const getLayoutedElements = (nodes: ITableData, edges: Edge[]) => {
  const isHorizontal = elkOptions["elk.direction"] === "DOWN";
  const processedNodes = processNodes(nodes, null, isHorizontal);

  const graph = {
    id: "root",
    // layoutOptions: elkOptions,
    children: processedNodes,
    edges: edges.map((edge) => ({
      ...edge,
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  return elk
    .layout(graph)
    .then((layoutedGraph) => {
      const flattenedNodes = flattenNodes(layoutedGraph.children);
      const edges = (layoutedGraph.edges || []).map((edge) => ({
        ...edge,
        id: edge.id,
        source: edge.sources[0],
        target: edge.targets[0],
        animated: false,
        type: "smoothstep",
        zIndex: 10,
      }));

      // Remove overlay nodes from the flattenedNodes list, and process them separately
      const { unboundedOverlayNodes, filteredFlattenedNodes } =
        flattenedNodes.reduce(
          (acc: any, node: any) => {
            if (node.data.isOverlay) {
              acc.unboundedOverlayNodes.push(node);
            } else {
              acc.filteredFlattenedNodes.push({
                ...node,
                position: { x: node.x, y: node.y },
                style: {
                  ...node.style,
                  width: node.width,
                  height: node.height,
                },
                data: node.data,
              });
            }
            return acc;
          },
          { unboundedOverlayNodes: [], filteredFlattenedNodes: [] }
        );
      const overlayBoundingBoxes = getOverlayBoundingBoxes(
        unboundedOverlayNodes,
        flattenedNodes
      );

      const overlayNodes = overlayBoundingBoxes.map((box, i) => {
        return {
          ...box,
          type: "overlay",
          position: { x: box.x, y: box.y },
          style: { ...box.style, width: box.width, height: box.height },
        };
      });

      return {
        // @ts-ignore
        nodes: [...filteredFlattenedNodes, ...overlayNodes],
        edges: edges,
      };
    })
    .catch(console.error);
};
