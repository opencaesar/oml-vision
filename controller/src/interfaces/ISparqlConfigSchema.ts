/**
 * Defines the structure of the JSON object that is received from the sparqlConfig.json file.
 *
 * @remarks
 * This interface relates to {@link https://jena.apache.org/documentation/fuseki2/fuseki-server-info.html | Fuseki endpoints}.
 *
 * @field queryEndpoint - The query endpoint
 * @field updateAssertionEndpoint - The update endpoint for assertions
 * @field updateInferenceEndpoint - The update endpoint for inferences
 * @field pingEndpoint - The ping endpoint
 *
 */
export default interface ISparqlConfigSchema {
  queryEndpoint: string;
  updateAssertionEndpoint: string;
  updateInferenceEndpoint: string;
  pingEndpoint: string;
}
