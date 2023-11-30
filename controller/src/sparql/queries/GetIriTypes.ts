export function getIriTypes(iri: string): string {
  return `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  
  SELECT ?type
  WHERE {
    BIND(<${iri}> AS ?conceptInstance)
    ?conceptInstance rdf:type ?type.
    FILTER(?type != rdfs:Resource)
  }`;
}