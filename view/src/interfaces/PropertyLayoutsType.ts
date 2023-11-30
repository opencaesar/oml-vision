/* NEW PAGE LAYOUT */

export type PropertyType = 'text' | 'radio' | 'url'

export type PropertyControls = {
  // type: PropertyType,
  // name: string,
  // label: string,
  // helpExpression: string,
  // isEnabledExpression?: string,
  // initialOperation?: any,
  [key: string]: any
}

export type PropertyGroup = {
  id: string,
  label: string,
  domainClass: string,
  displayExpression?: string,
  controls: PropertyControls[]
}

export type PropertyPage = {
  id: string,
  label: string,
  icon: string,
  sparqlQuery: string,
  domainClass: string,
  preconditionExpression: string,
  groups: PropertyGroup[]
}

export type PropertyLayout = {
  pages: PropertyPage[],
}