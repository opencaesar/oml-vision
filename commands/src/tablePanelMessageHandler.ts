import { Commands, CommandStructures } from "./commands";
import * as vscode from "vscode";
import { generateTableData } from "../../controller/src/sparql/data-manager/generateDataUtils";
import { TablePanel } from "../../controller/src/panels/TablePanel";
import { SparqlClient } from "../../controller/src/sparql/SparqlClient";
import { getElementRelations } from "../../controller/src/sparql/data-manager/getElementRelations";
import { executeDeleteElements } from "../../controller/src/sparql/data-manager/executeDeleteElements";
import { getElementRelationsTotal } from "../../controller/src/sparql/data-manager/getElementRelationsTotal";
import { getAllElementRelations } from "../../controller/src/sparql/data-manager/getAllElementRelations";
import { getAllInstanceCategories } from "../../controller/src/sparql/data-manager/getAllInstanceCategories";

/**
 * Handles commands that are sent to a Editor (Table, Tree, or Diagram)
 * https://code.visualstudio.com/api/ux-guidelines/overview#editor
 */
export function handleTablePanelMessage(
  message: CommandStructures[Commands] & { command: Commands },
  TablePanelInstance: TablePanel
) {
  let specificMessage: any;
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

    case Commands.GET_ELEMENT_RELATIONS:
      specificMessage =
        message as CommandStructures[Commands.GET_ELEMENT_RELATIONS];

      // Refer to the CommandStructures[Commands.GET_ELEMENT_RELATIONS] to see how the parameters are structured
      getElementRelations(
        specificMessage.payload.webviewPath,
        specificMessage.wizardId,
        specificMessage.payload.iriArray,
        specificMessage.payload.labelArray
      );
      break;

    case Commands.GET_ELEMENT_RELATIONS_TOTAL:
      specificMessage =
        message as CommandStructures[Commands.GET_ELEMENT_RELATIONS_TOTAL];

      // Refer to the CommandStructures[Commands.GET_ELEMENT_RELATIONS] to see how the parameters are structured
      getElementRelationsTotal(
        specificMessage.payload.webviewPath,
        specificMessage.wizardId,
        specificMessage.payload.iriArray,
        specificMessage.payload.labelArray
      );
      break;

    case Commands.EXECUTE_DELETE_ELEMENTS:
      specificMessage =
        message as CommandStructures[Commands.EXECUTE_DELETE_ELEMENTS];
      const { webviewPath: delWebviewPath, IRIsToDelete = [] } =
        specificMessage.payload;

      // Refer to the CommandStructures[Commands.EXECUTE_DELETE_ELEMENTS] to see how the parameters are structured
      executeDeleteElements(
        specificMessage.payload.webviewPath,
        specificMessage.wizardId,
        specificMessage.payload.IRIsToDelete
      );
      break;

    case Commands.GET_ALL_ELEMENT_RELATIONS:
      specificMessage =
        message as CommandStructures[Commands.GET_ALL_ELEMENT_RELATIONS];
      const { webviewPath: relationWebviewPath } = specificMessage.payload;

      // Refer to the CommandStructures[Commands.GET_ALL_ELEMENT_RELATIONS] to see how the parameters are structured
      getAllElementRelations(specificMessage.payload.webviewPath);

    case Commands.GET_ALL_INSTANCE_CATEGORIES:
      specificMessage =
        message as CommandStructures[Commands.GET_ALL_INSTANCE_CATEGORIES];
      const { webviewPath: instanceWebviewPath } = specificMessage.payload;

      // Refer to the CommandStructures[Commands.GET_ALL_ELEMENT_RELATIONS] to see how the parameters are structured
      getAllInstanceCategories(specificMessage.payload.webviewPath);

    case Commands.CREATE_FCR:
      specificMessage = message as CommandStructures[Commands.CREATE_FCR];
      const fcrPayload = specificMessage.payload;
      break;

    case Commands.EXECUTE_CREATE_ELEMENTS:
      specificMessage =
        message as CommandStructures[Commands.EXECUTE_CREATE_ELEMENTS];
      const { properties, graph } = specificMessage.payload;
      break;

    case Commands.CREATE_QUERY:
      specificMessage = message as CommandStructures[Commands.CREATE_QUERY];
      if (specificMessage.selectedElements) {
        specificMessage.selectedElements.forEach((param: any) => {
          SparqlClient(specificMessage.query, "update", param);
        });
      } else {
        SparqlClient(specificMessage.query, "update", specificMessage);
      }
      break;

    case Commands.READ_QUERY:
      specificMessage = message as CommandStructures[Commands.READ_QUERY];
      if (specificMessage.selectedElements) {
        specificMessage.selectedElements.forEach((param: any) => {
          SparqlClient(specificMessage.query, "query", param);
        });
      } else {
        SparqlClient(specificMessage.query, "query", specificMessage);
      }
      break;

    case Commands.UPDATE_QUERY:
      specificMessage = message as CommandStructures[Commands.UPDATE_QUERY];
      if (specificMessage.selectedElements) {
        specificMessage.selectedElements.forEach((param: any) => {
          SparqlClient(specificMessage.query, "update", param);
        });
      } else {
        SparqlClient(specificMessage.query, "update", specificMessage);
      }
      break;

    case Commands.DELETE_QUERY:
      specificMessage = message as CommandStructures[Commands.DELETE_QUERY];
      if (specificMessage.selectedElements) {
        specificMessage.selectedElements.forEach((param: any) => {
          SparqlClient(specificMessage.query, "update", param);
        });
      } else {
        SparqlClient(specificMessage.query, "update", specificMessage);
      }
      break;

    default:
      throw new Error(`Unhandled command: ${message.command}`);
  }
}
