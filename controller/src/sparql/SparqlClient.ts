import * as vscode from "vscode";
import { globalSparqlContents } from '../extension';
import { queryEngine } from '../database/queryEngine';

// SPARQL service types
import { SparqlServiceType } from '../types/SparqlServiceType';

/**
 * SparqlClient connects to the SPARQL query engine 
 * @param query - The SPARQL query as a string
 * @param service - The SPARQL service as a string.  Either query or update service.
 * @param iri - The target IRI used to get a particular element
 * @returns A promise that resolves with the data as a JSON object, or null if an error occurred
 */
export async function SparqlClient(query: string, service: SparqlServiceType, iri?: string): Promise<Record<string, any>[]> {
  let QUERY = globalSparqlContents[query];

  if (Object.keys(globalSparqlContents).length === 0) {
    vscode.window.showErrorMessage(`No SPARQL queries found in src/vision/sparql directory.`);
    throw new Error(`No SPARQL queries found in current model.`);
  }

  if (!QUERY && !query) {
    vscode.window.showErrorMessage(`Unknown SPARQL query: ${query}`);
    throw new Error(`Unknown SPARQL query: ${query}`);
  }
  
  if (!QUERY) {
    QUERY = query
    // Uncomment to have VSCode notify users about SPARQL query not being defined in src/vision/sparql directory
    // More info here https://code.visualstudio.com/api/ux-guidelines/notifications
    // vscode.window.showWarningMessage(`SPARQL query not defined in src/vision/sparql directory: ${query}`);
    console.warn(`SPARQL query not defined in src/vision/sparql directory: ${query}`)
  };

  if (iri) {
    QUERY = QUERY.replace(/\$\{iri\}/g, iri);
  }

  if (service === "query") {
    console.log(`EXECUTE QUERY SERVICE: ${QUERY}`)
    return await queryEngine(QUERY);
  } else {
    console.log(`EXECUTE UPDATE SERVICE: ${QUERY}`)
    return await queryEngine(QUERY)
  }
}