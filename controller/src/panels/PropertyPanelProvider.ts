import * as path from "path";
import {
  Uri,
  WebviewView,
  WebviewViewProvider,
  CancellationToken,
  WebviewViewResolveContext,
} from "vscode";
import { IPropertyData } from "../../../commands/src/interfaces/IPropertyData";
import { getHtmlForWebview } from "../utilities/getters/getHtmlForWebview";
import { handlePropertyPanelMessage } from "../../../commands/src/propertyPanelMessageHandler";
import {
  CommandDefinitions,
  Commands,
} from "../../../commands/src/commands";
import { globalViewpointContents } from "../extension";
/**
 * Manages react-based webview for the Property page
 */
export class PropertyPanelProvider implements WebviewViewProvider {
  private static _instance: PropertyPanelProvider | null = null;

  public static getInstance(extensionPath?: string): PropertyPanelProvider {
    if (this._instance === null) {
      if (extensionPath === undefined) {
        throw new Error(
          "extensionPath must be provided when creating the PropertyPanelProvider instance for the first time."
        );
      }
      this._instance = new PropertyPanelProvider(extensionPath);
    }
    return this._instance;
  }

  public static readonly viewType = "propertyPanel";

  private _view?: WebviewView;
  private _pendingPayload: IPropertyData | null = null;

  public setPendingPayload(payload: IPropertyData | null) {
    this._pendingPayload = payload;
  }

  public getPendingPayload(): IPropertyData | null {
    return this._pendingPayload;
  }

  public showPropertyPanel(preserveFocus: boolean = true): void {
    this._view?.show(preserveFocus);
  }

  private constructor(private readonly _extensionPath: string) {}

  public resolveWebviewView(
    webviewView: WebviewView,
    context: WebviewViewResolveContext,
    _token: CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

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
    };

    // Set the webview's initial html content
    webviewView.webview.html = getHtmlForWebview(
      webviewView.webview,
      this._extensionPath,
      "/property-panel"
    );

    // Handle messages from the webview
    this._view.webview.onDidReceiveMessage(
      (message: {
        command: Commands;
        payload: string;
        text?: string;
        wizardId?: string;
      }) => {
        handlePropertyPanelMessage(message, this);
      }
    );
  }

  public sendMessage<K extends keyof CommandDefinitions>(
    message: { command: K } & CommandDefinitions[K]
  ) {
    if (this._view) {
      this._view.webview.postMessage(message);
    }
  }

  public static updateViewpoints() {
    this._instance?.sendMessage({
      command: Commands.SEND_VIEWPOINTS,
      payload: globalViewpointContents,
    });
  }
}
