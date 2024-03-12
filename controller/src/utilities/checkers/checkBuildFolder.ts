import { workspace, Uri, commands, FileType } from "vscode";
import { TreeDataProvider } from "../../sidebar/TreeDataProvider";

// TODO: handle multiple workspaces (currently assumes model is in the 1st)
export async function checkBuildFolder(TreeDataProvider: TreeDataProvider) {
	let hasBuildFolder = false;
	let workspaceFolders = workspace.workspaceFolders;
	if (workspaceFolders) {
		const uri = workspaceFolders[0].uri;
		const buildFolderUri = Uri.joinPath(uri, 'build');
		try {
			const stats = await workspace.fs.stat(buildFolderUri);
			hasBuildFolder = stats.type === FileType.Directory;
		} catch (err) {
			// Error is thrown if folder does not exist, ignore it
		}
	}
	commands.executeCommand('setContext', 'vision:hasBuildFolder', hasBuildFolder);
	TreeDataProvider.updateHasBuildFolder(hasBuildFolder);
}