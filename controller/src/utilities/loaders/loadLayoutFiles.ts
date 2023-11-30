import { workspace, Uri, commands, window, FileType } from "vscode";
import { SidebarProvider } from "../../Sidebar";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)export 
export async function loadLayoutFiles(globalLayoutContents: { [file: string]: any; }) {
	commands.executeCommand('setContext', 'vision:hasPageLayout', false);
	SidebarProvider.getInstance().updateHasPageLayout(false);

	const workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders) {
		const uri = workspaceFolders[0].uri;
		const layoutsFolderUri = Uri.joinPath(uri, 'src', 'vision', 'layouts');

		try {
			const files = await workspace.fs.readDirectory(layoutsFolderUri);
			for (const [file, type] of files) {
				if (file.endsWith('.json') && type === FileType.File) {
					const fileUri = Uri.joinPath(layoutsFolderUri, file);
					const buffer = await workspace.fs.readFile(fileUri);
					try {
						const content = JSON.parse(buffer.toString())
						if (file === 'pages.json') {
							SidebarProvider.getInstance().updateLayouts(content);
							SidebarProvider.getInstance().updateHasPageLayout(true);
						}
						globalLayoutContents[file] = content;
					} catch (parseErr) {
						globalLayoutContents = {};
						throw new Error(`Error parsing layout file ${file}: ${parseErr}`)
					}
				}
			}
			if (files.length > 0) {
				commands.executeCommand('setContext', 'vision:hasPageLayout', true);
				window.showInformationMessage('Layout files loaded successfully.');
			} else {
				window.showWarningMessage('Layout files not found.');
			}
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('Error parsing layout file'))
				window.showErrorMessage(err.message);
			else {
				window.showErrorMessage(`Error reading layout files: ${err}`);
			}
		} finally {
			// Send updated global layouts to TablePanels & PropertyPanel
			TablePanel.updateLayouts();
			PropertyPanelProvider.updateLayouts();
		}
	}
}