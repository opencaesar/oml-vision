import * as vscode from "vscode";
import * as path from "path";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { CommandDefinitions, Commands } from "../../../commands/src/commands";
import { queryEngine, pingQueryEngine } from "../database/queryEngine";

/**
 * Checks if the RDF Triplestore is loaded and outputs the result to the webview.
 */
export class LoadedTriplestoreProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vision-loaded-triplestore";

  private _view?: vscode.WebviewView;

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
      "/loaded-triplestore-panel"
    );

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showErrorMessage(message.text);
          return;
        case "checkLoadedTriplestoreTask":
          this.checkLoadedTriplestoreTask();
          return;
        case "pingTriplestoreTask":
          this.pingTriplestoreTask(message.payload);
          return;
        case "loadedTriplestoreTask":
          this.loadedTriplestoreTask(message.payload);
          return;
      }
    }, null);
  }

  /**
   * Pings RDF Triplestore and checks for loaded data in RDF Triplestore if running.  Run triplestore if not running.
   *
   */
  private async checkLoadedTriplestoreTask() {
    const pingStatus = await pingQueryEngine();
    // Generic query to find a triple in the triplestore
    const query = `
      SELECT * 
      WHERE {
          ?s ?p ?o 
      }
      LIMIT 1
      `;
    const queryResult = await queryEngine(query);
    // Set Ping status to true if HTTP status code is 200
    if (pingStatus === 200) {
      // Check if there is no data in the JSON array
      if (Object.keys(queryResult).length === 0) {
        this.loadedTriplestoreTask(false);
      } else {
        this.loadedTriplestoreTask(true);
      }
      this.pingTriplestoreTask(true);
    } else {
      // Run the triplestore if not running if not running already.
      this.runTriplestoreTask("startFuseki");
    }
  }

  /**
   * Set Ping RDF Triplestore task.
   *
   * @param success - The success boolean to set
   */
  private pingTriplestoreTask(success: boolean) {
    let pingResult = { success: success };
    const payload = pingResult;
    this.sendMessage({ command: Commands.PING_TRIPLESTORE_TASK, payload });
  }

  /**
   * Set Check RDF Triplestore task.
   *
   * @param success - The success boolean to set
   */
  private loadedTriplestoreTask(success: boolean) {
    let checkTriplestoreResult = { success: success };
    const payload = checkTriplestoreResult;
    this.sendMessage({ command: Commands.LOADED_TRIPLESTORE_TASK, payload });
  }

  /**
   * Runs RDF Triplestore task using the VSCode Gradle API.
   *
   * @param triplestore - The triplestore gradle task name to run to start the RDF Triplestore
   */
  private runTriplestoreTask(triplestore: string) {
    this._gradleApi
      .getTaskProvider()
      .provideTasks()
      .then((tasks: vscode.Task[]) => {
        const taskToRun = tasks.find((task) => task.name === triplestore);
        if (taskToRun) {
          vscode.tasks.executeTask(taskToRun);
        } else {
          // If there was an error, throw an error with the status code and text
          console.error(
            `Gradle Task Error: startFuseki not found in build.gradle`
          );
          throw new Error(
            `Gradle Task Error: startFuseki not found in build.gradle`
          );
        }
      });
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
