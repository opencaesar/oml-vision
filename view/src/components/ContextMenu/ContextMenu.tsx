import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import "./ContextMenu.css";
import useContextMenu from "./useContextMenu";
import ITableData from "../../interfaces/ITableData";
import { TableLayout, TreeLayout } from "../../interfaces/DataLayoutsType";
import { CommandStructure } from "../../interfaces/CommandLayoutsType";
import { Commands } from "../../../../commands/src/commands";

import { RowModel } from "@tanstack/react-table";
import { NodeApi } from "react-arborist";
import { Node } from "reactflow";
import { useWizards } from "../../providers/WizardController";

interface ContextMenuProps {
  layout: TableLayout | TreeLayout;
  modelCommands: Record<string, Record<string, any>>;
  selectedElements: string[];
  top: number;
  left: number;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  layout,
  modelCommands,
  selectedElements,
  top,
  left,
}) => {
  const { openWizard } = useWizards();
  const { contextMenuRef } = useContextMenu();
  const { handleSubmit } = useForm();

  // This array is used to store the selected IRIs from the webview.  These IRIs are usually fed into a SPARQL query
  const selectedIris: string[] = selectedElements;

  // This string is used to check which type of webview the selected elements are coming from
  let webviewType = "";

  // Set the cursor X & Y position
  useEffect(() => {
    if (contextMenuRef.current) {
      contextMenuRef.current.style.setProperty("--top", `${top}px`);
      contextMenuRef.current.style.setProperty("--left", `${left}px`);
    }
  }, [top, left]);

  /**
   * Checks the interface type of the selected webview elements and changes the webviewType based on the type.
   *
   * @remarks
   * This method is inspired from the GeeksforGeeks article found {@link https://www.geeksforgeeks.org/how-to-check-interface-type-in-typescript/| here}
   *
   * @param selectedElements - The selected webview elements
   * @deprecated This method is deprecated and will be removed in the next major release
   *
   */
  const checkSelectedElements = (
    selectedElements: RowModel<ITableData> | NodeApi<ITableData>[] | Node[]
  ) => {
    if ((selectedElements as RowModel<ITableData>).flatRows !== undefined)
      webviewType = "table";
    // @ts-ignore
    else if ((selectedElements as NodeApi<ITableData>)[0].tree !== undefined)
      webviewType = "tree";
    // @ts-ignore
    else if ((selectedElements as Node)[0].position !== undefined)
      webviewType = "diagram";
  };

  /**
   * Filters the selected IRIs from the selected elements based on the webview type.
   *
   * @remarks
   * This method is inspired from the GeeksforGeeks article found {@link https://www.geeksforgeeks.org/how-to-check-interface-type-in-typescript/| here}
   *
   * @param webviewType - The webview type (table, tree, or diagram)
   * @param selectedElements - The selected webview elements
   * @param selectedIris - The selected IRIs array
   * @deprecated This method is deprecated and will be removed in the next major release
   *
   */
  const addSelectedIris = (
    webviewType: string,
    selectedElements: RowModel<ITableData> | NodeApi<ITableData>[] | Node[],
    selectedIris: string[]
  ) => {
    if (webviewType === "table") {
      // Refer to https://tanstack.com/table/latest/docs/guide/row-models#row-model-data-structure for the data structure
      // @ts-ignore
      selectedElements.flatRows.forEach((row) => {
        // add the selected row iri to the list
        selectedIris.push(row.original.iri);
      });
    }

    if (webviewType === "tree") {
      // Refer to https://github.com/brimdata/react-arborist/tree/main?tab=readme-ov-file#tree-component-props for the data structure
      // @ts-ignore
      selectedElements.forEach((row) => {
        // add the selected row iri to the list
        selectedIris.push(row.data.iri);
      });
    }

    if (webviewType === "diagram") {
      // Refer to https://reactflow.dev/api-reference/types/node for the data structure
      // @ts-ignore
      selectedElements.forEach((row) => {
        // add the selected row iri to the list
        selectedIris.push(row.data.iri);
      });
    }
  };

  /**
   * Post a CRUD message to the webview.
   *
   * @remarks
   * This method uses the postMessage method found {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage| here}
   *
   * @param command - The command to send using the postMessage method
   *
   */
  const postCrudMessage = (command: CommandStructure) => {
    if (command.type === "create") {
      postMessage({
        command: Commands.CREATE_QUERY,
        query: command.query,
        selectedElements: selectedIris,
      });
      openWizard("CreateElementWizard", { selectedIris });
    } else if (command.type === "read") {
      postMessage({
        command: Commands.READ_QUERY,
        query: command.query,
        selectedElements: selectedIris,
      });
    } else if (command.type === "update") {
      postMessage({
        command: Commands.UPDATE_QUERY,
        query: command.query,
        selectedElements: selectedIris,
      });
      openWizard("UpdateElementsWizard", { selectedIris });
    } else if (command.type === "delete") {
      openWizard("DeleteElementsWizard", { iriArray: selectedIris });
    } else {
      postMessage({
        command: Commands.ALERT,
        text: "Specify a command type!",
      });
    }
  };

  /**
   * These are the available commands that come from the OML Model.
   *
   * @remarks
   * This method uses the TableLayout interface from view/src/interfaces/DataLayoutsType.ts.
   *
   * @returns commands - Available commands
   *
   */
  const onSubmit = (command: CommandStructure) => {
    // Post a CRUD message to the webview
    postCrudMessage(command);
  };

  /**
   * These are the available commands that come from the OML Model.
   *
   * @remarks
   * This method uses the TableLayout interface from view/src/interfaces/DataLayoutsType.ts.
   *
   * @returns commands - Available commands
   *
   */
  const availableCommands = () => {
    if (Object.keys(modelCommands).includes(layout.contextMenu.commands)) {
      return modelCommands[layout.contextMenu.commands] as Array<string>;
    }
    // Return empty array if commands aren't found
    return [];
  };

  return (
    <div ref={contextMenuRef} className={"context-menu-container"}>
      <div className={"context-menu"}>
        {availableCommands().map((modelCommand, index) => {
          return (
            <VSCodeOption
              key={index}
              /* @ts-ignore */
              onClick={handleSubmit(() => onSubmit(modelCommand.command))}
            >
              {/* @ts-ignore */}
              {modelCommand.name}
            </VSCodeOption>
          );
        })}
      </div>
    </div>
  );
};

export default ContextMenu;
