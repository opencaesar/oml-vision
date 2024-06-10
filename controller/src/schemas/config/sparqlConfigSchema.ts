import ISparqlConfigSchema from '../../interfaces/ISparqlConfigSchema';
import { JSONSchemaType } from "ajv";

/**
 * This JSON schema is used with AJV to validate sparqlConfig.json data that is stored within OML models.
 *
 * @remarks
 * This constant will help validate JSON data using {@link https://ajv.js.org | AJV}.
 *
 * The data within the constant was generated with {@link https://www.jsonschema.net | JSON Schema}.
 *
 */

export const sparqlConfigSchema: JSONSchemaType<ISparqlConfigSchema> = {
  type: 'object',
  properties: {
    queryEndpoint: {
      type: 'string',
      title: 'Query Endpoint',
      default: 'http://example.com/sparql',
      examples: ['http://example.com/sparql']
    },
    updateAssertionEndpoint: {
      type: 'string',
      title: 'Update Assertion Endpoint',
      default: 'http://example.com/update/assertion'
    },
    updateInferenceEndpoint: {
      type: 'string',
      title: 'Update Inference Endpoint',
      default: 'http://example.com/update/inference'
    },
    pingEndpoint: {
      type: 'string',
      title: 'Ping Endpoint',
      default: 'http://example.com/ping'
    }
  },
  required: ['queryEndpoint', 'updateAssertionEndpoint', 'updateInferenceEndpoint', 'pingEndpoint']
};
