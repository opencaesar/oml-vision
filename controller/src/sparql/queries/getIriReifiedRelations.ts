/**
 * This SPARQL query gets all relations for a given IRI which is a owl:NamedIndividual
 *
 * @remarks
 * For more information on reified relations please refer to the official documentation found {@link https://en.wikipedia.org/wiki/Reification_(computer_science)#On_Semantic_Web | here}
 *
 * @param IRI of the element.  To learn more about IRIs go to this {@link https://www.oxfordsemantic.tech/faqs/what-is-an-iri-what-does-iri-mean | doc}
 *
 * @returns SPARQL select query string
 *
 */

export function getIriReifiedRelations(iri: string): string {
  return `PREFIX oml: <http://opencaesar.io/oml#>

  SELECT DISTINCT ?name
  WHERE {
    BIND(<${iri}> as ?object)
    {
      ?name oml:hasSource ?iri .
      ?name oml:hasTarget ?object .
    }
    UNION
    {
      ?name oml:hasTarget ?iri .
      ?name oml:hasSource ?object .
    }
  }`;
}
