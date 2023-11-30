import React, { createContext, useState, useEffect, useContext } from 'react';
import { LayoutPaths } from '../../../commands/src/interfaces/LayoutPaths';
export { LayoutPaths } from '../../../commands/src/interfaces/LayoutPaths';
import { postMessage } from '../utils/postMessage';
import { CommandStructures, Commands } from '../../../commands/src/commands';

interface ILayoutContext {
  layouts: Record<string, Record<string, any>>;
  prefixes: Record<string, string>;
  isLoadingLayoutContext: boolean; // Added loading state
}

const LayoutContext = createContext<ILayoutContext>({
  layouts: {},
  prefixes: {},
  isLoadingLayoutContext: true, // Default to loading state
});

// Create a provider for components to consume and subscribe to changes
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layouts, setLayouts] = useState<ILayoutContext>({ layouts: {}, prefixes: {}, isLoadingLayoutContext: true });

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { command, payload } = event.data;
    
      if (command === Commands.SEND_LAYOUTS) {
        const layoutContents = payload as CommandStructures[Commands.SEND_LAYOUTS]['payload'];
        let prefixes: Record<string, string> = {};
    
        // If LayoutPaths.Prefixes exists in layoutContents, move it to prefixes
        if (layoutContents.hasOwnProperty(LayoutPaths.Prefixes)) {
          prefixes = layoutContents[LayoutPaths.Prefixes] as Record<string, string>;
          delete layoutContents[LayoutPaths.Prefixes]; // Remove it from the layoutContents
        }
    
        setLayouts({ layouts: layoutContents, prefixes, isLoadingLayoutContext: false });
      }
    };
    window.addEventListener('message', handler);

    // Ask for data every time the component is mounted or updated
    postMessage({
      command: Commands.ASK_FOR_LAYOUTS
    });

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <LayoutContext.Provider value={layouts}>
      {children}
    </LayoutContext.Provider>
  );
}

// Create a hook for easy usage of the context
export const useLayoutData = () => useContext(LayoutContext);