/**
 * Defines the structure of the JSON object that is received from the JSON files in the commands directory.
 *
 * @field name - The name of the command
 * @field id - The id of the command
 * @field command - The command object
 *
 */
export default interface ICommandSchema {
  name: string;
  id: string;
  command: Command;
}

/**
 * Defines the structure of the command
 *
 * @field type - CRUD command
 *
 */
interface Command {
  type: string;
}

