import { workspace, Uri, commands, window, FileType } from "vscode";
import { SidebarProvider } from "../../Sidebar";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)export
export async function loadLayoutFiles(globalLayoutContents: {
  [file: string]: any;
}) {
  commands.executeCommand("setContext", "vision:hasPageLayout", false);
  SidebarProvider.getInstance().updateHasPageLayout(false);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    const uri = workspaceFolders[0].uri;
    loadPageFile(uri);
    loadTableFiles(uri, globalLayoutContents);
    loadTreeFiles(uri, globalLayoutContents);
    loadDiagramFiles(uri, globalLayoutContents);
  }
}

const loadPageFile = async (uri: Uri) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const pageFolderUri = Uri.joinPath(uri, "src", "vision", "layouts");

  try {
    const files = await workspace.fs.readDirectory(pageFolderUri);
    for (const [file, type] of files) {
      if (file === "pages.json" && type === FileType.File) {
        const fileUri = Uri.joinPath(pageFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        SidebarProvider.getInstance().updateLayouts(content);
        SidebarProvider.getInstance().updateHasPageLayout(true);
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing layout file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading layout files: ${err}`);
    }
  }
};

const loadTableFiles = async (
  uri: Uri,
  globalLayoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const tableFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "layouts",
    "tables"
  );

  try {
    const files = await workspace.fs.readDirectory(tableFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith("json") && type === FileType.File) {
        const fileUri = Uri.joinPath(tableFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        try {
          globalLayoutContents[file] = content;
        } catch (parseErr) {
          globalLayoutContents = {};
          throw new Error(
            `Error parsing table layout file ${file}: ${parseErr}`
          );
        }
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageLayout", true);
      window.showInformationMessage("Table Layout files loaded successfully.");
    } else {
      window.showWarningMessage("Table Layout files not found.");
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing table layout file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading table layout files: ${err}`);
    }
  } finally {
    // Send updated global layouts to TablePanels & PropertyPanel
    TablePanel.updateLayouts();
    PropertyPanelProvider.updateLayouts();
  }
};

const loadTreeFiles = async (
  uri: Uri,
  globalLayoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const treeFolderUri = Uri.joinPath(uri, "src", "vision", "layouts", "trees");

  try {
    const files = await workspace.fs.readDirectory(treeFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith("json") && type === FileType.File) {
        const fileUri = Uri.joinPath(treeFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        try {
          globalLayoutContents[file] = content;
        } catch (parseErr) {
          globalLayoutContents = {};
          throw new Error(
            `Error parsing tree layout file ${file}: ${parseErr}`
          );
        }
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageLayout", true);
      window.showInformationMessage("Tree Layout files loaded successfully.");
    } else {
      window.showWarningMessage("Tree Layout files not found.");
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing tree layout file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading tree layout files: ${err}`);
    }
  } finally {
    // Send updated global layouts to TablePanels & PropertyPanel
    TablePanel.updateLayouts();
    PropertyPanelProvider.updateLayouts();
  }
};

const loadDiagramFiles = async (
  uri: Uri,
  globalLayoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const diagramFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "layouts",
    "tables"
  );

  try {
    const files = await workspace.fs.readDirectory(diagramFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith("json") && type === FileType.File) {
        const fileUri = Uri.joinPath(diagramFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        try {
          globalLayoutContents[file] = content;
        } catch (parseErr) {
          globalLayoutContents = {};
          throw new Error(
            `Error parsing diagram layout file ${file}: ${parseErr}`
          );
        }
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageLayout", true);
      window.showInformationMessage(
        "Diagram Layout files loaded successfully."
      );
    } else {
      window.showWarningMessage("Diagram Layout files not found.");
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing diagram layout file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading diagram layout files: ${err}`);
    }
  } finally {
    // Send updated global layouts to TablePanels & PropertyPanel
    TablePanel.updateLayouts();
    PropertyPanelProvider.updateLayouts();
  }
};
