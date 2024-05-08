const sparqlFormatter = require('sparql-formatter');

/**
 * Removes graph and closing brace(s) to correctly format the original SPARQL query.
 *
 * @param query - The SPARQL query string containing the INSERT/DELETE statement.
 * @returns The formatted SPARQL query that contains the correctly formatted SPARQL query.
 */
export const removeGraphFromQuery = (query: string): string => {
  const formattedQuery: string = sparqlFormatter(query);
  const lines = formattedQuery.split("\n");
  const removedGraph = lines.filter((line) => !line.includes("GRAPH")).join("\n");

  if (
    removedGraph.includes("DELETE") &&
    removedGraph.includes("INSERT")
  ) {
    const lines = removedGraph.split("\n");
    let count = 0;
    const cleanedLines: string[] = [];

    for (const line of lines) {
      if (line.includes("}")) {
        count++;
        if (count !== 1 && count !== 3) {
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join("\n");
  } else {
    const lines = removedGraph.split("\n");
    let count = 0;
    const cleanedLines: string[] = [];

    for (const line of lines) {
      if (line.includes("}")) {
        count++;
        if (count !== 1) {
          cleanedLines.push(line);
        }
      } else {
        cleanedLines.push(line);
      }
    }

    return cleanedLines.join("\n");
  }
};
