import React, { createContext, useState, useEffect, useContext } from 'react';
import IPropertiesData from '../interfaces/IPropertiesData';
import ITableType from '../../../commands/src/interfaces/ITableType';
import { postMessage } from '../utils/postMessage';
import { Commands } from '../../../commands/src/commands';

interface IPropertiesContext {
  tableType: ITableType;
  rowIri: string;
  tableRowTypes: string[];
  isAvailable: boolean;
}

// Create the context
const PropertiesDataContext = createContext<IPropertiesContext>({
  tableType: {
    title: "",
    path: "",
  },
  rowIri: "",
  tableRowTypes: [],
  isAvailable: false,
});

// Create a provider for components to consume and subscribe to changes
export const PropertiesDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [propertiesData, setPropertiesData] = useState<IPropertiesData | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data; 
      
      if (message.command === Commands.SHOW_PROPERTIES) {
        const data = message.payload;
        setPropertiesData(data);

        // Let the extension know that the properties were received
        postMessage({
          command: Commands.RECEIVED_PROPERTIES
        });
      }
      if (message.command === Commands.HIDE_PROPERTIES) {
        setPropertiesData(null);
      }
    };
    window.addEventListener('message', handler);

    // Ask for data every time the component is mounted or updated
    postMessage({
      command: Commands.ASK_FOR_PROPERTIES
    });

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  const contextValue = propertiesData
    ? { ...propertiesData, isAvailable: true }
    : { tableType: { title: "", path: "" }, rowIri: "", tableRowTypes: [], isAvailable: false };

  return (
    <PropertiesDataContext.Provider value={contextValue}>
      {children}
    </PropertiesDataContext.Provider>
  );
}

// Create a hook for easy usage of the context
export const usePropertiesData = () => useContext(PropertiesDataContext);