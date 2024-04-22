import { addParametersToQuery } from "../../../src/sparql/format/addParametersToQuery";

describe('addParametersToQuery', () => {
  it('should replace the variables in the query with the provided parameters', () => {
    const iri = 'http://example.com/tutorial2/vocabulary/base#some-iri';

    const beforeParameters = {
      iri,
      beforeId: '"O.04"',
      beforeName: '"Characterize the rocky core of Kepler 16b"',
    };

    const afterParameters = {
      afterId: '"O.04"',
      afterName: '"Characterize the rocky core of Kepler 16b"',
    };

    const query = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX base: <http://example.com/tutorial2/vocabulary/base#>

      delete {
        ?anyIri a owl:NamedIndividual ;
               base:hasIdentifier ${beforeParameters.beforeId} ;
               base:hasCanonicalName ${beforeParameters.beforeName} .
      }

      insert {
        ?anyIri a owl:NamedIndividual ;
               base:hasIdentifier ${afterParameters.afterId} ;
               base:hasCanonicalName ${afterParameters.afterName} .
      }

      where {
        BIND(<${iri}> AS ?anyIri)
        BIND(${beforeParameters.beforeId} AS ?beforeId)
        BIND(${beforeParameters.beforeName} AS ?beforeName)
        BIND(${afterParameters.afterId} AS ?afterId)
        BIND(${afterParameters.afterName} AS ?afterName)
      }
    `;

    const expectedQuery = `
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX base: <http://example.com/tutorial2/vocabulary/base#>

      delete {
        ?anyIri a owl:NamedIndividual ;
               base:hasIdentifier "O.04" ;
               base:hasCanonicalName "Characterize the rocky core of Kepler 16b" .
      }

      insert {
        ?anyIri a owl:NamedIndividual ;
               base:hasIdentifier "O.04" ;
               base:hasCanonicalName "Characterize the rocky core of Kepler 16b" .
      }

      where {
        BIND(<http://example.com/tutorial2/vocabulary/base#some-iri> AS ?anyIri)
        BIND("O.04" AS ?beforeId)
        BIND("Characterize the rocky core of Kepler 16b" AS ?beforeName)
        BIND("O.04" AS ?afterId)
        BIND("Characterize the rocky core of Kepler 16b" AS ?afterName)
      }
    `;

    const result = addParametersToQuery(query, beforeParameters, afterParameters);
    expect(result.trim()).toEqual(expectedQuery.trim());
  });
});