import * as vscode from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { Commands } from "../../../../commands/src/commands";
import { SparqlClient } from "../SparqlClient";
import ITableData from "../../../../view/src/interfaces/ITableData";
import { deleteSubject } from "../queries/deleteSubject";
import { deleteObject } from "../queries/deleteObject";

/**
 * This function executes the delete function to delete all instances, relations of instances, and reified relations for a given IRI which is a owl:NamedIndividual
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * For more information on reified relations please refer to the official documentation found {@link https://en.wikipedia.org/wiki/Reification_(computer_science)#On_Semantic_Web | here}
 *
 * @returns SPARQL query
 *
 */

export const executeDeleteElements = async (
  webviewPath: string,
  wizardId: string,
  iriArray: ITableData[]
) => {
  try {
    // Iterate over the full list of IRIs recursively.  Refer to https://en.wikibooks.org/wiki/SPARQL/Triples for more information
    iriArray.map(async (iri: ITableData) => {
      await deleteChildrenRecursively(iri);
    });

    // Send data to current webview
    TablePanel.currentPanels.get(webviewPath)?.sendMessage({
      command: Commands.DELETED_ELEMENTS,
      payload: {
        success: true,
      },
      wizardId: wizardId,
    });
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.DELETED_ELEMENTS,
        payload: {
          success: false,
        },
        errorMessage: `Error: ${error.message}`,
        wizardId,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.DELETED_ELEMENTS,
        payload: {
          success: false,
        },
        errorMessage: `An unknown error occurred: ${error}`,
        wizardId,
      });
    }
  }
};

/**
 * This function deletes all instances, relations of instances, and reified relations of instances for a given IRI which is a owl:NamedIndividual
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * For more information on reified relations please refer to the official documentation found {@link https://en.wikipedia.org/wiki/Reification_(computer_science)#On_Semantic_Web | here}
 *
 * @returns Promise to delete all instances, relations of instances, and reified relations
 *
 */
const deleteChildrenRecursively = async (iri: ITableData): Promise<void> => {
  // Format the IRI name to remove the # in the IRI
  const formattedSubjectGraph = iri.name.split("#")[0];

  // Input the IRI name and formatted graph into the delete subject query
  const deleteSubjectQuery = deleteSubject(iri.name, formattedSubjectGraph);

  // Execute the delete subject query
  await SparqlClient(deleteSubjectQuery, "update");

  // Iterate over the full list of children objects sequentially
  for (const child of iri.children) {
    // Format the child IRI name to remove the # in the IRI
    const formattedObjectGraph = child.name.split("#")[0];

    // Input the IRI name and formatted child graph into the delete object query
    const deleteObjectQuery = deleteObject(iri.name, formattedObjectGraph);

    // Execute the delete object query
    await SparqlClient(deleteObjectQuery, "update");

    // Input the IRI name and formatted child graph into the delete subject query in the child graph
    // This will delete any ref instances.  Refer to `ref instance` in the official OML docs http://www.opencaesar.io/oml/
    const deleteSubjectChildQuery = deleteSubject(iri.name, formattedObjectGraph);

    // Execute the delete subject child query
    await SparqlClient(deleteSubjectChildQuery, "update");

    // Handles deletion of reified relations by recursively calling the delete function
    if (child.children) {
      await deleteChildrenRecursively(child);
    }
  }
};
