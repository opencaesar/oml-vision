import * as vscode from 'vscode';
import ITableCategory from '../../commands/src/interfaces/ITableCategory';
import ITableType from '../../commands/src/interfaces/ITableType';

export class SidebarProvider implements vscode.TreeDataProvider<TreeItem> {
  _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null> = new vscode.EventEmitter<TreeItem | undefined | null>();
  onDidChangeTreeData: vscode.Event<TreeItem | undefined | null> = this._onDidChangeTreeData.event;

  private static _instance: SidebarProvider | null = null;

	public static getInstance(hasBuildFolder: boolean = false, hasPageLayout: boolean = false, hasSparqlConfig: boolean = false): SidebarProvider {
		if (this._instance === null) {
			this._instance = new SidebarProvider(hasBuildFolder, hasPageLayout, hasSparqlConfig);
		}
		return this._instance;
	}

  data: TreeItem[];
  private _hasBuildFolder: boolean;
  private _hasPageLayout: boolean;
  private _hasSparqlConfig: boolean;

  private constructor(hasBuildFolder: boolean, hasPageLayout: boolean, hasSparqlConfig: boolean) {
    this._hasBuildFolder = hasBuildFolder;
    this._hasPageLayout = hasPageLayout;
    this._hasSparqlConfig = hasSparqlConfig;
    this.data = buildTreeItems();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    if (!element.children || element.children.length === 0) {
      const label = element.getLabel();
      element.command = {
        command: 'oml-vision.createTable',
        title: label,
        arguments: [element.tableType]
      };
    }

    return element;
  }

  getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    if (this._hasBuildFolder && this._hasPageLayout && this._hasSparqlConfig) {
      if (element === undefined) {
        return this.data;
      }
      return element.children;
    } else {
      // If there's no build folder or no page layout, return an empty array to trigger the welcome view.
      return [];
    }
  }

  updateHasBuildFolder(hasBuildFolder: boolean) {
    this._hasBuildFolder = hasBuildFolder;
    // This will refresh the sidebar pages view.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateHasPageLayout(hasPageLayout: boolean) {
    this._hasPageLayout = hasPageLayout;
    // This will refresh the sidebar pages view.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateHasSparqlConfig(hasSparqlConfig: boolean) {
    this._hasSparqlConfig = hasSparqlConfig;
    // This will refresh the sidebar pages view.
    this._onDidChangeTreeData.fire(undefined);
  }

  updateLayouts(pageLayout: (ITableType | ITableCategory)[]) {
    this.data = buildTreeItems(pageLayout);
    // This will refresh the sidebar pages view.
    this._onDidChangeTreeData.fire(undefined);
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  readonly tableType: ITableType;

  constructor(label: string, tableType: ITableType, children?: TreeItem[], description = '') {
    super(
      label,
      children === undefined || children.length === 0 ? vscode.TreeItemCollapsibleState.None :
        vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
    this.tableType = tableType;
    if (description) {
      this.tooltip = description;
    }
  }

  public static from(tableType: ITableType) {
    return new TreeItem(tableType.title, tableType, undefined, tableType.path ? tableType.path : tableType.title);
  }

  public getLabel(): string {
    return this.label ? this.label.toString() : '';
  }

  public getToolTip(): string {
    return this.tooltip ? this.tooltip.toString() : '';
  }

  public clone(): TreeItem {
    return new TreeItem(this.getLabel(), this.tableType, this.children, this.getToolTip());
  }
}


function buildTreeItems(source: (ITableType | ITableCategory)[] = []): TreeItem[] {
  let output: TreeItem[] = source.map(entry => {
    let item;
    if ('children' in entry) {
      item = new TreeItem(entry.title, {title: entry.title, path: ''}, buildTreeItems(entry.children));
    } else {
      item = TreeItem.from(entry);

      // Used to display icons regardless of if children or not
      item.collapsibleState = vscode.TreeItemCollapsibleState.None;
    }

    // Set the tree icon if necessary
    item.iconPath = entry.treeIcon ? new vscode.ThemeIcon(entry.treeIcon) : undefined;
    item.resourceUri = entry.treeIcon ? vscode.Uri.parse('_.js') : undefined;
    return item;
  });

  return output;
}
