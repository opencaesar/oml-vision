/**
 * This function updates triple(s) in the RDF triplestore.
 * @remarks For more information, go here: https://www.w3.org/TR/2013/REC-sparql11-update-20130321/#deleteInsert
 * @param subject - The subject of the RDF triple. Used to bind subject to a variable in the SPARQL query.
 * @param predicate - The predicate of the RDF triple. Used to bind predicate to a variable in the SPARQL query.
 * @param oldObject - The old object of the RDF triple that needs to be updated. Used to bind old object to a variable in the SPARQL query.
 * @param newObject - The new object of the RDF triple to be updated to. Used to bind new object to a variable in the SPARQL query.
 * @param graph - The graph where the SPARQL query will be executed.
 * @returns The formatted query with parameters
 */
export function updateQuery(
  subject?: string,
  predicate?: string,
  oldObject?: string,
  newObject?: string,
  graph?: string
): string {
  // Initialize empty query string
  let query = ``

  // Add WITH statement only if the parameter is provided
  if (graph) query += `   WITH ${graph} \n`

  // Add standard template of query
  query += `
    DELETE {
      ?subject ?predicate ?oldObject .
    }
    INSERT {
      ?subject ?predicate ?newObject .
    }
    WHERE {
  `;

  // Add BIND statements only if the parameters are provided
  if (subject) query += `    BIND(${subject} AS ?subject) .\n`;
  if (predicate) query += `    BIND(${predicate} AS ?predicate) .\n`;
  if (oldObject) query += `    BIND(${oldObject} AS ?oldObject) .\n`;
  if (newObject) query += `    BIND(${newObject} AS ?newObject) .\n`;

  // Continue building the rest of the query
  query += `
    } ;
  `;

  return query;
}
