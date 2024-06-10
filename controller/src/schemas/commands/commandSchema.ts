import ICommandSchema from "../../interfaces/ICommandSchema";
import { JSONSchemaType } from "ajv";

/**
 * This JSON schema is used with AJV to validate JSON files stored in the commands directory that is stored within OML models.
 *
 * @remarks
 * This constant will help validate JSON data using {@link https://ajv.js.org | AJV}.
 *
 * The data within the constant was generated with {@link https://www.jsonschema.net | JSON Schema}.
 *
 */

export const commandSchema: JSONSchemaType<ICommandSchema[]> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      id: {
        type: "string",
      },
      command: {
        type: "object",
        properties: {
          type: {
            type: "string",
          },
        },
        required: ["type"],
      },
    },
    required: ["name", "id", "command"],
  },
};
