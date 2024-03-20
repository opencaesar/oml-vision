import * as path from "path";
import {
  Uri,
  commands,
  window,
  WebviewPanel,
  Disposable,
  ViewColumn,
} from "vscode";
import IWebviewType from "../../../commands/src/interfaces/IWebviewType";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { handleTablePanelMessage } from "../../../commands/src/tablePanelMessageHandler";
import {
  CommandDefinitions,
  Commands,
} from "../../../commands/src/commands";
import { globalViewpointContents } from "../extension";

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
  private readonly _webviewType: IWebviewType;
  private _pendingPayload: any = "";

  public setPendingPayload(payload: any) {
    this._pendingPayload = payload;
  }

  public getPendingPayload(): any {
    return this._pendingPayload;
  }

  public getWebviewType(): IWebviewType {
    return this._webviewType;
  }

  private _disposables: Disposable[] = [];

  public static createOrShow(
    extensionPath: string,
    webviewType: IWebviewType,
    pendingPayload: any = null
  ) {
    const column = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : undefined;
    const homeType = { title: "OML Vision Home", path: "/", type: "home" };
    const typeToUse = webviewType.path === "/" ? homeType : webviewType;

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
    webviewType: IWebviewType,
    pendingPayload: any
  ) {
    this._extensionPath = extensionPath;
    this._webviewType = webviewType;

    /* If a diagram is created with a filter, we need to store the pending filter as a payload
		so the webview panel can receive it on 'generateTableData' call. */
    this._pendingPayload = pendingPayload;

    // Create and show a new webview panel
    this._panel = window.createWebviewPanel(
      TablePanel.viewType,
      webviewType.title,
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

    // Set the route to the panel that is rendered in the webview.  By default go to the home page route.
    let panelRoute = "/";
    if (webviewType.type === "table") panelRoute = "/table-panel";
    else if (webviewType.type === "tree") panelRoute = "/tree-panel";
    else if (webviewType.type === "diagram") panelRoute = "/diagram-panel";
    
    // Set the webview's initial html content
    this._panel.webview.html = getHtmlForWebview(
      this._panel.webview,
      this._extensionPath,
      panelRoute,
      webviewType.path
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

  public static updateViewpoints() {
    TablePanel.currentPanels.forEach((panel) =>
      panel.sendMessage({
        command: Commands.SEND_VIEWPOINTS,
        payload: globalViewpointContents,
      })
    );
  }

  public dispose() {
    // Remove panel from map
    TablePanel.currentPanels.delete(this._webviewType.path);

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
