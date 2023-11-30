import ITableType from "./ITableType";

export interface IPropertyData {
  tableType: ITableType;
  rowIri: string;
  tableRowTypes: string[];
}