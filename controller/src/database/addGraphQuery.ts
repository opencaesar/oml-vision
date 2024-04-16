/**
 * Extract the original data within the INSERT/DELETE statement.
 *
 * @param query - The SPARQL query string containing the INSERT/DELETE statement.
 * @returns An array of arrays, where each inner array represents a row of data extracted from the query.
 */
const extractDataFromQuery = (query: string): string[][] => {
  // Add a carriage return at the end of each line
  const lines = query.split("\n");

  let graphLineIndex: number | undefined;
  let closingDataLineIndex: number | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("INSERT DATA {") || line.startsWith("DELETE DATA {")) {
      // We want the index of the next line in the query
      graphLineIndex = i + 1;
    }
    if (line.startsWith("INSERT DATA") || line.startsWith("DELETE DATA")) {
      // We want the index of the line following the '{' in the query
      graphLineIndex = i + 2;
    }
    if (line.startsWith("}")) {
      // We want the index of the line that contains '}' in the query
      closingDataLineIndex = i;
    }
  }

  // Throw an error if there is no graph statement or ending '}'
  if (graphLineIndex === undefined || closingDataLineIndex === undefined) {
    throw new Error("Invalid query format");
  }

  // This is the header of the query usually where the prefixes go
  const header = lines.slice(0, graphLineIndex);

  // This is the body of the query
  const body = lines.slice(graphLineIndex, closingDataLineIndex);

  // This is the footer of the query usually any closing syntax goes like '}'
  const footer = lines.slice(closingDataLineIndex);

  return [header, body, footer];
};

/**
 * Find the PREFIX in the part of the query that contains the named graph.
 *
 * @param query - The SPARQL query string containing the INSERT/DELETE statement.
 * @returns The prefix that contains the named graph
 */
const findGraphPrefix = (query: string): string => {
  // Add a carriage return at the end of each line
  const lines = query.split("\n");

  let graphWord: string | undefined;
  let prefixes = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("INSERT DATA {") || line.startsWith("DELETE DATA {")) {
      // We want the next line in the query
      const graphLine = lines[i + 1];

      // We want to find the index where the first colon occurs
      const colonIndex = graphLine.indexOf(":");

      // Remove any leading or trailing whitespace
      graphWord = graphLine.slice(0, colonIndex).trim();
    } else if (
      line.startsWith("INSERT DATA") ||
      line.startsWith("DELETE DATA")
    ) {
      // We want the line following the '{' in the query
      const graphLine = lines[i + 2];

      // We want to find the index where the first colon occurs
      const colonIndex = graphLine.indexOf(":");

      // Remove any leading or trailing whitespace
      graphWord = graphLine.slice(0, colonIndex).trim();
    }
    if (
      line.startsWith("PREFIX") ||
      line.startsWith("Prefix") ||
      line.startsWith("prefix")
    )
      // Grab all lines that contain the word 'prefix' regardless of capitalization
      prefixes.push(line);
  }

  // Finds the prefix that contain the word that we want to add to the graph statement
  const foundPrefix = prefixes.find((prefix) => {
    if (graphWord && prefix.includes(graphWord)) {
      return prefix;
    }
    return undefined;
  });

  // Throw an error if prefix is not found
  if (foundPrefix) {
    return foundPrefix;
  } else {
    throw new Error("Prefix not found");
  }
};

/**
 * Create a graph statement from a given prefix.
 *
 * @param prefix - The prefix that will be used to create the graph statement.
 * @returns The graph statement with the iri that was created from the prefix
 */
function createGraphStatement(prefix: string): string {
  // https://www.oxfordsemantic.tech/faqs/what-is-an-iri-what-does-iri-mean#
  let iri = prefix.split("<")[1].trim();

  // Add back the < that was removed in the iri.  HACK: can find better solution
  iri = "<" + iri;

  // Remove the # in the iri
  iri = iri.replace("#", "");

  // Add 'graph' into the iri at start and '{' at end
  iri = "graph " + iri + " {";
  return iri;
}

/**
 * Adds graph to the original SPARQL query.
 *
 * @param query - The SPARQL query string containing the INSERT/DELETE statement.
 * @returns The formatted SPARQL query that contains the new named graph statement.
 */
export const addGraphToQuery = (query: string): string => {
  const data = extractDataFromQuery(query);

  // The different parts of the data
  const header = data[0];
  const body = data[1];
  const footer = data[2];

  const prefix = findGraphPrefix(query);
  const iri = createGraphStatement(prefix);

  // Fix edge case where users may format query as INSERT DATA { where the curly bracket is on the same line
  if (header[header.length - 1] !== "{") {
    body.unshift(header[header.length - 1]);
    header.pop();
  }

  // Insert graph into query
  body.unshift(iri);

  // Add closing bracket with a tab to the end of the body
  body.push("\t}");

  // Use spread operator to insert formatted data into a new list
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  const convertedData = [...header, ...body, ...footer];

  // The converted list turned into a string with a newline (\n) at the end of each line
  return convertedData.join("\n");
};
