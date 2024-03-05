import * as vscode from "vscode";
import ITableCategory from "../../../commands/src/interfaces/ITableCategory";
import IWebviewType from "../../../commands/src/interfaces/IWebviewType";
import ILoadedTriplestoreType from "../../../commands/src/interfaces/ILoadedTriplestoreType";

export class LoadedTriplestoreTreeDataProvider
  implements vscode.TreeDataProvider<TreeItem>
{
  _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null> =
    new vscode.EventEmitter<TreeItem | undefined | null>();
  onDidChangeTreeData: vscode.Event<TreeItem | undefined | null> =
    this._onDidChangeTreeData.event;

  private static _instance: LoadedTriplestoreTreeDataProvider | null = null;

  public static getInstance(
    isPinged: boolean = false,
    isLoaded: boolean = false
  ): LoadedTriplestoreTreeDataProvider {
    if (this._instance === null) {
      this._instance = new LoadedTriplestoreTreeDataProvider(
        isPinged,
        isLoaded
      );
    }
    return this._instance;
  }

  data: TreeItem[];
  private _isPinged: boolean;
  private _isLoaded: boolean;

  private constructor(isPinged: boolean, isLoaded: boolean) {
    this._isPinged = isPinged;
    this._isLoaded = isLoaded;
    this.data = buildTreeItems();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (!element.children || element.children.length === 0) {
      const label = element.getLabel();
      element.command = {
        command: "oml-vision.createWebview",
        title: label,
        arguments: [element.triplestoreType],
      };
    }

    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (this._isPinged && this._isLoaded) {
      if (element === undefined) {
        return this.data;
      }
      return element.children;
    } else {
      // If there's no build folder or no page layout, return an empty array to trigger the welcome view.
      return [];
    }
  }

  updateIsPinged(isPinged: boolean) {
    this._isPinged = isPinged;
    // This will refresh the tree items pages view in the sidebar.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateIsLoaded(isLoaded: boolean) {
    this._isLoaded = isLoaded;
    // This will refresh the tree items pages view in the sidebar.
    this._onDidChangeTreeData.fire(undefined);
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  readonly triplestoreType: ILoadedTriplestoreType;

  constructor(
    label: string,
    triplestoreType: ILoadedTriplestoreType,
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
    this.triplestoreType = triplestoreType;
    if (description) {
      this.tooltip = description;
    }
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
      this.triplestoreType,
      this.children,
      this.getToolTip()
    );
  }
}

function buildTreeItems(source: ILoadedTriplestoreType[] = []): TreeItem[] {
  let output: TreeItem[] = source.map((entry) => {
    let item;
    if ("pinged" in entry) {
      item = new TreeItem(
        "Pinged",
        { pinged: false, loaded: false },
        undefined
      );
      // Used to display icons regardless of if children or not
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
    } else {
      item = new TreeItem(
        "Loaded",
        { pinged: false, loaded: false },
        undefined
      );
      // Used to display icons regardless of if children or not
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    // Set the tree icon if necessary based on whether or not the database is pinged or loaded with data
    // Refer to https://code.visualstudio.com/api/references/icons-in-labels for ThemeIcons
    item.iconPath = undefined;
    if (entry.pinged) item.iconPath = new vscode.ThemeIcon("rss");
    else if (entry.loaded)
      item.iconPath = new vscode.ThemeIcon("database");
    else console.error(`ERROR: Set type in pages.json for ${entry}`);
    return item;
  });

  return output;
}
