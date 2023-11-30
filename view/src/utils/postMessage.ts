import { CommandDefinitions } from "../../../commands/src/commands";
import { vsCode } from "./vsState";

// With this wrapper, we will see typing errors if we try to send a malformed command
export function postMessage<K extends keyof CommandDefinitions>(message: { command: K } & CommandDefinitions[K] ) {
  // Send the message to the extension
  vsCode.postMessage(message);
}