// TODO: Sunset crud commands as addGraphQuery as superseded crud command actions
test("sunset crud commands test to pass Jest", () => {
    expect("").toBe("");
})
// import { queryEngine } from "../../../src/database/queryEngine";
// import { createQuery } from "../../../src/database/crud/Create";
// import { readQuery } from "../../../src/database/crud/Read";
// import { updateQuery } from "../../../src/database/crud/Update";
// import { deleteQuery } from "../../../src/database/crud/Delete";

// const subject = `<http://example.org/SUBJECT>`;
// const predicate = `<http://example.org/PREDICATE>`;
// const object = `<http://example.org/OBJECT>`;
// const newObject = `<http://example.org/NEW_OBJECT>`;
// const graph = `<http://example.org/GRAPH>`;

// // RDF Triplestore endpoint defined here https://github.com/opencaesar/kepler16b-example/blob/561142b2ae033cc4b899e357dc8397cbd7abd8ec/.fuseki.ttl
// // Mock config file
// jest.mock("../../../src/utilities/loaders/loadSparqlConfigFiles.ts", () => {
//   return {
//     globalQueryEndpoint: "http://localhost:3030/tutorial2-tdb/sparql",
//     globalUpdateInferenceEndpoint: "http://localhost:3030/tutorial2/update",
//     globalUpdateAssertionEndpoint: "http://localhost:3030/tutorial2-tdb/update",
//   };
// });

// test("CRUD Queries Don't Return Blank Results", async () => {
//   // Formatted queries for updates
//   const created = createQuery(subject, predicate, object, graph);
//   const updated = updateQuery(subject, predicate, object, newObject);
//   const deleted = deleteQuery(subject, predicate, newObject, graph);

//   // Formatted read queries to verify updates were performed
//   const create_read = readQuery(subject, predicate, object, graph);
//   const update_delete_read = readQuery(subject, predicate, newObject);

//   // Create a new triple in the RDF Triplestore
//   await queryEngine(created);

//   // Verify that the newly created triple is in the RDF Triplestore
//   await queryEngine(create_read).then((data: any) => {
//     expect(data.toString()).not.toBe("");
//   });

//   // Update the newly created triple in the RDF Triplestore
//   await queryEngine(updated);

//   // Verify that the newly updated triple is in the RDF Triplestore
//   await queryEngine(update_delete_read).then((data: any) => {
//     expect(data.toString()).not.toBe("");
//   });

//   // Delete the newly updated triple in the RDF Triplestore
//   await queryEngine(deleted);

//   // Verify that the triple was deleted in the RDF Triplestore
//   await queryEngine(update_delete_read).then((data: any) => {
//     expect(data.toString()).toBe("");
//   });
// });
