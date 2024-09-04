import ITableData from "../../interfaces/ITableData";
import { CMState } from "../../interfaces/CMStates";
import { IRowMapping, TreeLayout } from "../../interfaces/DataLayoutsType";
import { Commands } from "../../../../commands/src/commands";
import { postParentMessage } from "../../utils/postMessage";

// This variable is used to only have an error reported once. This allows vscode.window to show popups
// FIXME: Use a better technique than a flag.
let errorReported = false;

// Process the TREE json data into content
// that React-Table can render.
export const mapTreeValueData = (
  layout: TreeLayout,
  data: { [key: string]: ITableData[] }
) => {
  const processEntry = (
    entry: ITableData,
    rowMapping: IRowMapping,
    identifier: string
  ) => {
    let processedEntry: { [key: string]: any } = {};
    // React Arborist requires name and ID parameters
    processedEntry["name"] = rowMapping.labelFormat.replace(
      /{([^}]+)}/g,
      (match, placeholder) => {
        const entry_placeholder = entry[placeholder];
        // Remove double quotes from string literal
        const format_entry_placeholder =
          typeof entry_placeholder === "string"
            ? entry[placeholder].replace(/['"]+/g, "")
            : entry[placeholder];
        return format_entry_placeholder || "";
      }
    );

    // Add ID for row sorting
    processedEntry["id"] = identifier;
    processedEntry["shouldAllowDelete"] = rowMapping.canDeleteElements ?? true;

    // EVERY row should have an IRI, but just in case
    // default it to an empty string
    processedEntry["iri"] = entry["iri"] || "";

    // Include maturity for color coding
    processedEntry["maturity"] = entry["maturity"] || "";

    return processedEntry;
  };

  const recursiveMapper = (
    rowMapping: IRowMapping,
    parentId?: string,
    parentIri?: string,
    recursiveIdentifier?: string
  ): ITableData[] => {
    if (!data[rowMapping.id]) return [];
    return data[rowMapping.id]
      .filter((row) => {
        // If there's no parentIri specified, we're looking for root nodes
        // If there is a parentIri, we're looking for children of a specific parent
        if (parentIri) {
          return row[`${parentId}Iri`] === parentIri;
        } else {
          return !row["parentIri"];
        }
      })
      .map((row: ITableData, index: number) => {
        // Random uuid as an identifer for row
        let uuid = crypto.randomUUID();

        let identifier = recursiveIdentifier
          ? `${recursiveIdentifier}-${index}`
          : `${index}`;
        let processedRow = processEntry(row, rowMapping, uuid);

        // Save the rowType for row-specific actions in the Table
        // such as right click context menus, etc.
        processedRow["rowType"] = rowMapping.id;

        let children: ITableData[] = [];

        // If the row is recursive, get its children and add to allChildren
        // Otherwise, check for subRowMappings
        if (rowMapping.isRecursive) {
          children = recursiveMapper(rowMapping, "parent", row.iri, identifier);
          // Check to make sure subRowMappings exists
        } else if (rowMapping.subRowMappings) {
          if (rowMapping.subRowMappings[0].id !== rowMapping.id) {
            // Handles case where children nodes come from a different query than the parent
            children = rowMapping.subRowMappings.flatMap(
              (subMapping: IRowMapping) =>
                recursiveMapper(subMapping, rowMapping.id, row.iri, identifier)
            );
          } else {
            // Handles case where children nodes come from the same query than the parent
            children = rowMapping.subRowMappings.flatMap(
              (subMapping: IRowMapping) => recursiveMapper(subMapping, identifier=identifier)
            );
          }
        }

        if (children.length > 0) {
          processedRow["children"] = children;
        }

        return processedRow;
      });
  };

  return recursiveMapper(layout.rowMapping);
};

/**
 * Styles the font color as a tailwind class.  Each returned string is a concatenation of Tailwind CSS classes
 *
 * @deprecated
 * This function is not generic for all OML models.  Remove after v1.0.0.
 *
 */
export const getLifecycleStateStyles = (state: CMState) => {
  switch (state) {
    case CMState.Proposed:
      return "text-[color:var(--vscode-debugIcon-stepOverForeground)]"; // blue for proposed
    case CMState.Preliminary:
      return "text-[color:var(--vscode-gitDecoration-untrackedResourceForeground)]"; // green for preliminary
    case CMState.Threat:
      return "text-[color:var(--vscode-charts-purple)]"; // purple for threat
    case CMState.Baseline:
      return ""; // default for baseline
    case CMState.Deprecated:
      return "line-through"; // default + strike through for deprecated
    case CMState.Retracted:
      return "text-[color:var(--vscode-charts-red)] line-through"; // red + strike through for retracted
    default:
      return "";
  }
};

/**
 * Sets the font style based on a conditional for a given node.
 *
 * @remarks
 * This method uses styles from {@link https://tailwindcss.com/ | TailwindCSS}.
 *
 * @param styles - The styles that come from the OML model.
 * @param conditional - The conditional that determines which style to apply.
 * @param row - The row on which to set the font style.
 *
 */
export const setFontStyle = (
  styles: Record<string, Record<string, string>>,
  conditional: string,
  node: ITableData
) => {
  let formattedConditional;
  try {
    if (
      node.data[conditional].startsWith('"') &&
      node.data[conditional].endsWith('"')
    ) {
      // Remove redundant double quotes from string in present
      formattedConditional = node.data[conditional].slice(1, -1);
    } else {
      formattedConditional = node.data[conditional];
    }
    return styles[formattedConditional];
  } catch (error) {
    reportError(error, conditional);
  }
};

/**
 * Reports an error to the parent window.
 *
 * @remarks
 * This function sends a message to the parent window using the `postParentMessage` function.
 * It ensures that the error is reported only once by tracking whether an error has already been reported.
 *
 * @param error - The error to be reported.
 * @param conditional - The conditional string used in error reporting.
 *
 * @returns void
 */
function reportError(error: unknown, conditional: string): void {
  if (errorReported) {
    return;
  }

  if (error instanceof Error) {
    postParentMessage({
      command: Commands.ALERT,
      text: `Error: Invalid/Undefined fontStyle.conditional ${conditional}`,
    });
  } else {
    postParentMessage({
      command: Commands.ALERT,
      text: `Unknown error: ${error}`,
    });
  }

  errorReported = true;
}

export const areArraysOfObjectsEqual = (
  ...arrays: [{ [x: string]: ITableData[] }] | any[]
) => {
  // Check if lengths are equal
  const lengthCheck = arrays.every((arr) => arr.length === arrays[0].length);
  if (!lengthCheck) {
    return false;
  }

  // Helper function to compare two objects
  const areObjectsEqual = (
    obj1: { [x: string]: { toString: () => any } },
    obj2: { [x: string]: { toString: () => any } }
  ) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // Check if number of keys is the same
    if (keys1.length !== keys2.length) {
      return false;
    }

    // Check if values for each key are the same
    return keys1.every((key) => obj1[key].toString() === obj2[key].toString());
  };

  // Check if every object in the first array is present in the other arrays
  const areArraysEqual = Object.values(arrays[0]).every((obj: any) =>
    arrays
      .slice(1)
      .every((arr) =>
        arr.some((arrObj: { [x: string]: { toString: () => any } }) =>
          areObjectsEqual(obj, arrObj)
        )
      )
  );

  return areArraysEqual;
};
