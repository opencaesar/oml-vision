import ITableType from "../../../commands/src/interfaces/ITableType";

export default interface IPropertiesData {
  tableType: ITableType;
  rowIri: string;
  tableRowTypes: string[];
}
