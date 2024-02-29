import IWebviewType from "./IWebviewType";

export default interface ITableCategory {
    title: string;
    children: IWebviewType[];
    iconUrl: string;
    type?: string;
    subCategories?: ITableCategory[];
    parent?: ITableCategory;
}
