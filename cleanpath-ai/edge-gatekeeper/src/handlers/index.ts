/**
 * Handlers Module Exports
 */

export { DecisionHandler, createDecisionHandler } from './DecisionHandler';
export type { DecisionContext, DecisionResult } from './DecisionHandler';

export {
    DEFAULT_DECISION_CONFIG,
    validateDecisionConfig,
} from './decisionConfig';
export type {
    DecisionConfig,
    DecisionThresholds,
    FailOpenConfig,
} from './decisionConfig';
