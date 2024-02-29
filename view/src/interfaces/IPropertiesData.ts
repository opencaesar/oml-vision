import IWebviewType from "../../../commands/src/interfaces/IWebviewType";

export default interface IPropertiesData {
  webviewType: IWebviewType;
  rowIri: string;
  tableRowTypes: string[];
}
