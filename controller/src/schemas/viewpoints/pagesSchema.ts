import IPagesSchema from "../../interfaces/IPagesSchema";
import { JSONSchemaType } from "ajv";

/**
 * This JSON schema is used with AJV to validate pages.json data that is stored within OML models.
 *
 * @remarks
 * This constant will help validate JSON data using {@link https://ajv.js.org | AJV}.
 *
 * This schema has a recursive schema which you can read more {@link https://ajv.js.org/guide/combining-schemas.html | here}.
 *
 * This schema has nullable properties which you can read more {@link https://ajv.js.org/guide/typescript.html#utility-types-for-schemas | here}.
 *
 * The data within the constant was generated with {@link https://www.jsonschema.net | JSON Schema}.
 *
 */

export const pagesSchema: JSONSchemaType<IPagesSchema[]> = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "array",
  items: {
    type: "object",
    properties: {
      title: {
        type: "string",
      },
      type: {
        type: "string",
      },
      path: {
        type: "string",
        nullable: true,
      },
      iconUrl: {
        type: "string",
        nullable: true,
      },
      children: {
        type: "array",
        nullable: true,
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            type: {
              type: "string",
            },
            path: {
              type: "string",
            },
          },
          required: ["title", "type", "path"],
        },
      },
    },
    required: ["title", "type"],
  },
};
