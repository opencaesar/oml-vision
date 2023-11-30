export const CMStatesArray = ['Proposed', 'Preliminary', 'Threat', 'Baseline', 'Deprecated', 'Retracted'] as const;

export enum CMState {
  Proposed = 'Proposed',
  Preliminary = 'Preliminary',
  Threat = 'Threat',
  Baseline = 'Baseline',
  Deprecated = 'Deprecated',
  Retracted = 'Retracted'
}