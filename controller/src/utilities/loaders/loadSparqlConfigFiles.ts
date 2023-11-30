import { workspace, Uri, commands, window, FileType } from "vscode";
import { SidebarProvider } from "../../Sidebar";

export let globalQueryEndpoint: string = "";
export let globalUpdateEndpoint: string = "";

export async function loadSparqlConfigFiles() {
    commands.executeCommand("setContext", "vision:hasSparqlConfig", false);
    SidebarProvider.getInstance().updateHasSparqlConfig(false);
  
    const workspaceFolders = workspace.workspaceFolders;
    if (workspaceFolders) {
      const uri = workspaceFolders[0].uri;
      const layoutsFolderUri = Uri.joinPath(
        uri,
        "src",
        "vision",
        "config"
      );
  
      try {
        const files = await workspace.fs.readDirectory(layoutsFolderUri);
  
        for (const [file, type] of files) {
          if (file.endsWith(".json") && type === FileType.File) {
            const fileUri = Uri.joinPath(layoutsFolderUri, file);
            const buffer = await workspace.fs.readFile(fileUri);
            try {
              const content: Record<string,string> = JSON.parse(buffer.toString());
              if (file === "sparqlConfig.json") {
                globalQueryEndpoint = content.queryEndpoint;
                globalUpdateEndpoint = content.updateEndpoint;
                SidebarProvider.getInstance().updateHasSparqlConfig(true);
              }
            } catch (parseErr) {
              throw new Error(`Error parsing ${file}: ${parseErr}`);
            }
          }
        }
        if (files.length > 0) {
          commands.executeCommand(
            "setContext",
            "vision:hasSparqlConfig",
            true
          );
          window.showInformationMessage(
            "Sparql Config files loaded successfully."
          );
        } else {
          window.showWarningMessage("Sparql Config files not found.");
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.message.startsWith("Error parsing Sparql Config file")
        )
          window.showErrorMessage(err.message);
        else {
          window.showErrorMessage(
            `Error reading Sparql Config files: ${err}`
          );
        }
      }
    }
  }