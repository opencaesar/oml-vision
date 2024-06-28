/**
 * This SPARQL query gets all distinct instances from a given OML model
 *
 * @remarks
 * For more information on OML instances please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Instances-LR | here}
 *
 * For more information on SPARQL query `regex` and `str` please refer to the official documentation found {@link https://www.w3.org/TR/sparql11-query/ | here}
 *
 * @returns SPARQL select query string
 *
 */

export function getAllInstances(): string {
  return `SELECT DISTINCT ?subject
    WHERE {
      ?subject ?verb ?object .
      FILTER regex(str(?subject), "vocabulary", "i")
      FILTER regex(str(?object), "Concept", "i")
    }
    ORDER BY ?subject`;
}
