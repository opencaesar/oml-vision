import { Commands, CommandStructures } from './commands';
import * as vscode from "vscode";
import { generateTableData } from "../../controller/src/sparql/data-manager/generateDataUtils";
import { TablePanel } from "../../controller/src/panels/TablePanel";

/**
 * Handles commands that are sent to a Editor (Table, Tree, or Diagram)
 * https://code.visualstudio.com/api/ux-guidelines/overview#editor
 */
export function handleTablePanelMessage(
  message: CommandStructures[Commands] & { command: Commands; },
  TablePanelInstance: TablePanel,
) {

  let specificMessage;
  switch (message.command) {
    case Commands.CREATE_TABLE:
      specificMessage = message as CommandStructures[Commands.CREATE_TABLE];
      vscode.commands.executeCommand(
        "oml-vision.createWebview",
        specificMessage.payload
      );
      break;

    case Commands.ALERT:
      specificMessage = message as CommandStructures[Commands.ALERT];
      vscode.window.showErrorMessage(specificMessage.text);
      break;

    case Commands.INFORM:
      specificMessage = message as CommandStructures[Commands.INFORM];
      vscode.window.showInformationMessage(specificMessage.text);
      break;

    case Commands.ROW_CLICKED:
      specificMessage = message as CommandStructures[Commands.ROW_CLICKED];
      vscode.commands.executeCommand(
        "oml-vision.showProperties",
        specificMessage.payload,
        TablePanelInstance.getWebviewType()
      );
      break;

    case Commands.HIDE_PROPERTIES:
      vscode.commands.executeCommand("oml-vision.hideProperties");
      break;

    case Commands.ASK_FOR_VIEWPOINTS:
      vscode.commands.executeCommand(
        "oml-vision.sendViewpoints",
        TablePanel.currentPanels.get(TablePanelInstance.getWebviewType().path)
      );
      break;

    case Commands.ASK_FOR_COMMANDS:
      vscode.commands.executeCommand(
        "oml-vision.sendCommands",
        TablePanel.currentPanels.get(TablePanelInstance.getWebviewType().path)
      );
      break;

    case Commands.GENERATE_TABLE_DATA:
      specificMessage =
        message as CommandStructures[Commands.GENERATE_TABLE_DATA];
      const { webviewPath = "", queries = {} } = specificMessage.payload;
      generateTableData(webviewPath, queries);
      const pendingFilter = TablePanelInstance.getPendingPayload();
      if (pendingFilter) {
        const payload =
          pendingFilter as CommandStructures[Commands.CREATE_FILTERED_DIAGRAM]["payload"];
        TablePanelInstance.sendMessage({
          command: Commands.CREATE_FILTERED_DIAGRAM,
          payload,
        });
        TablePanelInstance.setPendingPayload("");
      }
      break;

    case Commands.UPDATE_CM_STATE:
      specificMessage = message as CommandStructures[Commands.UPDATE_CM_STATE];
      const updates: { aIri: string; fse_lifecycleState: string }[] =
        specificMessage.payload;
      break;

    case Commands.REFRESH_TABLE_DATA:
      TablePanel.updateTables();
      break;

    case Commands.GET_ELEMENT_DEPENDENCIES:
      specificMessage =
        message as CommandStructures[Commands.GET_ELEMENT_DEPENDENCIES];
      const {
        webviewPath: depWebviewPath,
        iriArray = [],
        labelArray = [],
      } = specificMessage.payload;
      break;

    case Commands.EXECUTE_DELETE_ELEMENTS:
      specificMessage =
        message as CommandStructures[Commands.EXECUTE_DELETE_ELEMENTS];
      const { webviewPath: delWebviewPath, IRIsToDelete = [] } =
        specificMessage.payload;
      break;

    case Commands.CREATE_FCR:
      specificMessage = message as CommandStructures[Commands.CREATE_FCR];
      const fcrPayload = specificMessage.payload;
      break;

    case Commands.EXECUTE_CREATE_ELEMENTS:
      specificMessage =
        message as CommandStructures[Commands.EXECUTE_CREATE_ELEMENTS];
      const { properties, graph } = specificMessage.payload;
      break;

    default:
      throw new Error(`Unhandled command: ${message.command}`);
  }
}