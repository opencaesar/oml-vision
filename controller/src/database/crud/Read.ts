/**
 * This function reads triple(s) in the RDF triplestore.
 * @remarks For more information, go here: https://www.w3.org/TR/2013/REC-sparql11-query-20130321/#select
 * @param subject - The subject of the RDF triple. Used to bind subject to a variable in the SPARQL query.
 * @param predicate - The predicate of the RDF triple. Used to bind predicate to a variable in the SPARQL query.
 * @param object - The object of the RDF triple. Used to bind object to a variable in the SPARQL query.
 * @param graph - The graph where the SPARQL query will be executed.
 * @returns The formatted query with parameters
 */
export function readQuery(
  subject?: string,
  predicate?: string,
  object?: string,
  graph?: string
): string {
  let query = `
    SELECT ?subject ?predicate ?object ?graph
    WHERE {
      { 
        GRAPH ?graph {
  `;

  // Add BIND statements only if the parameters are provided
  if (subject) query += `BIND (${subject} AS ?subject)\n`;
  if (predicate) query += `BIND (${predicate} AS ?predicate)\n`;
  if (object) query += `BIND (${object} AS ?object)\n`;
  if (graph) query += `BIND (${graph} AS ?graph)\n`;

  // Continue building the rest of the query
  query += `
          ?subject ?predicate ?object 
        }
      }
    }
  `;

  return query;
}
