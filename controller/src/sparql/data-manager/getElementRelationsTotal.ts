import * as vscode from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { Commands } from "../../../../commands/src/commands";
import { SparqlClient } from "../SparqlClient";
import { v4 as uuid } from "uuid";
import { uniqBy } from "lodash";
import { getIriRelationsTotal } from "../queries/getIriRelationsTotal";

/**
 * This SPARQL query gets all total relations (predicate/verb and object) for a given IRI which is a owl:NamedIndividual and sends them through a controller command.
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * @returns
 *
 */

export const getElementRelationsTotal = async (
  webviewPath: string,
  wizardId: string,
  iriArray: string[],
  labelArray?: string[]
): Promise<void> => {
  try {
    let results: Record<string, any>[] = [];
    let data = {
      verb: "",
      object: ""
    };
    await Promise.all(
      iriArray.map(async (iri: string) => {
        const relations_query = getIriRelationsTotal(iri);
        const relations_data = await SparqlClient(relations_query, "query");

        // Iterate over relations
        relations_data.map(async (relation: Record<string, any>) => {
          console.log("relation")
          console.log(relation)
          // Grab the verb from the RDF triple.  Refer to https://en.wikipedia.org/wiki/Semantic_triple
          data.verb = relation.verb;
          data.object = relation.object;

          // Add the new data to the results record
          results.push(data);

          // Reset data
          data = {
            verb: "",
            object: ""
          };
        });
      })
    );

    checkForCircularReferences(results);

    // Send data to current webview
    TablePanel.currentPanels.get(webviewPath)?.sendMessage({
      command: Commands.LOADED_ELEMENT_RELATIONS_TOTAL,
      payload: {
        relations: results,
      },
      wizardId: wizardId,
    });
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ELEMENT_RELATIONS_TOTAL,
        payload: {},
        errorMessage: `Error: ${error.message}`,
        wizardId,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ELEMENT_RELATIONS_TOTAL,
        payload: {},
        errorMessage: `An unknown error occurred: ${error}`,
        wizardId,
      });
    }
  }
};

/**
 * Checks if the given data structure contains any circular references or the string '[Circular]'.
 * If a circular reference or '[Circular]' string is found, it throws an error.
 *
 * @remarks Please refer to this stack overflow example for more information found {@link https://stackoverflow.com/questions/14962018/detecting-and-fixing-circular-references-in-javascript | here}
 *
 * @param data - The data structure to check for circular references.
 * @throws {Error} If a circular reference or '[Circular]' string is found.
 */
function checkForCircularReferences(data: Object): void {
  const seen = new WeakSet();

  /**
   * Recursive helper function to traverse the data structure and check for circular references.
   *
   * @param obj - The object to check for circular references.
   * @throws {Error} If a circular reference or '[Circular]' string is found.
   */
  function traverse(obj: Object | Array<string>): void {
    // Base case: If the value is not an object or is null, return (no circular references possible)
    if (typeof obj !== "object" || obj === null) {
      return;
    }

    // Check if the current object has already been visited (indicating a circular reference)
    if (seen.has(obj)) {
      throw new Error("Circular reference detected");
    }

    // Mark the current object as visited
    seen.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      for (const item of obj) {
        traverse(item);
      }
    }
    // Handle objects
    else {
      for (const value of Object.values(obj)) {
        // Check if the value is a string containing '[Circular]'
        if (typeof value === "string" && value.includes("[Circular]")) {
          throw new Error("Circular reference detected");
        }
        // Recursively traverse the value
        traverse(value);
      }
    }
  }

  try {
    // Start the traversal from the root data structure
    traverse(data);
  } catch (err) {
    // Throw the error if a circular reference or '[Circular]' string is found
    throw new Error("Circular reference detected");
  }
}
