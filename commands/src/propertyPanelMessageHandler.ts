import { Commands, CommandStructures } from "./commands";
import * as vscode from "vscode";
import { PropertyPanelProvider } from "../../controller/src/panels/PropertyPanelProvider";
import { TablePanel } from "../../controller/src/panels/TablePanel";
import { SparqlClient } from "../../controller/src/sparql/SparqlClient";

/**
 * Handles commands that are sent to a Panel (Property Page)
 * https://code.visualstudio.com/api/ux-guidelines/overview#panel
 */
export function handlePropertyPanelMessage(
  message: CommandStructures[Commands] & { command: Commands },
  PropertyPanelInstance: PropertyPanelProvider
) {
  let specificMessage: any;
  switch (message.command) {
    case Commands.ALERT:
      const alertMessage = message as CommandStructures[Commands.ALERT];
      vscode.window.showErrorMessage(alertMessage.text);
      return;

    case Commands.INFORM:
      const infoMessage = message as CommandStructures[Commands.INFORM];
      vscode.window.showInformationMessage(infoMessage.text);
      return;

    case Commands.ASK_FOR_PROPERTIES:
      vscode.commands.executeCommand("oml-vision.sendPropertiesToPanel");
      return;

    case Commands.ASK_FOR_VIEWPOINTS:
      vscode.commands.executeCommand(
        "oml-vision.sendViewpoints",
        PropertyPanelInstance
      );
      return;

    case Commands.ASK_FOR_COMMANDS:
      vscode.commands.executeCommand(
        "oml-vision.sendCommands",
        PropertyPanelInstance
      );
      return;

    case Commands.RECEIVED_PROPERTIES:
      // Handshake to acknowledge properties
      // were received. This avoids a race condition
      // when webview needs to be focused
      PropertyPanelInstance.setPendingPayload(null);
      return;

    case Commands.PROPERTIES_FORM_DATA:
      specificMessage =
        message as CommandStructures[Commands.PROPERTIES_FORM_DATA];
      if (specificMessage.payload) {
        const pfdPayload = specificMessage.payload as any;
      }
      return;

    case Commands.UPDATE_QUERY:
      specificMessage = message as CommandStructures[Commands.UPDATE_QUERY];
      if (
        specificMessage.before_parameters &&
        specificMessage.after_parameters
      ) {
        if (specificMessage.selectedElements) {
          specificMessage.selectedElements.forEach((param: any) => {
            SparqlClient(
              specificMessage.query,
              "update",
              param,
              specificMessage.before_parameters,
              specificMessage.after_parameters
            );
          });
        }
      }
      break;

    case Commands.GENERATE_PROPERTY_SHEET:
      specificMessage =
        message as CommandStructures[Commands.GENERATE_PROPERTY_SHEET];
      vscode.commands.executeCommand(
        "oml-vision.generatePropertySheet",
        specificMessage.payload
      );
      return;

    case Commands.REFRESH_TABLE_DATA:
      TablePanel.updateTables();
      break;

    default:
      throw new Error(`Unhandled command: ${message.command}`);
  }
}
