import { CommandDefinitions } from "../../../commands/src/commands";
import { vsCode } from "./vsState";

/**
 * Sends a message to the VSCode extension.  With this wrapper, we will see typing errors if we try to send a malformed command
 *
 * @remarks
 * This function sends a message to the VSCode extension using the {@link vsCode.postMessage} method.
 *
 * @template K - The type of command key in the CommandDefinitions.
 *
 * @param message - The message object to be sent, including the command key and its associated payload.
 *
 * @returns void
 */
export function postMessage<K extends keyof CommandDefinitions>(
  message: { command: K } & CommandDefinitions[K]
) {
  // Send the message to the extension
  vsCode.postMessage(message);
}

/**
 * Sends a message to the parent window or page that instantiates the component.
 *
 * @remarks
 * This method uses the {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent | dispatchEvent} to send the message.
 * 
 * The data structure for the message is the {@link https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent | MessageEvent}.
 *
 * @template K - The type of command key in the CommandDefinitions.
 *
 * @param message - The message object to be sent, including the command key and its associated payload.
 *
 * @returns void
 */
export function postParentMessage<K extends keyof CommandDefinitions>(
  message: { command: K } & CommandDefinitions[K]
) {
  // Send the message to the extension
  const event = new MessageEvent("message", { data: message });
  window.dispatchEvent(event);
}
