import * as path from "path";
import {
  Uri,
  commands,
  window,
  WebviewPanel,
  Disposable,
  ViewColumn,
} from "vscode";
import ITableType from "../../../commands/src/interfaces/ITableType";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { handleTablePanelMessage } from "../../../commands/src/tablePanelMessageHandler";
import {
  CommandDefinitions,
  Commands,
} from "../../../commands/src/commands";
import { globalLayoutContents } from "../extension";
import { queryEngine } from "../database/queryEngine";

/**
 * Manages react-based webview panels for a Table
 */
export class TablePanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public static currentPanels: Map<string, TablePanel> = new Map();

  private static readonly viewType = "tablePanel";

  private readonly _panel: WebviewPanel;
  private readonly _extensionPath: string;
  private readonly _tableType: ITableType;
  private _pendingPayload: any = "";

  public setPendingPayload(payload: any) {
    this._pendingPayload = payload;
  }

  public getPendingPayload(): any {
    return this._pendingPayload;
  }

  public getTableType(): ITableType {
    return this._tableType;
  }

  private _disposables: Disposable[] = [];

  public static createOrShow(
    extensionPath: string,
    tableType: ITableType,
    pendingPayload: any = null
  ) {
    const column = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : undefined;
    const homeType = { title: "OML Vision Home", path: "/", treeIcon: "home" };
    const typeToUse = tableType.path === "/" ? homeType : tableType;

    // If we already have a panel for this table type, show it.
    // Otherwise, create a new panel.
    if (TablePanel.currentPanels.has(typeToUse.path)) {
      TablePanel.currentPanels.get(typeToUse.path)?._panel.reveal(column);
    } else {
      const newPanel = new TablePanel(
        extensionPath,
        column || ViewColumn.One,
        typeToUse,
        pendingPayload
      );
      TablePanel.currentPanels.set(typeToUse.path, newPanel);
    }
  }

  private constructor(
    extensionPath: string,
    column: ViewColumn,
    tableType: ITableType,
    pendingPayload: any
  ) {
    this._extensionPath = extensionPath;
    this._tableType = tableType;

    /* If a diagram is created with a filter, we need to store the pending filter as a payload
		so the webview panel can receive it on 'generateTableData' call. */
    this._pendingPayload = pendingPayload;

    // Create and show a new webview panel
    this._panel = window.createWebviewPanel(
      TablePanel.viewType,
      tableType.title,
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // TODO: CHANGE THIS! Use setState and getState for less overhead!!!
        retainContextWhenHidden: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          Uri.file(
            path.join(
              this._extensionPath,
              "node_modules",
              "@vscode/codicons",
              "dist"
            )
          ),
          Uri.file(path.join(this._extensionPath, "build")),
        ],
      }
    );

    // TODO: Change is{Type} in ITableType interface to tablePath itself (this works for now, just feels redundant)
    let panelRoute = "/";
    if (tableType.isTable) panelRoute = "/table-panel";
    else if (tableType.isTree) panelRoute = "/tree-panel";
    else if (tableType.isDiagram) panelRoute = "/diagram-panel";

    // Set the webview's initial html content
    this._panel.webview.html = getHtmlForWebview(
      this._panel.webview,
      this._extensionPath,
      panelRoute,
      tableType.path
    );

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message: {
        command: Commands;
        payload: string;
        text?: string;
        wizardId?: string;
      }) => {
        handleTablePanelMessage(message, this);
      }
    );
  }

  public sendMessage<K extends keyof CommandDefinitions>(
    message: { command: K } & CommandDefinitions[K]
  ) {
    this._panel.webview.postMessage(message);
  }

  public static updateTables() {
    TablePanel.currentPanels.forEach((panel) =>
      panel.sendMessage({ command: Commands.UPDATE_LOCAL_VALUE })
    );
  }

  public static updateLayouts() {
    TablePanel.currentPanels.forEach((panel) =>
      panel.sendMessage({
        command: Commands.SEND_LAYOUTS,
        payload: globalLayoutContents,
      })
    );
  }

  public dispose() {
    // Remove panel from map
    TablePanel.currentPanels.delete(this._tableType.path);

    // Clean up our resources
    this._panel.dispose();

    // Redirect the panel view to home
    commands.executeCommand("oml-vision.hideProperties");

    while (this._disposables.length) {
      const x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  }
}
