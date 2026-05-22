export declare enum RiskLevel {
    CLEAN = "clean",
    MODERATE = "moderate",
    HIGH = "high"
}
export declare enum MFASignal {
    HIGH_AD_DENSITY = "high_ad_density",
    LOW_ENGAGEMENT = "low_engagement",
    POOR_CONTENT_RATIO = "poor_content_ratio",
    DOMAIN_REPUTATION = "domain_reputation",
    SUSPICIOUS_TRAFFIC = "suspicious_traffic",
    ARBITRAGE_PATTERN = "arbitrage_pattern"
}
export interface ThermalScore {
    overall: number;
    breakdown: {
        adDensity: number;
        engagement: number;
        contentQuality: number;
        domainReputation: number;
    };
    signals: MFASignal[];
    confidence: number;
}
export interface MFAClassification {
    publisherId: string;
    domain: string;
    thermalScore: ThermalScore;
    riskLevel: RiskLevel;
    timestamp: number;
    version: string;
    metadata?: {
        adDensityRatio?: number;
        avgEngagementTime?: number;
        contentToAdRatio?: number;
        trafficSources?: string[];
    };
}
export interface MFARule {
    id: string;
    name: string;
    description: string;
    signal: MFASignal;
    threshold: number;
    weight: number;
    enabled: boolean;
}
export interface MFAClassificationResult {
    classification: MFAClassification;
    appliedRules: MFARule[];
    processingTimeMs: number;
}
//# sourceMappingURL=MFAClassification.d.ts.map