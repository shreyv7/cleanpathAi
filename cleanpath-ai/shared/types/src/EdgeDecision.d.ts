export declare enum DecisionType {
    ALLOW = "allow",
    BLOCK = "block",
    BID_MODIFIER = "bid_modifier",
    REROUTE = "reroute"
}
export declare enum BlockReason {
    MFA_HIGH_RISK = "mfa_high_risk",
    INVALID_PUBLISHER = "invalid_publisher",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
    INVALID_REQUEST = "invalid_request",
    FRAUD_DETECTED = "fraud_detected",
    POLICY_VIOLATION = "policy_violation"
}
export interface BidModifier {
    type: 'multiply' | 'add' | 'set';
    value: number;
    reason: string;
}
export interface EdgeDecision {
    requestId: string;
    decision: DecisionType;
    timestamp: number;
    processingTimeMs: number;
    metadata: {
        publisherId: string;
        domain: string;
        thermalScore?: number;
        riskLevel?: string;
        signals?: string[];
    };
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
//# sourceMappingURL=EdgeDecision.d.ts.map