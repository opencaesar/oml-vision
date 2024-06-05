import { workspace, Uri, commands, window, FileType } from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";
import { validateSchema } from "../../schemas/validator";
import { commandSchema } from "../../schemas/commands/commandSchema";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)

/**
 * Loads JSON files that are stored in the commands folder of the model.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param commandContents - content of the commands object
 *
 */
export const loadCommandFiles = async (
  commandContents: {
    [file: string]: any;
  } = {}
) => {
  commands.executeCommand("setContext", "vision:hasCommand", false);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    const uri = workspaceFolders[0].uri;
    // Uri is required for VSCode extension to determine path to file or folder
    const commandFolderUri = Uri.joinPath(uri, "src", "vision", "commands");
    try {
      const files = await workspace.fs.readDirectory(commandFolderUri);
      for (const [file, type] of files) {
        if (
          file.endsWith(".json") &&
          type === FileType.File
        ) {
          const fileUri = Uri.joinPath(commandFolderUri, file);
          const buffer = await workspace.fs.readFile(fileUri);
          const content = JSON.parse(buffer.toString());
          // Validate if the content matches the JSON Command Schema
          const validate = validateSchema(commandSchema, content);
          if (files.length > 0 && validate) {
            commands.executeCommand("setContext", "vision:hasCommand", true);
            window.showInformationMessage(`${file} loaded successfully.`);
          } else {
            window.showErrorMessage(`Invalid or missing ${file}.`);
          }
          try {
            TablePanel.updateCommands();
            PropertyPanelProvider.updateCommands();
            commandContents[file] = content;
          } catch (parseErr) {
            commandContents = {};
            throw new Error(`Error parsing command file ${file}: ${parseErr}`);
          }
        } 
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith("Error parsing command file")
      )
        window.showErrorMessage(err.message);
      else {
        window.showErrorMessage(`Error reading command files: ${err}`);
      }
    } finally {
      // Send updated global layouts to TablePanels & PropertyPanel
      TablePanel.updateCommands();
      PropertyPanelProvider.updateCommands();
    }
  }
};
