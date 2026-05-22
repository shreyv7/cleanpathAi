/**
 * MFA (Made for Advertising) Classification Types
 * Thermal imaging and risk scoring
 */

export enum RiskLevel {
    CLEAN = 'clean', // 0-30: Safe publisher
    MODERATE = 'moderate', // 31-70: Suspicious, needs monitoring
    HIGH = 'high', // 71-100: MFA site, should be blocked
}

export enum MFASignal {
    HIGH_AD_DENSITY = 'high_ad_density',
    LOW_ENGAGEMENT = 'low_engagement',
    POOR_CONTENT_RATIO = 'poor_content_ratio',
    DOMAIN_REPUTATION = 'domain_reputation',
    SUSPICIOUS_TRAFFIC = 'suspicious_traffic',
    ARBITRAGE_PATTERN = 'arbitrage_pattern',
}

export interface ThermalScore {
    overall: number; // 0-100 scale
    breakdown: {
        adDensity: number; // 0-100
        engagement: number; // 0-100
        contentQuality: number; // 0-100
        domainReputation: number; // 0-100
    };
    signals: MFASignal[];
    confidence: number; // 0-1 scale
}

export interface MFAClassification {
    publisherId: string;
    domain: string;
    thermalScore: ThermalScore;
    riskLevel: RiskLevel;
    timestamp: number; // Unix timestamp in milliseconds
    version: string; // Classification model version
    metadata?: {
        adDensityRatio?: number; // Ads per viewport
        avgEngagementTime?: number; // Seconds
        contentToAdRatio?: number; // Percentage
        trafficSources?: string[];
    };
}

export interface MFARule {
    id: string;
    name: string;
    description: string;
    signal: MFASignal;
    threshold: number;
    weight: number; // Contribution to overall score
    enabled: boolean;
}

export interface MFAClassificationResult {
    classification: MFAClassification;
    appliedRules: MFARule[];
    processingTimeMs: number;
}
