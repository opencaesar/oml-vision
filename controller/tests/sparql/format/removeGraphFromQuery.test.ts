import { removeGraphFromQuery } from "../../../src/sparql/format/removeGraphFromQuery";

let ASSERTION_QUERY_1 = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX base:        <http://example.com/tutorial2/vocabulary/base#>
PREFIX mission:     <http://example.com/tutorial2/vocabulary/mission#>
PREFIX components:      <http://example.com/tutorial2/description/components#> 
PREFIX vim4:            <http://bipm.org/jcgm/vim4#>

INSERT DATA 
{
graph <http://example.com/tutorial2/description/components> 
{
        components:test a mission:Component ; 
                rdf:type owl:NamedIndividual;
                base:hasIdentifier "testID" ;
                base:hasCanonicalName "testName" ;
        base:contains components:orbiter-launch-system .
        }
}

`;

let ASSERTION_QUERY_2 = `
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX base: <http://example.com/tutorial2/vocabulary/base#>

delete {
    graph <http://example.com/tutorial2/description/components> 
    {
        ?anyIri a owl:NamedIndividual ;
            base:hasIdentifier ?beforeId ;
            base:hasCanonicalName ?beforeName .
    }
}

insert {
    graph <http://example.com/tutorial2/description/components> {
        ?anyIri a owl:NamedIndividual ;
            base:hasIdentifier ?beforeId ;
            base:hasCanonicalName ?beforeName .
    }
}

where {
  BIND(<http://example.com/tutorial2/description/components#characterize-rocky-core> AS ?anyIri)
  BIND("O.04" AS ?beforeId)
  BIND("Characterize the rocky core of Kepler 16b" AS ?beforeName)
  BIND("TESTID" AS ?afterId)
  BIND("TESTNAME" AS ?afterName)
}

`;

test("removeIncorrectClosingBrace removes graph statement for insert query", async () => {
  const test_query = removeGraphFromQuery(ASSERTION_QUERY_1);
  const graph_statement =
    "graph <http://example.com/tutorial2/description/components>";
  expect(test_query.includes(graph_statement)).toBeFalsy();
});

test("removeIncorrectClosingBrace removes graph statement for insert & delete query", async () => {
  const test_query = removeGraphFromQuery(ASSERTION_QUERY_2);
  const graph_statement =
    "graph <http://example.com/tutorial2/description/components>";
  expect(test_query.includes(graph_statement)).toBeFalsy();
});
