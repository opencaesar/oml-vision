/**
 * Defines the structure of the JSON object that is received from the pages.json file.
 *
 * @field title - The title of the page item
 * @field type - The type of the page item.  Home = Home Page (there can only be one home page), Group = collection of pages, Diagram = Diagram Page, Tree = Tree Page, and Table = Table Page
 * @field path - The path to the configuration of the page item
 * @field iconUrl - The url to the icon that gets displayed in the home page.  This is typically the url to a SVG published to the web
 * @field children - The children of the group items
 *
 */
export default interface IPagesSchema {
  title: string;
  type: string;
  path?: string;
  iconUrl?: string;
  children?: Children[];
}

/**
 * Defines the structure of the child pages
 *
 * @field title - The title of the child page item
 * @field type - The type of the child page item.  Home = Home Page (there can only be one home page), Group = collection of pages, Diagram = Diagram Page, Tree = Tree Page, and Table = Table Page
 * @field path - The path to the configuration of the child page item
 *
 */
interface Children {
  title: string;
  type: string;
  path: string;
}
