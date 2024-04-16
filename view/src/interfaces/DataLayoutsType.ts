export interface IRowMapping {
  id: string;
  name: string;
  labelFormat: string;
  isRecursive?: boolean;
  canDeleteElements?: boolean;
  subRowMappings?: IRowMapping[];
}

export interface IDiagramRowMapping extends IRowMapping {
  nodeColor: string;
  nodeTextColor: string;
  nodeType?: string;
  edgeMatchKey?: string;
  subRowMappings?: IDiagramRowMapping[];
}

export interface IDiagramOverlay extends IRowMapping {
  attachesTo: string;
}

export interface IDiagramEdgeMapping {
  id: string;
  name: string;
  labelFormat: string;
  animated: boolean;
  legendItems: string;
  sourceKey: string;
  targetKey: string;
}

export type DataLayout = {
  name: string
  id: string
  queries: Record<string, string>
  contextMenu: Record<string, string>
  rowMapping: IRowMapping
};

export type DiagramLayout = DataLayout & {
  rowMapping: IDiagramRowMapping;
  overlays?: IDiagramOverlay[];
  edges: IDiagramEdgeMapping[];
}

export type TableLayout = DataLayout & {
  columnNames: Record<string, string>
  diagrams?: Record<string, string>
}

export type TreeLayout = DataLayout & {
  diagrams?: Record<string, string>
}

export type DataLayoutsType<T> = Record<string, T>;