/**
 * Defines whether or not a triplestore is loaded with data and can be pinged.
 *
 * @remarks
 * This method is used with the TreeDataProvider class from the {@link https://code.visualstudio.com/api/extension-guides/tree-view| Tree View API}.
 *
 * @field pinged - Determines if triplestore can be pinged (return a HTTP status code of 200)
 * @field loaded - Determines if triplestore is loaded with data
 *
 */
export default interface ILoadedTriplestoreType {
    pinged: boolean;
    loaded: boolean;
  }