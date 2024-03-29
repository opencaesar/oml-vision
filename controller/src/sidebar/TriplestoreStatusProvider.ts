import * as vscode from "vscode";
import * as path from "path";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { CommandDefinitions, Commands } from "../../../commands/src/commands";
import { queryEngine, pingQueryEngine } from "../database/queryEngine";

/**
 * Checks if the RDF Triplestore is loaded and outputs the result to the webview.
 */
export class TriplestoreStatusProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vision-triplestore-status";

  private _view?: vscode.WebviewView;
  public pinged: boolean = false;
  public loaded: boolean = false;

  constructor(
    private readonly _extensionPath: string,
    private readonly _gradleApi: any
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        vscode.Uri.file(
          path.join(
            this._extensionPath,
            "node_modules",
            "@vscode/codicons",
            "dist"
          )
        ),
        vscode.Uri.file(path.join(this._extensionPath, "build")),
      ],
    };

    // Set the webview's initial html content
    webviewView.webview.html = getHtmlForWebview(
      webviewView.webview,
      this._extensionPath,
      "/triplestore-status-panel"
    );

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showErrorMessage(message.text);
          return;
        case "pingTriplestoreTask":
          this.pingTriplestoreTask();
          return;
        case "checkLoadedTriplestoreTask":
          this.loadedTriplestoreTask();
          return;
      }
    }, null);
  }

  /**
   * Ping RDF Triplestore task.
   *
   */
  public async pingTriplestoreTask() {
    const pingStatus = await pingQueryEngine();
    try {
      if (pingStatus === 200) {
        this.pinged = true;
      } else {
        // Run the triplestore if not running if not running already.
        this.pinged = false;
        // this.runTriplestoreTask("startFuseki");
      }
    } catch (err) {
      this.pinged = false;
      console.error(`Error: ${err}`);
    }
    const payload = { success: this.pinged };
    this.sendMessage({
      command: Commands.PING_TRIPLESTORE_TASK,
      payload: payload,
    });
  }

  /**
   * Check if RDF Triplestore is loaded task.
   *
   */
  public async loadedTriplestoreTask() {
    // Generic query to find a triple in the triplestore
    const query = `
      SELECT * 
      WHERE {
          ?s ?p ?o 
      }
      LIMIT 1
      `;
    const queryResult = await queryEngine(query);
    if (Object.keys(queryResult).length === 0) {
      this.loaded = false;
    } else {
      this.loaded = true;
    }
    let checkTriplestoreResult = { success: this.loaded };
    const payload = checkTriplestoreResult;
    this.sendMessage({ command: Commands.LOADED_TRIPLESTORE_TASK, payload: payload });
  }

  /**
   * Posts message to webview based on Command Definition.
   *
   * @param message - The payload to send to the webview.
   */
  public sendMessage<K extends keyof CommandDefinitions>(
    message: { command: K } & CommandDefinitions[K]
  ) {
    if (this._view) {
      // this._view.show?.(true);
      this._view.webview.postMessage(message);
    }
  }
}
