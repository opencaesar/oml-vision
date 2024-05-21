/**
 * This SPARQL query gets all total relations (predicate/verb and object) for a given IRI which is a owl:NamedIndividual
 *
 * @remarks
 * For more information on OML relations please refer to the official documentation found {@link http://www.opencaesar.io/oml/#Relations | here}
 *
 * @param IRI of the element.  To learn more about IRIs go to this {@link https://www.oxfordsemantic.tech/faqs/what-is-an-iri-what-does-iri-mean | doc}
 *
 * @returns SPARQL select query string
 *
 */

export function getIriRelationsTotal(iri: string): string {
  return `SELECT ?verb ?object
    WHERE {
      BIND(<${iri}> as ?subject)
      ?subject ?verb ?object .
    }`;
}
