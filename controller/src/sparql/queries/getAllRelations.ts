/**
 * This SPARQL query gets all relations from a given OML model
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * For more information on SPARQL query `regex` and `str` please refer to the official documentation found {@link https://www.w3.org/TR/sparql11-query/ | here}
 *
 * @returns SPARQL select query string
 *
 */

export function getAllRelations(): string {
  return `SELECT DISTINCT ?verb
    WHERE {
      ?subject ?verb ?object .
      FILTER regex(str(?subject), "description", "i")
      FILTER regex(str(?verb), "vocabulary", "i")
    }
    ORDER BY ?verb`;
}
