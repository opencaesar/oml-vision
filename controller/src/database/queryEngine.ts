import { QueryEngine } from "@comunica/query-sparql";
import {
  globalQueryEndpoint,
  globalPingEndpoint,
  globalUpdateAssertionEndpoint,
  globalUpdateInferenceEndpoint,
} from "../utilities/loaders/loadSparqlConfigFiles";
import ITriplestoreStatus from "../interfaces/ITriplestoreStatus";
import { addGraphToQuery } from "../sparql/format/addGraphToQuery";
import { removeGraphFromQuery } from "../sparql/format/removeGraphFromQuery";

/**  
    This async function creates a new query engine.  
    This allows OML Vision to talk with the RDF triplestore.
    @remarks For more information, go here: https://comunica.dev/docs/query/getting_started/query_app/
    @param query - The query for the query engine to execute.  Can be CREATE, SELECT/READ, UPDATE, or DELETE query
    @returns The results from the QUERY operation in a Promise object or a void object representing the UPDATE operation
 */
export const queryEngine = async (query: string): Promise<any> => {
  const qe = new QueryEngine();

  if (
    query.includes("SELECT") ||
    query.includes("select") ||
    query.includes("Select")
  ) {
    // Stream results from SELECT query
    // globalQueryEndpoint is fetched from sparqlConfig.json file in OML Model
    // Refer to controller/src/utilities/loaders/loadSparqlConfigFiles.ts
    const bindingsStream = await qe.queryBindings(query, {
      sources: [globalQueryEndpoint],
      // timeout in ms
      httpTimeout: 6000,
    });

    // Async results from query
    return await new Promise((resolve, reject) => {
      const results: Record<string, any>[] = [];
      bindingsStream.on("data", (bindings: any) => {
        // Append bindings in JSON format to results array
        results.push(JSON.parse(bindings));
      });
      bindingsStream.on("end", () => resolve(results));
      bindingsStream.on("error", (error: any) => reject(error));
    });
  } else {
    // UPDATE, DELETE, or CREATE query is executed to named (assertions) and default (inferences) graphs
    // globalUpdateAssertionEndpoint & globalUpdateInferenceEndpoint are fetched from sparqlConfig.json file in OML Model
    // Refer to controller/src/utilities/loaders/loadSparqlConfigFiles.ts
    const inferenceQuery = removeGraphFromQuery(query);
    await qe.queryVoid(inferenceQuery, {
      sources: [globalUpdateInferenceEndpoint],
      // timeout in ms
      httpTimeout: 6000,
    });

    const assertionQuery = query;
    await qe.queryVoid(assertionQuery, {
      sources: [globalUpdateAssertionEndpoint],
      // timeout in ms
      httpTimeout: 6000,
    });
  }
};

/**  
    This async function pings a query engine.  
    This allows OML Vision to talk with the RDF triplestore.
    @remarks For more information, go here: https://comunica.dev/docs/query/getting_started/query_app/
    @returns The HTTP status code as a number from the ping operation in a Promise object
 */
export const pingQueryEngine = async (): Promise<number> => {
  let endpoint = globalPingEndpoint;

  try {
    // Use async/await to wait for the fetch operation to complete
    const response = await fetch(endpoint, {
      method: "POST",
    });
    // Return the response status code
    return response.status;
  } catch (err) {
    console.error(`Error: ${err}`);
    return 404;
  }
};

// /**
//     This async function gets the status of a query engine.
//     This allows OML Vision to talk with the RDF triplestore.
//     @remarks For more information, go here: https://comunica.dev/docs/query/getting_started/query_app/
//     @returns The HTTP status code as a number from the ping operation in a Promise object
//     @todo TODO: Use this function for getting status of triplestore. Must add globalStatusEndpoint as well
//  */
//     export const getQueryEngineStatus = async (): Promise<{} | ITriplestoreStatus> => {
//       let endpoint = globalStatusEndpoint;

//       try {
//         // Use async/await to wait for the fetch operation to complete
//         const response = await fetch(endpoint, {
//           method: "GET",
//         });
//         // Return the response status code
//         return response.json();
//       } catch (err) {
//         console.error(`Error: ${err}`);
//         return {};
//       }
//     };
