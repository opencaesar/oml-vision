import { workspace, Uri, commands, window, FileType } from "vscode";
import { TreeDataProvider } from "../../sidebar/TreeDataProvider";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)

/**
 * Loads JSON files that are stored in the layouts folder of the model.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param layoutContents - content of the layout object
 *
 */
export const loadLayoutFiles = async (layoutContents: {
  [file: string]: any;
}) => {
  commands.executeCommand("setContext", "vision:hasPageLayout", false);
  TreeDataProvider.getInstance().updateHasPageLayout(false);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    const uri = workspaceFolders[0].uri;
    loadPageFile(uri, layoutContents);
    loadTableFiles(uri, layoutContents);
    loadTreeFiles(uri, layoutContents);
    loadDiagramFiles(uri, layoutContents);
  }
};

/**
 * Loads pages.json file.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param layoutContents - content of the layout object
 *
 */
const loadPageFile = async (
  uri: Uri,
  layoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const pageFolderUri = Uri.joinPath(uri, "src", "vision", "layouts");

  try {
    const files = await workspace.fs.readDirectory(pageFolderUri);
    for (const [file, type] of files) {
      if (file === "pages.json" && type === FileType.File) {
        const fileUri = Uri.joinPath(pageFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        try {
          TreeDataProvider.getInstance().updateLayouts(content);
          TreeDataProvider.getInstance().updateHasPageLayout(true);
          layoutContents[file] = content;
        } catch (parseErr) {
          layoutContents = {};
          throw new Error(
            `Error parsing table layout file ${file}: ${parseErr}`
          );
        }
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

/**
 * Loads table layouts from the tables directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param layoutContents - content of the layout object
 *
 */
const loadTableFiles = async (
  uri: Uri,
  layoutContents: {
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
      if (file.endsWith(".json") && type === FileType.File) {
        setLayoutContent(tableFolderUri, file, layoutContents);
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

/**
 * Loads tree layouts from the trees directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param layoutContents - content of the layout object
 *
 */
const loadTreeFiles = async (
  uri: Uri,
  layoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const treeFolderUri = Uri.joinPath(uri, "src", "vision", "layouts", "trees");

  try {
    const files = await workspace.fs.readDirectory(treeFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setLayoutContent(treeFolderUri, file, layoutContents);
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

/**
 * Loads diagram layouts from the diagrams directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param layoutContents - content of the layout object
 *
 */
const loadDiagramFiles = async (
  uri: Uri,
  layoutContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const diagramFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "layouts",
    "diagrams"
  );

  try {
    const files = await workspace.fs.readDirectory(diagramFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setLayoutContent(diagramFolderUri, file, layoutContents);
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
    window.showErrorMessage(`Error reading diagram layout files: ${err}`);
  } finally {
    // Send updated global layouts to TablePanels & PropertyPanel
    TablePanel.updateLayouts();
    PropertyPanelProvider.updateLayouts();
  }
};

/**
 * Set the Layout Content.
 *
 * @remarks
 * This method uses the URI class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param file - The file name.
 * @param layouts - The layouts object which will be set.
 *
 */
const setLayoutContent = async (uri: Uri, file: string, layouts: any) => {
  const fileUri = Uri.joinPath(uri, file);
  const buffer = await workspace.fs.readFile(fileUri);
  const content = JSON.parse(buffer.toString());
  try {
    layouts[file] = content;
  } catch (parseErr) {
    layouts = {};
    throw new Error(`Error parsing table layout file ${file}: ${parseErr}`);
  }
};
