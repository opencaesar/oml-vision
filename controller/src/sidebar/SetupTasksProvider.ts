import * as vscode from "vscode";
import * as path from "path";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { CommandDefinitions, Commands } from "../../../commands/src/commands";

/**
 * Manages react-based webview for the Tasks page in the Sidebar
 */
export class SetupTasksProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vision-setup-tasks";

  private _view?: vscode.WebviewView;
  private _onDidLoadTasksSubscription?: vscode.Disposable;

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
      "/setup-tasks-panel"
    );

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "alert":
          vscode.window.showErrorMessage(message.text);
          return;
        case "getGradleTasks":
          this.handleGradleTasksRequest();
          return;
        case "runGradleTask":
          this.runGradleTask(message.payload);
          return;
      }
    }, null);
  }

  private handleGradleTasksRequest() {
    this._gradleApi
      .getTaskProvider()
      .provideTasks()
      .then((tasks: vscode.Task[]) => {
        if (tasks) {
          // Tasks are already loaded, send them to the webview
          this.sendGradleTasks(tasks);
        } else {
          // Tasks are not loaded yet, subscribe to the onDidLoadTasks event
          // But first, unsubscribe from the previous subscription if it exists
          if (this._onDidLoadTasksSubscription) {
            this._onDidLoadTasksSubscription.dispose();
          }

          this._onDidLoadTasksSubscription = this._gradleApi
            .getTaskProvider()
            .onDidLoadTasks((tasks: vscode.Task[]) => {
              this.sendGradleTasks(tasks);
            });
        }
      });
  }

  private sendGradleTasks(tasks: vscode.Task[]) {
    // Filter tasks with "Vision" in their name, or if it is clean/build
    const visionTasks = tasks
      .filter(
        (task) =>
          task.definition.group === "vision" ||
          task.name === "clean" ||
          task.name === "build"
      )
      .map((task) => task.name);

    const payload = visionTasks;
    this.sendMessage({ command: Commands.RECEIVED_GRADLE_TASKS, payload });
  }

  private runGradleTask(taskName: string) {
    this._gradleApi
      .getTaskProvider()
      .provideTasks()
      .then((tasks: vscode.Task[]) => {
        const taskToRun = tasks.find((task) => task.name === taskName);
        if (taskToRun) {
          vscode.tasks.executeTask(taskToRun);
        }
      });
  }

  public sendMessage<K extends keyof CommandDefinitions>(
    message: { command: K } & CommandDefinitions[K]
  ) {
    if (this._view) {
      // this._view.show?.(true);
      this._view.webview.postMessage(message);
    }
  }
}
