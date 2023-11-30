import { Uri, Webview } from "vscode";
import { getNonce } from "./getNonce";
import * as path from "path";
/**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the React webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionPath The path of the directory containing the extension
   * @param panelRoute The path of the panel rendered in the webview
   * @param {string} [tablePath=""] The OPTIONAL path to the table rendered in the webview
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
export function getHtmlForWebview(webview: Webview, extensionPath: string, panelRoute: string, tablePath: string = "") {

	// Find the VSCode URI from the path
    const scriptPathOnDisk = Uri.file(path.join(extensionPath, 'build', 'static', 'index.js'));
	const indexStylePathOnDisk = Uri.file(path.join(extensionPath, 'build', 'static', 'index.css'));
	const tailwindStylePathOnDisk = Uri.file(path.join(extensionPath, 'build', 'static', 'tailwind.css'));
	const codiconPathOnDisk = Uri.file(path.join(extensionPath, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));

    // The JS file from the React build output
	const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // The index CSS file from the React build output
	const indexStyleUri = webview.asWebviewUri(indexStylePathOnDisk);

	// The tailwind CSS file from the React build output
	const tailwindStyleUri = webview.asWebviewUri(tailwindStylePathOnDisk);

    // The Code Icon file from the React build output
	const codiconUri = webview.asWebviewUri(codiconPathOnDisk);

	// Use a nonce to whitelist which scripts can be run
	const nonce = getNonce();

	return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
			<meta name="theme-color" content="#000000">
			<title>React App</title>
			<link rel="stylesheet" type="text/css" href="${indexStyleUri}">
			<link rel="stylesheet" type="text/css" href="${tailwindStyleUri}">
			<link rel="stylesheet" type="text/css" href="${codiconUri}" />
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src vscode-resource: 'self'; img-src vscode-resource: https: data:; script-src 'nonce-${nonce}'; style-src vscode-resource: 'unsafe-inline' http: https: data:; font-src vscode-resource:;">
			<base href="${Uri.file(path.join(extensionPath, 'build')).with({ scheme: 'vscode-resource' })}/">
		</head>
		<body>
			<noscript>You need to enable JavaScript to run this app.</noscript>
			<div id="root" data-initial-route="${panelRoute}" data-table-path="${tablePath}"></div>
			<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>`;
}