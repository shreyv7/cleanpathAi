/**
 * Publisher Metrics Interface
 * Input data for MFA classification
 */

export interface PublisherMetrics {
    publisherId: string;
    domain: string;

    // Ad density metrics
    adsPerViewport: number; // Number of ads visible in viewport
    totalAds: number; // Total ads on page
    viewportArea: number; // Viewport area in pixels

    // Engagement metrics
    avgEngagementTime: number; // Average time on site in seconds
    bounceRate: number; // Percentage (0-1)
    pagesPerSession: number;

    // Content quality metrics
    contentToAdRatio: number; // Percentage (0-1)
    textContentLength: number; // Characters
    imageContentCount: number;

    // Domain reputation
    domainReputationScore: number; // 0-100 (higher is better)
    domainAge: number; // Days since domain creation

    // Traffic patterns
    paidTrafficRatio: number; // Percentage (0-1)
    organicTrafficRatio: number; // Percentage (0-1)
    directTrafficRatio: number; // Percentage (0-1)

    // Historical data
    historicalBlockRate?: number; // Percentage (0-1)
    previousThermalScore?: number; // 0-100
}

/**
 * Default metrics for unknown publishers
 */
export const DEFAULT_PUBLISHER_METRICS: Partial<PublisherMetrics> = {
    adsPerViewport: 2.0,
    avgEngagementTime: 30.0,
    bounceRate: 0.5,
    pagesPerSession: 1.5,
    contentToAdRatio: 0.6,
    domainReputationScore: 50.0,
    paidTrafficRatio: 0.3,
    organicTrafficRatio: 0.5,
    directTrafficRatio: 0.2,
};
