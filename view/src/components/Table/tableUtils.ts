import ITableData from "../../interfaces/ITableData";
import { CMState } from "../../interfaces/CMStates";
import { TableLayout, IRowMapping } from "../../interfaces/DataLayoutsType";
import { Row } from "@tanstack/table-core";

// Process the json data into content
// that React-Table can render.
export const mapValueData = (
  layout: TableLayout,
  data: { [key: string]: ITableData[] }
) => {
  const processEntry = (entry: ITableData, rowMapping: IRowMapping) => {
    let processedEntry: { [key: string]: any } = {};
    processedEntry["_"] = rowMapping.labelFormat.replace(
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

    // EVERY row should have an IRI, but just in case
    // default it to an empty string
    processedEntry["iri"] = entry["iri"] || "";
    processedEntry["shouldAllowDelete"] = rowMapping.canDeleteElements ?? true;

    // Include maturity for color coding
    processedEntry["maturity"] = entry["maturity"] || "";

    Object.keys(layout.columnNames).forEach((k: string) => {
      const v = entry[k];
      // Remove double quotes from string literal
      const format_v =
        typeof v === "string" ? entry[k].replace(/['"]+/g, "") : entry[k];
      if (format_v && format_v.type !== "uri") {
        processedEntry[layout.columnNames[k]] = format_v;
      }
    });

    return processedEntry;
  };

  const recursiveMapper = (
    rowMapping: IRowMapping,
    parentId?: string,
    parentIri?: string
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
      .map((row: ITableData) => {
        let processedRow = processEntry(row, rowMapping);

        // Save the rowType for row-specific actions in the Table
        // such as right click context menus, etc.
        processedRow["rowType"] = rowMapping.id;

        let children: ITableData[] = [];

        // If the row is recursive, get its children and add to allChildren
        // Otherwise, check for subRowMappings
        if (rowMapping.isRecursive) {
          children = recursiveMapper(rowMapping, "parent", row.iri);
        } else if (rowMapping.subRowMappings) {
          children = rowMapping.subRowMappings.flatMap(
            (subMapping: IRowMapping) =>
              recursiveMapper(subMapping, rowMapping.id, row.iri)
          );
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
 * Sets the font style based on a conditional for a given row.
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
  row: Row<ITableData>
) => {
  // Remove redundant double quotes from string
  const formattedConditional = row.original[conditional].slice(1, -1);
  return styles[formattedConditional];
};

// Helper to get row range on Shift + Click to select multiple rows
export function getRowRange<ITableData>(
  rows: Array<Row<ITableData>>,
  idA: string,
  idB: string
) {
  const range: Array<Row<ITableData>> = [];
  // Don't do anything if we Shift + Clicked the same as previous row
  if (idA === idB) return range;

  let foundStart = false;
  let foundEnd = false;
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.id === idA || row.id === idB) {
      if (foundStart) {
        foundEnd = true;
      }
      if (!foundStart) {
        foundStart = true;
      }
    }

    if (foundStart) {
      range.push(row);
    }

    if (foundEnd) {
      break;
    }
  }

  return range;
}
