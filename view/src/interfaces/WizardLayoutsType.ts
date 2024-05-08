/* NEW WIZARD LAYOUT */

export type WizardType = 'create' | 'read' | 'update' | 'delete'

export type WizardControls = {
  [key: string]: any
}

export type WizardGroup = {
  id: string,
  label: string,
  domainClass: string,
  displayExpression?: string,
  controls: WizardControls[]
}

export type WizardPage = {
  id: string,
  label: string,
  icon: string,
  sparqlQuery: string,
  domainClass: string,
  preconditionExpression: string,
  groups: WizardGroup[]
}

export type WizardLayout = {
  pages: WizardPage[],
}