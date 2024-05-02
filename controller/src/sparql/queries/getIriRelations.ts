/**
 * This SPARQL query gets all relations for a given IRI which is a owl:NamedIndividual 
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 * 
 * For more information on SPARQL query `regex` and `str` please refer to the official documentation found {@link https://www.w3.org/TR/sparql11-query/ | here}
 *
 * @param IRI of the element.  To learn more about IRIs go to this {@link https://www.oxfordsemantic.tech/faqs/what-is-an-iri-what-does-iri-mean | doc}
 * 
 * @returns SPARQL select query string
 *
 */

export function getIriRelations(iri: string): string {
  return `SELECT ?subject
  WHERE {
    BIND(<${iri}> as ?object)
    ?subject ?verb ?object .
    FILTER regex(str(?subject), "description", "i")
  }`;
}
