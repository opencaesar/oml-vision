/**
 * This function deletes triple(s) in the RDF triplestore.
 * @remarks For more information, go here: https://www.w3.org/TR/2013/REC-sparql11-update-20130321/#deleteData
 * @param subject - The subject of the RDF triple. Used to bind subject to a variable in the SPARQL query.
 * @param predicate - The predicate of the RDF triple. Used to bind predicate to a variable in the SPARQL query.
 * @param object - The object of the RDF triple. Used to bind object to a variable in the SPARQL query
 * @param graph - The graph where the SPARQL query will be executed.
 * @returns The formatted query with parameters
 */
export function deleteQuery(
    subject?: string,
    predicate?: string,
    object?: string,
    graph?: string
  ): string {

    // Initialize empty query string
    let query = ``

    // Add WITH statement only if the parameter is provided
    if (graph) query += `   WITH ${graph} \n`

    // Add standard template of query
    query += `
      DELETE {
        ?subject ?predicate ?object .
      }
      WHERE {
    `;
  
    // Add BIND statements only if the parameters are provided
    if (subject) query += `    BIND(${subject} AS ?subject) .\n`;
    if (predicate) query += `    BIND(${predicate} AS ?predicate) .\n`;
    if (object) query += `    BIND(${object} AS ?object) .\n`;
  
    // Continue building the rest of the query
    query += `
      } ;
    `;
  
    return query;
  }
  