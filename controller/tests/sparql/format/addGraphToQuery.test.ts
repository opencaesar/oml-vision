import { addGraphToQuery } from "../../../src/sparql/format/addGraphToQuery";

let INFERENCE_QUERY_CASE_1 = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX base: <http://example.com/tutorial2/vocabulary/base#>
PREFIX mission: <http://example.com/tutorial2/vocabulary/mission#>
PREFIX components: <http://example.com/tutorial2/description/components#>
PREFIX vim4: <http://bipm.org/jcgm/vim4#>

INSERT DATA {
  components:test a mission:Component ;
  rdf:type owl:NamedIndividual;
  base:hasIdentifier "testID" ;
  base:hasCanonicalName "testName" ;
  base:contains components:orbiter-launch-system .
}
`;

let INFERENCE_QUERY_CASE_2 = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX base: <http://example.com/tutorial2/vocabulary/base#>
PREFIX mission: <http://example.com/tutorial2/vocabulary/mission#>
PREFIX components: <http://example.com/tutorial2/description/components#>
PREFIX vim4: <http://bipm.org/jcgm/vim4#>

INSERT DATA 
{
  components:test a mission:Component ;
  rdf:type owl:NamedIndividual;
  base:hasIdentifier "testID" ;
  base:hasCanonicalName "testName" ;
  base:contains components:orbiter-launch-system .
}
`;

test("addGraphQuery adds a corrected formatted graph for INSERT/DELETE DATA { case", async () => {
  const test_query = addGraphToQuery(INFERENCE_QUERY_CASE_1);
  const graph_statement = "graph <http://example.com/tutorial2/description/components>";
  expect(test_query.includes(graph_statement)).toBeTruthy();
});

test("addGraphQuery adds a corrected formatted graph for INSERT/DELETE DATA \\n { case", async () => {
  const test_query = addGraphToQuery(INFERENCE_QUERY_CASE_2);
  const graph_statement = "graph <http://example.com/tutorial2/description/components>";
  expect(test_query.includes(graph_statement)).toBeTruthy();
});