import * as vscode from "vscode";
import { SparqlClient } from "../SparqlClient";
import ITableData from "../../../../view/src/interfaces/ITableData";
import { Commands } from "../../../../commands/src/commands";
import { TablePanel } from "../../panels/TablePanel";
import { PropertyPanelProvider } from "../../panels/PropertyPanelProvider";

const UUID_REGEX = new RegExp(
  "^[0-9a-f]{8}\\b-[0-9a-f]{4}\\b-[0-9a-f]{4}\\b-[0-9a-f]{4}\\b-[0-9a-f]{12}$",
  "i"
);

export const generateTableData = async (
  webviewPath: string,
  queries: Record<string, string>
) => {
  try {
    if (vscode.workspace.workspaceFolders !== undefined) {
      vscode.window.showInformationMessage("Generating table data...");

      const sparqlData: Record<string, ITableData[]> = {};

      const dataTypes = Object.keys(queries);

      await Promise.all(
        dataTypes.map(async (type) => {
          const data = await SparqlClient(queries[type], "query");
          sparqlData[type] = data;
        })
      );

      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_TABLE_DATA,
        payload: sparqlData,
      });
    } else {
      throw new Error("No workspace folders are open");
    }
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_TABLE_DATA,
        payload: {},
        errorMessage: `Error: ${error.message}`,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      TablePanel.currentPanels.get(webviewPath)?.sendMessage({
        command: Commands.LOADED_TABLE_DATA,
        payload: {},
        errorMessage: `An unknown error occurred: ${error}`,
      });
    }
  }
};

export const generatePropertySheet = async (
  panelProvider: PropertyPanelProvider,
  queryName: string,
  iri: string
) => {
  try {
    if (vscode.workspace.workspaceFolders !== undefined) {
      // Query Fuseki DB to get the property sheet data
      const sparqlData = await SparqlClient(queryName, "query", iri);

      console.log("SPARQL DATA", sparqlData);

      // send the JSON data to tableDataLoaded
      panelProvider.sendMessage({
        command: Commands.LOADED_PROPERTY_SHEET,
        payload: sparqlData,
      });
    } else {
      throw new Error("No workspace folders are open");
    }
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`Error: ${error.message}`);
      panelProvider.sendMessage({
        command: Commands.LOADED_PROPERTY_SHEET,
        payload: [],
        errorMessage: `Error: ${error.message}`,
      });
    } else {
      vscode.window.showErrorMessage(`An unknown error occurred: ${error}`);
      panelProvider.sendMessage({
        command: Commands.LOADED_PROPERTY_SHEET,
        payload: [],
        errorMessage: `An unknown error occurred: ${error}`,
      });
    }
  }
};
