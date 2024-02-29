/**
 * Defines the structure of the webview.
 *
 * @remarks
 * This method is used with the webview class from the {@link https://code.visualstudio.com/api/extension-guides/webview | Webview API}.
 *
 * @field title - Name of the Webview
 * @field path - Path to the Webview 
 * @field type - Type of Webview (home, group, table, etc.)
 *
 */
export default interface IWebviewType {
  title: string;
  path: string;
  type: string;
}