import * as vscode from "vscode";
import { TablePanel } from "../../panels/TablePanel";
import { Commands } from "../../../../commands/src/commands";
import { getIriRelations } from "../queries/getIriRelations";
import { SparqlClient } from "../SparqlClient";
import { v4 as uuid } from "uuid";
import { uniqBy } from "lodash";

/**
 * This SPARQL query gets all relations for a given IRI which is a owl:NamedIndividual
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * For more information on SPARQL query `regex` and `str` please refer to the official documentation found {@link https://www.w3.org/TR/sparql11-query/ | here}
 *
 * @returns SPARQL query
 *
 */

export const getElementRelations = async (
  webviewPath: string,
  wizardId: string,
  iriArray: string[],
  labelArray?: string[]
) => {
  try {
    let results: Record<string, any>[] = [];
    let relations: Record<string, any>[] = [];
    let data = {};
    await Promise.all(
      iriArray.map(async (iri: string) => {
        const relations_query = getIriRelations(iri);
        const relations_data = await SparqlClient(relations_query, "query");

        // Iterate over relations
        relations_data.map((relation: Record<string, any>) => {
          // We only want values because the record will look like subject: relation_value
          // We're only grabbing the first value since we're mapping/iterating over each record
          let string_relation: string = Object.values(relation)[0];

          // The relations data that will go into the children array
          // ID and name are required.  Refer to https://github.com/brimdata/react-arborist?tab=readme-ov-file#node-api-reference
          let children_relations_data = {
            id: uuid(),
            name: string_relation,
          };

          // Add relation to relations
          relations.push(children_relations_data);
        });

        // Filter unique relations by IRI name
        // https://lodash.com/docs#uniqBy
        let unique_relations = uniqBy(relations, "name");

        // Use object to store instance and its relations data.  Relations are children.
        // ID and name are required.  Refer to https://github.com/brimdata/react-arborist?tab=readme-ov-file#node-api-reference
        data = {
          name: iri,
          id: uuid(),
          children: unique_relations,
        };

        // Add the new data to the results record
        results.push(data);
      })
    );

    // Filter unique results by IRI name
    // https://lodash.com/docs#uniqBy
    let unique_results = uniqBy(results, "name");

    checkForCircularReferences(unique_results);

    // Send data to current webview
    TablePanel.currentPanels.get(webviewPath)?.sendMessage({
      command: Commands.LOADED_ELEMENT_RELATIONS,
      payload: {
        IRIsToDelete: unique_results,
      },
      wizardId: wizardId,
    });
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ELEMENT_RELATIONS,
        payload: {},
        errorMessage: `Error: ${error.message}`,
        wizardId,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_ELEMENT_RELATIONS,
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
