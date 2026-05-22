/**
 * Edge Decision Types
 * Response types for bid request processing
 */

export enum DecisionType {
    ALLOW = 'allow', // Pass through without modification
    BLOCK = 'block', // Reject the bid request
    BID_MODIFIER = 'bid_modifier', // Adjust bid price
    REROUTE = 'reroute', // Redirect to alternative supply path
}

export enum BlockReason {
    MFA_HIGH_RISK = 'mfa_high_risk',
    INVALID_PUBLISHER = 'invalid_publisher',
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    INVALID_REQUEST = 'invalid_request',
    FRAUD_DETECTED = 'fraud_detected',
    POLICY_VIOLATION = 'policy_violation',
    BUDGET_EXHAUSTED = 'budget_exhausted',
}

export interface BidModifier {
    type: 'multiply' | 'add' | 'set';
    value: number;
    reason: string;
}

export interface EdgeDecision {
    requestId: string;
    decision: DecisionType;
    timestamp: number; // Unix timestamp in milliseconds
    processingTimeMs: number;
    price?: number; // Bid price (if applicable)
    metadata: {
        publisherId: string;
        domain: string;
        thermalScore?: number;
        riskLevel?: string;
        signals?: string[];
        // Pacing & Shading Metadata
        shadedPrice?: number;
        originalPrice?: number;
        savings?: number;
        winProb?: number;
        blockReason?: BlockReason; // Optional duplicative field for metadata convenience
    };
    // Decision-specific fields
    blockReason?: BlockReason;
    bidModifier?: BidModifier;
    rerouteTarget?: string;
}

export interface EdgeDecisionRequest {
    requestId: string;
    publisherId: string;
    domain: string;
    impressionCount: number;
    deviceType: string;
    timestamp: number;
}

export interface EdgeDecisionResponse {
    decision: EdgeDecision;
    cacheHit: boolean;
    fallbackUsed: boolean;
}

export interface DecisionAuditLog {
    id: string;
    decision: EdgeDecision;
    bidRequest: {
        id: string;
        publisherId: string;
        domain: string;
        impressionCount: number;
    };
    createdAt: number;
    metadata?: Record<string, unknown>;
}
