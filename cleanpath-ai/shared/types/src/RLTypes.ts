import { CTVFeatureVector } from './CTVMLFeatures';

/**
 * RL Action Space
 * Discrete actions the agent can take
 */
export enum RLAction {
    ALLOW = 0,
    BLOCK = 1,
    BID_MODIFIER = 2,
}

/**
 * RL State Space
 * Represents the environment state at a given decision point
 */
export interface RLState {
    /** The extracted CTV feature vector (22 dims) */
    features: CTVFeatureVector;

    /** Contextual signals not in the feature vector */
    context: {
        /** Normalized time of day (0-1) */
        timeOfDay: number;
        /** Recent win rate for this publisher (0-1) */
        publisherWinRate: number;
        /** Recent block rate for this publisher (0-1) */
        publisherBlockRate: number;
        /** Thermal score from rule engine (0-100) */
        thermalScore: number;
    };
}

/**
 * Reward Signal
 * Feedback received after an action is taken
 */
export interface RLReward {
    /** Immediate reward (e.g., calculated from rules/heuristics) */
    immediate: number;
    /** Delayed reward (e.g., from downstream verification/viewability) - optional/async */
    delayed?: number;
    /** Timestamp of the reward */
    timestamp: number;
}

/**
 * Experience Tuple (S, A, R, S')
 * A single transition stored in the Replay Buffer
 */
export interface RLExperience {
    /** Unique ID for the experience/request */
    id: string;
    /** State at time t */
    state: RLState;
    /** Action taken at time t */
    action: RLAction;
    /** Reward received at time t+1 (or immediate) */
    reward: number;
    /** State at time t+1 (Next state) - Optional as episodes might be single-step in bidding */
    nextState?: RLState;
    /** Whether this state was terminal (end of episode) */
    done: boolean;
    /** Metadata for debugging/analysis */
    metadata?: Record<string, any>;
    timestamp: number;
}

export const RL_CONSTANTS = {
    STATE_DIM: 26, // 22 features + 4 context
    ACTION_DIM: 3, // Allow, Block, BidMod
    gamma: 0.99,   // Discount factor
};
