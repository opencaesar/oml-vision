import { workspace, Uri, commands, window, FileType } from "vscode";
import { TreeDataProvider } from "../../sidebar/TreeDataProvider";
import { validateSchema } from "../../schemas/validator";
import { sparqlConfigSchema } from "../../schemas/config/sparqlConfigSchema";

export let globalQueryEndpoint: string = "";
export let globalPingEndpoint: string = "";
export let globalUpdateAssertionEndpoint: string = "";
export let globalUpdateInferenceEndpoint: string = "";

/**
 * Loads JSON files that are stored in the config folder of the model.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 *
 */
export async function loadSparqlConfigFiles() {
  commands.executeCommand("setContext", "vision:hasSparqlConfig", false);
  TreeDataProvider.getInstance().updateHasSparqlConfig(false);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    const uri = workspaceFolders[0].uri;
    const configFolderUri = Uri.joinPath(uri, "src", "vision", "config");

    try {
      const files = await workspace.fs.readDirectory(configFolderUri);

      for (const [file, type] of files) {
        if (file.endsWith(".json") && type === FileType.File) {
          const fileUri = Uri.joinPath(configFolderUri, file);
          const buffer = await workspace.fs.readFile(fileUri);
          try {
            const content: Record<string, string> = JSON.parse(
              buffer.toString()
            );
            // Validate if the content matches the SPARQL Config Schema
            const validate = validateSchema(sparqlConfigSchema, content);
            if (files.length > 0 && file === "sparqlConfig.json" && validate) {
              globalQueryEndpoint = content.queryEndpoint;
              globalPingEndpoint = content.pingEndpoint;
              globalUpdateAssertionEndpoint = content.updateAssertionEndpoint;
              globalUpdateInferenceEndpoint = content.updateInferenceEndpoint;
              commands.executeCommand(
                "setContext",
                "vision:hasSparqlConfig",
                true
              );
              window.showInformationMessage(
                `${file} loaded successfully.`
              );
              TreeDataProvider.getInstance().updateHasSparqlConfig(true);
            } else {
              window.showErrorMessage(`Invalid or missing ${file}.`);
            }
          } catch (parseErr) {
            throw new Error(`Error parsing ${file}: ${parseErr}`);
          }
        }
      }
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.startsWith("Error parsing Sparql Config file")
      )
        window.showErrorMessage(err.message);
      else {
        window.showErrorMessage(`Error reading Sparql Config files: ${err}`);
      }
    }
  }
}
