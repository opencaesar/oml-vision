import ITableType from "./ITableType";

export default interface ITableCategory {
    title: string;
    children: ITableType[];
    iconUrl: string;
    treeIcon?: string;
    subCategories?: ITableCategory[];
    parent?: ITableCategory;
}
