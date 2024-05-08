import * as vscode from "vscode";
import { globalSparqlContents } from "../extension";
import { queryEngine } from "../database/queryEngine";

// SPARQL service types
import { SparqlServiceType } from "../types/SparqlServiceType";
import { addGraphToQuery } from "./format/addGraphToQuery";
import { addParametersToQuery } from "./format/addParametersToQuery";
import { removeGraphFromQuery } from "./format/removeGraphFromQuery";

/**
 * SparqlClient connects to the SPARQL query engine
 * @param query - The SPARQL query as a string.  Can be "query" or "update"
 * @param service - The SPARQL service as a string.  Either query or update service.
 * @param iri - The target IRI used to get a particular element
 * @param beforeParameters - The parameters object which represents the data before the update.
 * @param afterParemeters - The parameters object which represents the data after the update.
 * @returns A promise that resolves with the data as a JSON object, or null if an error occurred
 */
export async function SparqlClient(
  query: string,
  service: SparqlServiceType,
  iri?: string,
  beforeParameters?: Object,
  afterParameters?: Object
): Promise<Record<string, any>[]> {
  let QUERY = globalSparqlContents[query];

  if (Object.keys(globalSparqlContents).length === 0) {
    vscode.window.showErrorMessage(
      `No SPARQL queries found in src/vision/sparql directory.`
    );
    throw new Error(`No SPARQL queries found in current model.`);
  }

  if (!QUERY) {
    QUERY = query;
    // Uncomment to have VSCode notify users about SPARQL query not being defined in src/vision/sparql directory
    // More info here https://code.visualstudio.com/api/ux-guidelines/notifications
    // vscode.window.showWarningMessage(`SPARQL query not defined in src/vision/sparql directory: ${query}`);
    console.warn(
      `SPARQL query not defined in src/vision/sparql directory: ${query}`
    );
  }

  // FIXME: Move this code to a separate function to lower coupling
  if (iri) {
    QUERY = QUERY.replace(/\$\{iri\}/g, iri);
  }
  
  // FIXME: Move this code to a separate function to lower coupling
  if (beforeParameters && afterParameters) {
    QUERY = addParametersToQuery(
      QUERY,
      beforeParameters,
      afterParameters
    );
  }

  if (!QUERY && !query) {
    vscode.window.showErrorMessage(`Unknown SPARQL query: ${query}`);
    throw new Error(`Unknown SPARQL query: ${query}`);
  }

  if (service === "query") {
    console.log(`EXECUTE QUERY SERVICE: ${QUERY}`);
    return await queryEngine(QUERY);
  } else {
    console.log(`EXECUTE UPDATE (DEFAULT GRAPH) SERVICE: ${removeGraphFromQuery(QUERY)}`);
    console.log(
      `EXECUTE UPDATE (NAMED GRAPH) SERVICE: ${QUERY}`
    );
    return await queryEngine(QUERY);
  }
}
