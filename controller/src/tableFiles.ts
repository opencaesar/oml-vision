import IWebviewType from "../../commands/src/interfaces/IWebviewType";
import ITableCategory from "../../commands/src/interfaces/ITableCategory";

const TABLES: (IWebviewType | ITableCategory)[] = [
    { title: 'Home', path: '/', type: "home" }
];

export default TABLES;