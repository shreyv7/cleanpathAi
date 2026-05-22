import { RiskLevel, ThermalScore } from './MFAClassification';
export declare enum PublisherStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    UNDER_REVIEW = "under_review",
    BLOCKED = "blocked"
}
export declare enum PublisherTier {
    PREMIUM = "premium",
    STANDARD = "standard",
    PROBATION = "probation",
    BLOCKED = "blocked"
}
export interface PublisherProfile {
    id: string;
    name: string;
    domain: string;
    status: PublisherStatus;
    tier: PublisherTier;
    createdAt: number;
    updatedAt: number;
    metadata: {
        categories: string[];
        monthlyImpressions?: number;
        averageCPM?: number;
        geography?: string[];
        contactEmail?: string;
    };
}
export interface PublisherMFAProfile {
    publisherId: string;
    currentThermalScore: ThermalScore;
    currentRiskLevel: RiskLevel;
    historicalScores: Array<{
        score: number;
        timestamp: number;
    }>;
    lastEvaluated: number;
    evaluationCount: number;
    overrides?: {
        manualRiskLevel?: RiskLevel;
        reason?: string;
        setBy?: string;
        setAt?: number;
    };
}
export interface PublisherCache {
    profile: PublisherProfile;
    mfaProfile: PublisherMFAProfile;
    cachedAt: number;
    ttl: number;
}
export interface PublisherCreateRequest {
    name: string;
    domain: string;
    tier?: PublisherTier;
    categories?: string[];
    contactEmail?: string;
}
export interface PublisherUpdateRequest {
    name?: string;
    status?: PublisherStatus;
    tier?: PublisherTier;
    categories?: string[];
    metadata?: Record<string, unknown>;
}
export interface PublisherSearchQuery {
    domain?: string;
    status?: PublisherStatus;
    tier?: PublisherTier;
    riskLevel?: RiskLevel;
    minThermalScore?: number;
    maxThermalScore?: number;
    limit?: number;
    offset?: number;
}
export interface PublisherSearchResult {
    publishers: PublisherProfile[];
    total: number;
    limit: number;
    offset: number;
}
//# sourceMappingURL=Publisher.d.ts.map