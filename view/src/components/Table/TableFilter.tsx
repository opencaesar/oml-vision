import React from "react";
import {
  Column,
  Table
} from '@tanstack/react-table'
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

export default function TableFilter({
  column,
  table,
  onClick,
}: {
  column: Column<any, any>
  table: Table<any>
  onClick: React.MouseEventHandler<HTMLElement>
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id)

  const columnFilterValue = column.getFilterValue()

  return typeof firstValue === 'number' ? (
    <div className="flex space-x-2 w-full mt-2">
      <VSCodeTextField
        className="vscode-input-rounded"
        // @ts-ignore
        type="number"
        // @ts-ignore
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onInput={e =>
          column.setFilterValue((old: [number, number]) => [
            // @ts-ignore
            e.target.value,
            old?.[1],
          ])
        }
        onClick={onClick}
        placeholder={`Min`}
      />
      <VSCodeTextField
        className="vscode-input-rounded"
        // @ts-ignore
        type="number"
        // @ts-ignore
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onInput={e =>
          column.setFilterValue((old: [number, number]) => [
            old?.[0],
            // @ts-ignore
            e.target.value,
          ])
        }
        onClick={onClick}
        placeholder={`Max`}
      />
    </div>
  ) : (
    <VSCodeTextField
      className="vscode-input-rounded w-full mt-2"
      type="text"
      value={(columnFilterValue ?? '') as string}
      // @ts-ignore
      onInput={e => column.setFilterValue(e.target.value)}
      onClick={onClick}
      placeholder={`Filter...`}
    />
  )
}