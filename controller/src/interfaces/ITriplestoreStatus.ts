/**
 * Defines the structure of the status object that is recieved from the triplestore.
 *
 * @remarks
 * This method is used with the dataset variable from the {@link https://jena.apache.org/documentation/fuseki2/fuseki-server-protocol.html | Fuseki server protocol}.
 *
 * @field title - Name of the Webview
 * @field path - Path to the Webview 
 * @field type - Type of Webview (home, group, table, etc.)
 *
 * @todo Make this interface extendable to other triplestores
 * TODO: Make this interface extendable to other triplestores
 * 
 */
export default interface ITriplestoreStatus {
    datasets: {
      sizeNumbers: number
    };
  }