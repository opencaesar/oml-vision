import { queryEngine, pingQueryEngine } from "../../src/database/queryEngine";

const query = `
SELECT * 
WHERE {
    ?s ?p ?o 
}
LIMIT 1
`;

// Mock config file
jest.mock('../../src/utilities/loaders/loadSparqlConfigFiles.ts', () => {
  return {
    globalQueryEndpoint: `http://dbpedia.org`,
    globalPingEndpoint: `https://www.dbpedia.org/ping`
    // For local OML kepler16b-example model testing
    // globalQueryEndpoint: `http://localhost:3030/tutorial2/sparql`,
    // globalPingEndpoint: `http://localhost:3030/$/ping`
  }
});

test("pingQueryEngine returns a 200 SUCCEED", async () => {
  expect(await pingQueryEngine()).toBe(200);
});

test("queryEngine doesn't return undefined", async () => {
  expect(await queryEngine(query)).not.toBeUndefined();
});

test("queryEngine returns an array greater than 1", async () => {
  const queryResponse = await queryEngine(query);
  console.log(queryResponse);
  const queryLength = Object.keys(queryResponse);
  expect(queryLength).not.toHaveLength(0);
});