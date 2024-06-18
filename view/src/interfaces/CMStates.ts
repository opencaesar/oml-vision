/**
 * Configuration Management State Array.
 *
 * @deprecated
 * This array is not generalized to all OML models.  Remove after v1.0.0.
 *
 */
export const CMStatesArray = ['Proposed', 'Preliminary', 'Threat', 'Baseline', 'Deprecated', 'Retracted'] as const;

/**
 * Configuration Management State Enumeration.
 *
 * @deprecated
 * This enum is not generalized to all OML models.  Remove after v1.0.0.
 *
 */
export enum CMState {
  Proposed = 'Proposed',
  Preliminary = 'Preliminary',
  Threat = 'Threat',
  Baseline = 'Baseline',
  Deprecated = 'Deprecated',
  Retracted = 'Retracted'
}