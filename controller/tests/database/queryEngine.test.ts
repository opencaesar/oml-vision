import { queryEngine } from "../../src/database/queryEngine";

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
    globalQueryEndpoint: `http://dbpedia.org`
  }
});

test("queryEngine doesn't return undefined", async () => {
  expect(await queryEngine(query)).not.toBeUndefined();
});