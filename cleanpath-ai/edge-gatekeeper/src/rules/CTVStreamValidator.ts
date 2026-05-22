/**
 * CTV Streaming Environment Validator
 * Validates streaming session metadata for detecting emulator patterns
 * and impossible session states.
 */

import {
    StreamingEnvironment,
    CTVSpoofSignal,
    CTVValidationResult,
    CTVSignalDetail,
    Device,
} from '@cleanpath/types';

/**
 * Configuration for stream validation thresholds.
 */
export interface StreamValidatorConfig {
    /** Maximum plausible session duration in seconds (default: 18 hours) */
    maxSessionDurationSec: number;
    /** Maximum concurrent sessions from one IFA before flagging (default: 3) */
    maxConcurrentSessions: number;
    /** Maximum allowed distance in km between IP geo and declared region (default: 1000) */
    maxGeoDistanceKm: number;
    /** Minimum plausible video bitrate in kbps (default: 500) */
    minBitrateKbps: number;
    /** Maximum plausible video bitrate in kbps (default: 50000) */
    maxBitrateKbps: number;
}

const DEFAULT_CONFIG: StreamValidatorConfig = {
    maxSessionDurationSec: 64800, // 18 hours
    maxConcurrentSessions: 3,
    maxGeoDistanceKm: 1000,
    minBitrateKbps: 500,
    maxBitrateKbps: 50000,
};


export class CTVStreamValidator {
    private config: StreamValidatorConfig;

    constructor(config?: Partial<StreamValidatorConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Validate streaming session metadata for anomalies.
     */
    public validateStreamingEnv(
        env: StreamingEnvironment,
        device: Device,
    ): CTVValidationResult {
        const startTime = Date.now();
        const signals: CTVSignalDetail[] = [];
        let riskScore = 0;

        // 1. Check session duration plausibility
        const durationResult = this.checkSessionDuration(env);
        if (durationResult) {
            signals.push(durationResult);
            riskScore += durationResult.severity;
        }

        // 2. Check concurrent session count
        const concurrentResult = this.checkConcurrentSessions(env);
        if (concurrentResult) {
            signals.push(concurrentResult);
            riskScore += concurrentResult.severity;
        }

        // 3. Check IP geolocation vs. declared region
        const geoResult = this.checkGeoConsistency(env, device);
        if (geoResult) {
            signals.push(geoResult);
            riskScore += geoResult.severity;
        }

        // 4. Check bitrate plausibility
        const bitrateResult = this.checkBitrate(env);
        if (bitrateResult) {
            signals.push(bitrateResult);
            riskScore += bitrateResult.severity;
        }

        // 5. Check for zero-duration sessions (bot pattern)
        const zeroDurationResult = this.checkZeroDuration(env);
        if (zeroDurationResult) {
            signals.push(zeroDurationResult);
            riskScore += zeroDurationResult.severity;
        }

        // Cap risk score at 100
        riskScore = Math.min(riskScore, 100);

        return {
            passed: signals.length === 0,
            signals,
            riskScore,
            processingTimeMs: Date.now() - startTime,
        };
    }

    /**
     * Check if session duration exceeds plausible limits.
     */
    private checkSessionDuration(env: StreamingEnvironment): CTVSignalDetail | null {
        if (env.duration > this.config.maxSessionDurationSec) {
            return {
                signal: CTVSpoofSignal.SESSION_ANOMALY,
                severity: 45,
                description: `Session duration ${env.duration}s exceeds maximum plausible duration of ${this.config.maxSessionDurationSec}s`,
                evidence: {
                    duration: env.duration,
                    maxAllowed: this.config.maxSessionDurationSec,
                },
            };
        }
        return null;
    }

    /**
     * Check if concurrent session count is excessive.
     */
    private checkConcurrentSessions(env: StreamingEnvironment): CTVSignalDetail | null {
        if (
            env.concurrentSessions !== undefined &&
            env.concurrentSessions > this.config.maxConcurrentSessions
        ) {
            return {
                signal: CTVSpoofSignal.CONCURRENT_SESSION_ABUSE,
                severity: 65,
                description: `${env.concurrentSessions} concurrent sessions detected (max ${this.config.maxConcurrentSessions})`,
                evidence: {
                    concurrentSessions: env.concurrentSessions,
                    maxAllowed: this.config.maxConcurrentSessions,
                },
            };
        }
        return null;
    }

    /**
     * Check if IP geolocation is consistent with declared region.
     */
    private checkGeoConsistency(
        env: StreamingEnvironment,
        device: Device,
    ): CTVSignalDetail | null {
        if (!env.declaredRegion || !env.ipGeo) {
            return null; // Not enough data to check
        }

        // If we have lat/lon from IP geo and can look up declared region
        const declaredRegionUpper = env.declaredRegion.toUpperCase();
        const ipCountry = env.ipGeo.country?.toUpperCase();

        // Simple country-level check
        if (ipCountry && declaredRegionUpper && ipCountry !== declaredRegionUpper) {
            // Check if declared region is a sub-region (e.g., "US-CA")
            if (!declaredRegionUpper.startsWith(ipCountry)) {
                return {
                    signal: CTVSpoofSignal.GEO_ANOMALY,
                    severity: 55,
                    description: `IP geolocation country "${ipCountry}" doesn't match declared region "${env.declaredRegion}"`,
                    evidence: {
                        ipCountry,
                        declaredRegion: env.declaredRegion,
                        ipCity: env.ipGeo.city,
                    },
                };
            }
        }

        // If we have device-level geo, cross-check with streaming session
        if (device.geo && device.geo.country && ipCountry) {
            if (device.geo.country.toUpperCase() !== ipCountry) {
                return {
                    signal: CTVSpoofSignal.GEO_ANOMALY,
                    severity: 45,
                    description: `Device geo country "${device.geo.country}" differs from streaming IP country "${ipCountry}"`,
                    evidence: {
                        deviceCountry: device.geo.country,
                        ipCountry,
                    },
                };
            }
        }

        return null;
    }

    /**
     * Check if video bitrate is within plausible range.
     */
    private checkBitrate(env: StreamingEnvironment): CTVSignalDetail | null {
        if (env.bitrate === undefined) {
            return null;
        }

        if (env.bitrate < this.config.minBitrateKbps || env.bitrate > this.config.maxBitrateKbps) {
            return {
                signal: CTVSpoofSignal.SESSION_ANOMALY,
                severity: 30,
                description: `Video bitrate ${env.bitrate}kbps outside plausible range [${this.config.minBitrateKbps}-${this.config.maxBitrateKbps}]`,
                evidence: {
                    bitrate: env.bitrate,
                    minPlausible: this.config.minBitrateKbps,
                    maxPlausible: this.config.maxBitrateKbps,
                },
            };
        }

        return null;
    }

    /**
     * Check for zero or negative session duration (bot/automation pattern).
     */
    private checkZeroDuration(env: StreamingEnvironment): CTVSignalDetail | null {
        if (env.duration <= 0) {
            return {
                signal: CTVSpoofSignal.SESSION_ANOMALY,
                severity: 70,
                description: `Session duration is ${env.duration}s — possible bot or automation pattern`,
                evidence: { duration: env.duration },
            };
        }
        return null;
    }
}
