import * as vscode from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { Commands } from "../../../../commands/src/commands";
import { SparqlClient } from "../SparqlClient";
import { getAllRelations } from "../queries/getAllRelations";

/**
 * This SPARQL query gets all distinct relations from a given OML model and sends them through a controller command.
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * For more information on the postMessage controller command please refer to the official documentation found {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage | here}
 *
 * @returns
 *
 */
export const getAllElementRelations = async (
    webviewPath: string
): Promise<void> => {
  try {
    const relations_query = getAllRelations();
    const relations_data = await SparqlClient(relations_query, "query");
    
    // Get all relation values
    const relations: string[] = relations_data.map(
        (relation: Record<string, string>) => {
            // We only want values because the record will look like verb: relation_value
            // We're only grabbing the verb from the key value pair
            // If the relation.verb is not undefined then return it else return a blank string
            return relation.verb.split('/').pop() ?? "";
        }
    );
    
    // Send data to current webview
    TablePanel.currentPanels.get(webviewPath)?.sendMessage({
      command: Commands.LOADED_ALL_ELEMENT_RELATIONS,
      payload: {
        relations: relations,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ALL_ELEMENT_RELATIONS,
        payload: {},
        errorMessage: `Error: ${error.message}`,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ALL_ELEMENT_RELATIONS,
        payload: {},
        errorMessage: `An unknown error occurred: ${error}`,
      });
    }
  }
};