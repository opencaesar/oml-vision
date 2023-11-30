import { workspace, Uri, window, FileType } from "vscode";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)
export async function loadSparqlFiles(globalSparqlContents: { [file: string]: string; }) {

	const workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders) {
		const uri = workspaceFolders[0].uri;
		const sparqlFolderUri = Uri.joinPath(uri, 'src', 'vision', 'sparql');

		try {
			const files = await workspace.fs.readDirectory(sparqlFolderUri);
			for (const [file, type] of files) {
				if (file.endsWith('.sparql') && type === FileType.File) {
					const fileUri = Uri.joinPath(sparqlFolderUri, file);
					const buffer = await workspace.fs.readFile(fileUri);
					// Add the file content to the globalSparqlContents object with the filename as the key
					globalSparqlContents[file] = buffer.toString();
				}
			}
			window.showInformationMessage('SPARQL query files loaded successfully.');
		} catch (err) {
			window.showErrorMessage(`Error reading SPARQL files: ${err}`);
		}
	}
}