/**
 * This SPARQL query deletes all RDF triples which contains the given subject in a defined graph.
 *
 * @remarks
 * For more information on RDF triples please refer to the official documentation found {@link https://en.wikibooks.org/wiki/SPARQL/Triples | here}
 *
 * To learn more about IRIs go to this {@link https://www.oxfordsemantic.tech/faqs/what-is-an-iri-what-does-iri-mean | doc}
 *
 * @param IRI of the element.
 * @param graph where the iri is located.
 *
 * @returns SPARQL delete query string
 *
 */

export function deleteSubject(iri: string, graph: string): string {
  return `DELETE WHERE {
    GRAPH <${graph}> {
      <${iri}> ?verb ?object .
    }
  }`;
}
