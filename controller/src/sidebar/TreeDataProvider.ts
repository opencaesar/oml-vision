import * as vscode from "vscode";
import ITableCategory from "../../../commands/src/interfaces/ITableCategory";
import IWebviewType from "../../../commands/src/interfaces/IWebviewType";

export class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null> =
    new vscode.EventEmitter<TreeItem | undefined | null>();
  onDidChangeTreeData: vscode.Event<TreeItem | undefined | null> =
    this._onDidChangeTreeData.event;

  private static _instance: TreeDataProvider | null = null;

  public static getInstance(
    hasBuildFolder: boolean = false,
    hasPageViewpoint: boolean = false,
    hasSparqlConfig: boolean = false
  ): TreeDataProvider {
    if (this._instance === null) {
      this._instance = new TreeDataProvider(
        hasBuildFolder,
        hasPageViewpoint,
        hasSparqlConfig
      );
    }
    return this._instance;
  }

  data: TreeItem[];
  private _hasBuildFolder: boolean;
  private _hasPageViewpoint: boolean;
  private _hasSparqlConfig: boolean;

  private constructor(
    hasBuildFolder: boolean,
    hasPageViewpoint: boolean,
    hasSparqlConfig: boolean
  ) {
    this._hasBuildFolder = hasBuildFolder;
    this._hasPageViewpoint = hasPageViewpoint;
    this._hasSparqlConfig = hasSparqlConfig;
    this.data = buildTreeItems();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (!element.children || element.children.length === 0) {
      const label = element.getLabel();
      element.command = {
        command: "oml-vision.createWebview",
        title: label,
        arguments: [element.webviewType],
      };
    }

    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (this._hasBuildFolder && this._hasPageViewpoint && this._hasSparqlConfig) {
      if (element === undefined) {
        return this.data;
      }
      return element.children;
    } else {
      // If there's no build folder or no page viewpoint, return an empty array to trigger the welcome view.
      return [];
    }
  }

  updateHasBuildFolder(hasBuildFolder: boolean) {
    this._hasBuildFolder = hasBuildFolder;
    // This will refresh the tree items pages view in the sidebar.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateHasPageViewpoint(hasPageViewpoint: boolean) {
    this._hasPageViewpoint = hasPageViewpoint;
    // This will refresh the sidebar pages view.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateHasSparqlConfig(hasSparqlConfig: boolean) {
    this._hasSparqlConfig = hasSparqlConfig;
    // This will refresh the tree items pages view in the sidebar.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateViewpoints(pageViewpoint: (IWebviewType | ITableCategory)[]) {
    this.data = buildTreeItems(pageViewpoint);
    // This will refresh the tree items pages view in the sidebar.
    this._onDidChangeTreeData.fire(undefined);
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  readonly webviewType: IWebviewType;

  constructor(
    label: string,
    webviewType: IWebviewType,
    children?: TreeItem[],
    description = ""
  ) {
    super(
      label,
      children === undefined || children.length === 0
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
    this.webviewType = webviewType;
    if (description) {
      this.tooltip = description;
    }
  }

  public static from(webviewType: IWebviewType) {
    return new TreeItem(
      webviewType.title,
      webviewType,
      undefined,
      webviewType.path ? webviewType.path : webviewType.title
    );
  }

  public getLabel(): string {
    return this.label ? this.label.toString() : "";
  }

  public getToolTip(): string {
    return this.tooltip ? this.tooltip.toString() : "";
  }

  public clone(): TreeItem {
    return new TreeItem(
      this.getLabel(),
      this.webviewType,
      this.children,
      this.getToolTip()
    );
  }
}

function buildTreeItems(
  source: (IWebviewType | ITableCategory)[] = []
): TreeItem[] {
  let output: TreeItem[] = source.map((entry) => {
    let item;
    if ("children" in entry) {
      item = new TreeItem(
        entry.title,
        { title: entry.title, path: "", type: "" },
        buildTreeItems(entry.children)
      );
    } else {
      item = TreeItem.from(entry);

      // Used to display icons regardless of if children or not
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    // Set the tree icon if necessary based on type
    item.iconPath = undefined;
    if (entry.type === "home") item.iconPath = new vscode.ThemeIcon("home");
    else if (entry.type === "group")
      item.iconPath = new vscode.ThemeIcon("server");
    else if (entry.type === "table")
      item.iconPath = new vscode.ThemeIcon("window");
    else if (entry.type === "tree")
      item.iconPath = new vscode.ThemeIcon("list-tree");
    else if (entry.type === "diagram")
      item.iconPath = new vscode.ThemeIcon("graph-scatter");
    else console.error(`TYPE ERROR: Set type in pages.json for ${entry.title}`);
    item.resourceUri = entry.type ? vscode.Uri.parse("_.js") : undefined;
    return item;
  });

  return output;
}
