import React, { createContext, useState, useEffect, useContext } from "react";
import { postMessage } from "../utils/postMessage";
import { CommandStructures, Commands } from "../../../commands/src/commands";

interface ICommandContext {
  commands: Record<string, Record<string, any>>;
}

const CommandContext = createContext<ICommandContext>({
  commands: {},
});

/**
 * The command provider is responsible for providing user defined commands that come from the OML Model.
 *
 * @remarks
 * This method uses the workspace class from the {@link https://code.visualstudio.com/api/references/vscode-api | VSCode API}.
 *
 * @param children - Children components
 *
 */
export const CommandProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // These are model commands
  const [commands, setCommands] = useState<ICommandContext>({ commands: {} });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { command, payload } = event.data;

      // This is a command that comes from OML Vision
      if (command === Commands.SEND_COMMANDS) {
        const commandContents =
          payload as CommandStructures[Commands.SEND_COMMANDS]["payload"];

        // Set the list of commands to the current command contents
        setCommands({
          commands: commandContents,
        });
      }
    };
    window.addEventListener("message", handler);

    // Ask for data every time the component is mounted or updated
    postMessage({
      command: Commands.ASK_FOR_COMMANDS,
    });

    return () => {
      window.removeEventListener("message", handler);
    };
  }, []);

  return (
    <CommandContext.Provider value={commands}>
      {children}
    </CommandContext.Provider>
  );
};

// Create a hook for easy usage of the context
export const useCommandData = () => useContext(CommandContext);
