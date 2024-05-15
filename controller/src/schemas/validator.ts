import Ajv, { JSONSchemaType } from "ajv";
import ISparqlConfigSchema from "../interfaces/ISparqlConfigSchema";

/**
 * This schema validator uses AJV to validate JSON data based on a schema interface.
 *
 * @remarks
 * This function will help validate JSON data using {@link https://ajv.js.org | AJV}.
 *
 * To learn more about Typescript interfaces refer to the official {@link https://www.typescriptlang.org/docs/handbook/2/objects.html | docs}.
 *
 * @param schema: The JSON schema that will be used to validate the data
 * @param data: The JSON data that will be validated against a schema
 * 
 */
export const validateSchema = (schema: JSONSchemaType<ISparqlConfigSchema>, data: Object) => {
  const ajv = new Ajv();

  // Validates the provided schema
  const validate = ajv.compile(schema);

  // Log errors
  if (!validate(data)) {
    console.error(validate.errors);
  }

  // Return true if schema is valid and false if invalid
  return validate(data);
};
