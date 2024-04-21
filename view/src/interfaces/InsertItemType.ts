import { ReactElement } from "react"

export type InsertItem = {
    label: string,
    onItemClicked: () => void,
    icon: ReactElement<any>
  }