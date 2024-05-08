import { workspace, Uri, commands, window, FileType } from "vscode";
import { TreeDataProvider } from "../../sidebar/TreeDataProvider";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";
// TODO: handle multiple workspaces (currently assumes model is in the 1st)

/**
 * Loads JSON files that are stored in the viewpoints folder of the model.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param viewpointContents - content of the viewpoint object
 *
 */
export const loadViewpointFiles = async (viewpointContents: {
  [file: string]: any;
}) => {
  commands.executeCommand("setContext", "vision:hasPageViewpoint", false);
  TreeDataProvider.getInstance().updateHasPageViewpoint(false);

  const workspaceFolders = workspace.workspaceFolders;
  if (workspaceFolders) {
    const uri = workspaceFolders[0].uri;
    loadPageFile(uri, viewpointContents);
    loadTableFiles(uri, viewpointContents);
    loadTreeFiles(uri, viewpointContents);
    loadDiagramFiles(uri, viewpointContents);
    loadPropertyFiles(uri, viewpointContents);
    loadWizardFiles(uri, viewpointContents);
  }
};

/**
 * Loads pages.json file.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadPageFile = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const pageFolderUri = Uri.joinPath(uri, "src", "vision", "viewpoints");

  try {
    const files = await workspace.fs.readDirectory(pageFolderUri);
    for (const [file, type] of files) {
      if (file === "pages.json" && type === FileType.File) {
        const fileUri = Uri.joinPath(pageFolderUri, file);
        const buffer = await workspace.fs.readFile(fileUri);
        const content = JSON.parse(buffer.toString());
        try {
          TreeDataProvider.getInstance().updateViewpoints(content);
          TreeDataProvider.getInstance().updateHasPageViewpoint(true);
          viewpointContents[file] = content;
        } catch (parseErr) {
          viewpointContents = {};
          throw new Error(
            `Error parsing table viewpoint file ${file}: ${parseErr}`
          );
        }
      }
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing viewpoint file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading viewpoint files: ${err}`);
    }
  }
};

/**
 * Loads table viewpoints from the tables directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadTableFiles = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const tableFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "viewpoints",
    "tables"
  );

  try {
    const files = await workspace.fs.readDirectory(tableFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setViewpointContent(tableFolderUri, file, viewpointContents);
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageViewpoint", true);
      window.showInformationMessage(
        "Table viewpoint files loaded successfully."
      );
    } else {
      window.showWarningMessage("Table viewpoint files not found.");
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing table viewpoint file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading table viewpoint files: ${err}`);
    }
  } finally {
    // Send updated global viewpoints to TablePanels & PropertyPanel
    TablePanel.updateViewpoints();
    PropertyPanelProvider.updateViewpoints();
  }
};

/**
 * Loads tree viewpoints from the trees directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadTreeFiles = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const treeFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "viewpoints",
    "trees"
  );

  try {
    const files = await workspace.fs.readDirectory(treeFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setViewpointContent(treeFolderUri, file, viewpointContents);
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageViewpoint", true);
      window.showInformationMessage(
        "Tree viewpoint files loaded successfully."
      );
    } else {
      window.showWarningMessage("Tree viewpoint files not found.");
    }
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.startsWith("Error parsing tree viewpoint file")
    )
      window.showErrorMessage(err.message);
    else {
      window.showErrorMessage(`Error reading tree viewpoint files: ${err}`);
    }
  } finally {
    // Send updated global viewpoints to TablePanels & PropertyPanel
    TablePanel.updateViewpoints();
    PropertyPanelProvider.updateViewpoints();
  }
};

/**
 * Loads diagram viewpoints from the diagrams directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadDiagramFiles = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const diagramFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "viewpoints",
    "diagrams"
  );

  try {
    const files = await workspace.fs.readDirectory(diagramFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setViewpointContent(diagramFolderUri, file, viewpointContents);
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageViewpoint", true);
      window.showInformationMessage(
        "Diagram viewpoint files loaded successfully."
      );
    } else {
      window.showWarningMessage("Diagram viewpoint files not found.");
    }
  } catch (err) {
    window.showErrorMessage(`Error reading diagram viewpoint files: ${err}`);
  } finally {
    // Send updated global viewpoints to TablePanels & PropertyPanel
    TablePanel.updateViewpoints();
    PropertyPanelProvider.updateViewpoints();
  }
};

/**
 * Loads property viewpoints from the properties directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadPropertyFiles = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const propertyFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "viewpoints",
    "properties"
  );

  try {
    const files = await workspace.fs.readDirectory(propertyFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setViewpointContent(propertyFolderUri, file, viewpointContents);
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageViewpoint", true);
      window.showInformationMessage(
        "Property viewpoint files loaded successfully."
      );
    } else {
      window.showWarningMessage("Property viewpoint files not found.");
    }
  } catch (err) {
    window.showErrorMessage(`Error reading property viewpoint files: ${err}`);
  } finally {
    // Send updated global viewpoints to TablePanels & PropertyPanel
    TablePanel.updateViewpoints();
    PropertyPanelProvider.updateViewpoints();
  }
};

/**
 * Loads wizard viewpoints from the wizards directory.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param viewpointContents - content of the viewpoint object
 *
 */
const loadWizardFiles = async (
  uri: Uri,
  viewpointContents: {
    [file: string]: any;
  }
) => {
  // Uri is required for VSCode extension to determine path to file or folder
  const wizardFolderUri = Uri.joinPath(
    uri,
    "src",
    "vision",
    "viewpoints",
    "wizards"
  );

  try {
    const files = await workspace.fs.readDirectory(wizardFolderUri);
    for (const [file, type] of files) {
      if (file.endsWith(".json") && type === FileType.File) {
        setViewpointContent(wizardFolderUri, file, viewpointContents);
      }
    }
    if (files.length > 0) {
      commands.executeCommand("setContext", "vision:hasPageViewpoint", true);
      window.showInformationMessage(
        "Wizard viewpoint files loaded successfully."
      );
    } else {
      window.showWarningMessage("Wizard viewpoint files not found.");
    }
  } catch (err) {
    window.showErrorMessage(`Error reading wizard viewpoint files: ${err}`);
  } finally {
    // Send updated global viewpoints to TablePanels & PropertyPanel
    TablePanel.updateViewpoints();
    PropertyPanelProvider.updateViewpoints();
  }
};

/**
 * Set the viewpoint Content.
 *
 * @remarks
 * This method uses the URI class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param uri - A universal resource identifier representing either a file on disk or another resource, like untitled resources.
 * @param file - The file name.
 * @param viewpoints - The viewpoints object which will be set.
 *
 */
const setViewpointContent = async (uri: Uri, file: string, viewpoints: any) => {
  const fileUri = Uri.joinPath(uri, file);
  const buffer = await workspace.fs.readFile(fileUri);
  const content = JSON.parse(buffer.toString());
  try {
    viewpoints[file] = content;
  } catch (parseErr) {
    viewpoints = {};
    throw new Error(`Error parsing table viewpoint file ${file}: ${parseErr}`);
  }
};
