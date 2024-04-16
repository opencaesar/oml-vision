/* New Commands */

// CRUD commands
export type CommandType = 'create' | 'read' | 'update' | 'delete';

export type CommandObject = {
  name: string;
  command: CommandStructure;
}

export type CommandStructure = {
  type: CommandType;
  query: string;
}