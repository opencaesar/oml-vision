import * as vscode from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { Commands } from "../../../../commands/src/commands";
import { SparqlClient } from "../SparqlClient";
import { getAllInstances } from "../queries/getAllInstances";

/**
 * This SPARQL query gets all distinct instances from a given OML model and sends them through a controller command.
 *
 * @remarks
 * For more information on OML instances please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Instances-LR | here}
 *
 * For more information on the postMessage controller command please refer to the official documentation found {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage | here}
 *
 * @returns
 *
 */
export const getAllInstanceCategories = async (
  webviewPath: string
): Promise<void> => {
  try {
    const instance_query = getAllInstances();
    const instance_data = await SparqlClient(instance_query, "query");
    // Get all instance values
    const instances: string[] = instance_data.map(
      (instance: Record<string, string>) => {
        // We only want values because the record will look like verb: instance_value
        // We're only grabbing the verb from the key value pair
        // If the instance.verb is not undefined then return it else return a blank string
        return instance.subject.split("/").pop() ?? "";
      }
    );
    // Send data to current webview
    TablePanel.currentPanels.get(webviewPath)?.sendMessage({
      command: Commands.LOADED_ALL_INSTANCE_CATEGORIES,
      payload: {
        instances: instances,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ALL_INSTANCE_CATEGORIES,
        payload: {},
        errorMessage: `Error: ${error.message}`,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ALL_INSTANCE_CATEGORIES,
        payload: {},
        errorMessage: `An unknown error occurred: ${error}`,
      });
    }
  }
};
