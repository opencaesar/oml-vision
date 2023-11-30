import React, { useState, useContext, FunctionComponent, useEffect } from 'react';
import { postMessage } from '../utils/postMessage';
import { CommandStructures, Commands } from '../../../commands/src/commands';

export interface Wizards {
  addWizard(key: string, wizard: FunctionComponent<any>): void;
  openWizard(key: string, props?: { [key: string]: any }): void;
  closeWizard(key?: string): void;
}

const initialState: Wizards = {
  closeWizard: () => {
    throw new Error('Not implemented');
  },
  openWizard: () => {
    throw new Error('Not implemented');
  },
  addWizard: () => {
    throw new Error('Not implemented');
  },
};

export const WizardsContext = React.createContext(initialState);
export const useWizards = () => useContext(WizardsContext);

interface Props {
  children: JSX.Element | JSX.Element[];
  initialWizards?: { [key: string]: FunctionComponent<any> };
}

export const WizardsProvider: React.FC<Props> = ({ children, initialWizards = {} }: Props) => {
  const [wizards, setWizards] = useState<{ [key: string]: FunctionComponent<any> }>(initialWizards);
  const [wizard, setWizard] = useState<{
    key: string;
    Component: FunctionComponent<any>;
    props: { [key: string]: any };
  } | null>(null);

  const addWizard: Wizards['addWizard'] = (key, WizardComponent) => {
    setWizards((state) => ({ ...state, [key]: WizardComponent }));
  };

  const openWizard: Wizards['openWizard'] = (key, props = {}) => {
    const WizardComponent = wizards[key];
  
    if (!WizardComponent) {
      postMessage({
        command: Commands.ALERT,
        text: `Attempted to open a wizard that does not exist: ${key}`
      });
      return;
    }

    setWizard({
      key,
      Component: wizards[key],
      props,
    });
  };

  const closeWizard: Wizards['closeWizard'] = () => {
    setWizard(null);
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data; 
      
      if (message.command === Commands.OPEN_WIZARD) {
        const data = message.payload as CommandStructures[Commands.OPEN_WIZARD]['payload'];
        openWizard(data.key, data.props);
      }
    };
    window.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  return (
    <WizardsContext.Provider
      value={{
        addWizard,
        openWizard,
        closeWizard,
      }}
    >
      {wizard && (
        <wizard.Component {...wizard.props} open key={wizard.key} />
      )}
      {children}
    </WizardsContext.Provider>
  );
};