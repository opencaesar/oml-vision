import ITableData from "../../view/src/interfaces/ITableData";
import { IPropertyData } from "./interfaces/IPropertyData";
import IWebviewType from "./interfaces/IWebviewType";

export enum Commands {
  ALERT = 'alert',
  INFORM = 'inform',

  // Table Panel Commands
  CREATE_TABLE = 'createTable',
  ROW_CLICKED = 'rowClicked',
  HIDE_PROPERTIES = 'hideProperties',
  ASK_FOR_LAYOUTS = 'askForLayouts',
  GENERATE_TABLE_DATA = 'generateTableData',
  UPDATE_CM_STATE = 'updateCmState',
  REFRESH_TABLE_DATA = 'refreshTableData',
  GET_ELEMENT_DEPENDENCIES = 'getElementDependencies',
  EXECUTE_CREATE_ELEMENTS = 'executeCreateElements',
  EXECUTE_DELETE_ELEMENTS = 'executeDeleteElements',
  CREATE_FCR = 'createFCR',

  // Property Panel Commands
  ASK_FOR_PROPERTIES = 'askForProperties',
  RECEIVED_PROPERTIES = 'receivedProperties',
  PROPERTIES_FORM_DATA = 'propertiesFormData',
  GENERATE_PROPERTY_SHEET = 'generatePropertySheet',

  // Setup Tasks Provider Commands
  GET_GRADLE_TASKS = 'getGradleTasks',
  RUN_GRADLE_TASK = 'runGradleTask',
  RECEIVED_GRADLE_TASKS = 'receivedGradleTasks',

  // Extension To Table Panel Commands
  UPDATE_LOCAL_VALUE = 'updateLocalValue',
  SEND_LAYOUTS = 'sendLayouts',
  OPEN_WIZARD = 'openWizard',
  CREATE_FILTERED_DIAGRAM = 'createFilteredDiagram',
  LOADED_PROPERTY_SHEET = 'loadedPropertySheet',
  LOADED_TABLE_DATA = 'loadedTableData',
  LOADED_ELEMENT_DEPENDENCIES = 'loadedElementDependencies',
  DELETED_ELEMENTS = 'deletedElements',
  CREATED_ELEMENT = 'createdElement',
  CLONED_ELEMENTS = 'clonedElements',
  SHOW_PROPERTIES = 'showProperties',
}

export type CommandStructures = {
  [Commands.CREATE_TABLE]: {
    payload: IWebviewType;
  };
  [Commands.ALERT]: {
    text: string;
  };
  [Commands.INFORM]: {
    text: string;
  };
  [Commands.ROW_CLICKED]: {
    payload: string;
  };
  [Commands.HIDE_PROPERTIES]: {};
  [Commands.ASK_FOR_LAYOUTS]: {};
  [Commands.GENERATE_TABLE_DATA]: {
    payload: { webviewPath: string; queries: Record<string, string>; };
    wizardId?: string;
  };
  [Commands.UPDATE_CM_STATE]: {
    payload: { aIri: string; fse_lifecycleState: string; }[];
  };
  [Commands.REFRESH_TABLE_DATA]: {};
  [Commands.GET_ELEMENT_DEPENDENCIES]: {
    payload: { webviewPath: string; iriArray: string[]; labelArray: string[]; };
    wizardId?: string;
  };
  [Commands.EXECUTE_DELETE_ELEMENTS]: {
    payload: { webviewPath: string; IRIsToDelete: string[]; };
    wizardId?: string;
  };
  [Commands.CREATE_FCR]: {
    payload: { webviewPath: string; assemblies: string[]; properties: Record<string, any>; };
    wizardId: string;
  };
  [Commands.EXECUTE_CREATE_ELEMENTS]: {
    payload: { properties: Record<string, string[]>; graph: string; };
  };
  [Commands.ASK_FOR_PROPERTIES]: {};
  [Commands.RECEIVED_PROPERTIES]: {};
  [Commands.PROPERTIES_FORM_DATA]: {
    payload: { [key: string]: any }
  };
  [Commands.GENERATE_PROPERTY_SHEET]: {
    payload: {
      queryName: string;
      iri: string;
    };
  };
  [Commands.GET_GRADLE_TASKS]: {};
  [Commands.RUN_GRADLE_TASK]: {
    payload: string;
  };
  [Commands.RECEIVED_GRADLE_TASKS]: {
    payload: string[];
  };
  [Commands.UPDATE_LOCAL_VALUE]: {};
  [Commands.SEND_LAYOUTS]: {
    payload: { [filename: string]: Record<string, string> | any[] }
  };
  [Commands.OPEN_WIZARD]: {
    payload: {
      key: string;
      props: { [key: string]: any }
    }
  };
  [Commands.CREATE_FILTERED_DIAGRAM]: {
    payload: {
      rowType: string;
      iriArray: string[];
      rowTypesObject: { [key: string]: any };
    }
  };
  [Commands.LOADED_PROPERTY_SHEET]: {
    errorMessage?: string;
    payload?: Record<string, any>[]
  };
  [Commands.LOADED_TABLE_DATA]: {
    errorMessage?: string;
    payload?: Record<string, ITableData[]>
  };
  [Commands.LOADED_ELEMENT_DEPENDENCIES]: {
    errorMessage?: string;
    wizardId: string;
    payload: {
      relationIRIs?: Record<string, any>[];
      IRIsToDelete?: string[];
    }
  };
  [Commands.DELETED_ELEMENTS]: {
    errorMessage?: string;
    wizardId: string;
    payload: {
      success: boolean;
    }
  };
  [Commands.CREATED_ELEMENT]: {
    errorMessage?: string;
    wizardId: string;
    payload: {
      success: boolean;
    }
  };
  [Commands.CLONED_ELEMENTS]: {
    errorMessage?: string;
    payload: {
      success: boolean;
    }
  };
  [Commands.SHOW_PROPERTIES]: {
    payload: IPropertyData;
  };
};

// This type maps each command to its corresponding payload structure.
export type CommandDefinitions = {
  [K in Commands]: CommandStructures[K];
};

export enum ExtensionToTablePanelCommands {
  UPDATE_TABLE_DATA = 'updateTableData',
  SET_CONFIG = 'setConfig',
}

export interface ExtensionToTablePanelCommandPayloads {
  updateTableData?: any; 
  setConfig?: { config: any };
  // ... other payloads
}



export enum WebviewToExtensionCommands {
  CREATE_TABLE = 'createTable',
  ALERT = 'alert',
  GENERATE_TABLE_DATA = 'generateTableData',
  // ... other commands sent from webview to extension
}

export interface WebviewToExtensionCommandPayloads {
  createTable?: any;
  alert?: { text: string };
  generateTableData?: { webviewPath: string; queries: any[] };
  // ... other payloads
}