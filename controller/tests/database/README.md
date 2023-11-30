# Database (Graph RDF Triplestore) Tests

The database or graph RDF triplestore tests allow [Jest](https://jestjs.io/) to test the functionality of the CRUD (Create, Read, Update, and Delete) operations from OML Vision to the RDF triplestore.

These tests are curated and will grow as needed to accommodate new unit or regressions tests that are needed. 

**For RDF triplestores, the RDF triplestore must be running and the endpoints must be exposed**

Look at the configuration file such as the `.fuseki.ttl` to determine the endpoints.  An example of a `.fuseki.ttl` configuration file can be found [here](https://github.com/opencaesar/kepler16b-example/blob/561142b2ae033cc4b899e357dc8397cbd7abd8ec/.fuseki.ttl).

# Usage

**Run these commands from the root of the OML Vision repo**
1. `npm ci` 
2. `npm run test`

Jest is currently configured to run all tests in the repo and provide a code coverage report for programs that are defined with the following file name format:
`*.test.ts`

Example Name:
`example.test.ts`

Jest can be run locally from the command line or from a CI/CD service such as [Github Actions](https://stackoverflow.com/questions/74415067/how-to-use-github-actions-to-run-jest-unit-tests)
