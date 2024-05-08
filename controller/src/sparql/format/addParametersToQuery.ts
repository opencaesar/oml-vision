/**
 * Format the parameters which will be updated by the update query
 *
 * @param beforeParameters - The parameters object which represents the data before the update.
 * @returns A sorted object
 */
const sortBeforeParameters = (beforeParameters: Object): Object => {
  // Create a shallow copy of the input object
  let sortedParameters: any = { ...beforeParameters };

  // Remove any values that start with "http://" since iri are handled by controller/src/sparql/SparqlClient.ts
  for (const key in sortedParameters) {
    if (sortedParameters[key].startsWith("http://")) {
      delete sortedParameters[key];
    } else {
      // Add 'before' at the start of the key and capitalize the first letter of the key
      sortedParameters["before" + key.charAt(0).toUpperCase() + key.slice(1)] =
        sortedParameters[key];
      delete sortedParameters[key];
    }
  }

  return sortedParameters;
};
/**
 * Format the parameters which have been updated by the update query
*
* @param afterParemeters - The parameters object which represents the data after the update.
* @returns A sorted object
*/
const sortAfterParameters = (afterParameters: Object): Object => {
    // Create a shallow copy of the input object
    let sortedParameters: any = { ...afterParameters };
    
    // Remove any values that start with "http://" since iri are handled by controller/src/sparql/SparqlClient.ts
    for (const key in sortedParameters) {
        if (sortedParameters[key].startsWith("http://")) {
            delete sortedParameters[key];
        } else {
            // Add 'after' at the start of the key and capitalize the first letter of the key
            sortedParameters["after" + key.charAt(0).toUpperCase() + key.slice(1)] =
            sortedParameters[key];
            delete sortedParameters[key];
        }
    }
    
    return sortedParameters;
};

/**
 * Adds parameters to the original SPARQL query.
 *
 * @param query - The SPARQL query string containing the INSERT/DELETE statement.
 * @param beforeParameters - The parameters object which represents the data before the update.
 * @param afterParemeters - The parameters object which represents the data after the update.
 * @returns The formatted SPARQL query that contains the new parameters.
 */
export const addParametersToQuery = (query: string, beforeParameters: Object, afterParameters: Object): string => {
  // The formatted and sorted before parameters
  const before = sortBeforeParameters(beforeParameters);
  
  // The formatted and sorted after parameters
  const after = sortAfterParameters(afterParameters);
  
  // The formatted and sorted before & after parameters
  const sortedParameters: Object = {...before, ...after};

  // Replace all variables in query with values in the before and sorted parameters
  Object.entries(sortedParameters).forEach(([key, value]) => {
    query = query.replace(`\${${key}}`, (value as string));
  })
  
  return query
};