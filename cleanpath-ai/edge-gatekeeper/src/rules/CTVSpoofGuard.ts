/**
 * CTV Spoof Guard Orchestrator
 * Runs all CTV validators and produces a consolidated CTVSpoofResult
 * with weighted scoring based on individual validator outputs.
 */

import {
    BidRequest,
    CTVSpoofResult,
    CTVSpoofVerdict,
    CTVSignalDetail,
    DeviceType,
} from '@cleanpath/types';
import { CTVAppValidator } from './CTVAppValidator';
import { CTVDeviceChecker } from './CTVDeviceChecker';
import { CTVStreamValidator } from './CTVStreamValidator';

/**
 * Weight configuration for combining validator scores.
 * Weights should sum to 1.0 for normalized scoring.
 */
export interface CTVSpoofGuardConfig {
    /** Weight for app bundle validation (default: 0.25) */
    appBundleWeight: number;
    /** Weight for device consistency check (default: 0.45) */
    deviceConsistencyWeight: number;
    /** Weight for streaming environment validation (default: 0.30) */
    streamingEnvWeight: number;
    /** Risk score threshold for "suspicious" verdict (default: 40) */
    suspiciousThreshold: number;
    /** Risk score threshold for "spoofed" verdict (default: 75) */
    spoofedThreshold: number;
}

const DEFAULT_CONFIG: CTVSpoofGuardConfig = {
    appBundleWeight: 0.25,
    deviceConsistencyWeight: 0.45,
    streamingEnvWeight: 0.30,
    suspiciousThreshold: 40,
    spoofedThreshold: 75,
};

export class CTVSpoofGuard {
    private appValidator: CTVAppValidator;
    private deviceChecker: CTVDeviceChecker;
    private streamValidator: CTVStreamValidator;
    private config: CTVSpoofGuardConfig;

    constructor(
        config?: Partial<CTVSpoofGuardConfig>,
        appValidator?: CTVAppValidator,
        deviceChecker?: CTVDeviceChecker,
        streamValidator?: CTVStreamValidator,
    ) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.appValidator = appValidator ?? new CTVAppValidator();
        this.deviceChecker = deviceChecker ?? new CTVDeviceChecker();
        this.streamValidator = streamValidator ?? new CTVStreamValidator();
    }

    /**
     * Evaluate a bid request for CTV spoof signals.
     * Only runs when the device type is CTV and CTV context is present.
     * Returns a consolidated CTVSpoofResult with weighted risk score.
     */
    public evaluate(request: BidRequest): CTVSpoofResult {
        const startTime = Date.now();
        const allSignals: CTVSignalDetail[] = [];

        // Guard: only evaluate CTV requests
        if (request.device.type !== DeviceType.CTV || !request.ctv) {
            return {
                verdict: CTVSpoofVerdict.CLEAN,
                deviceRiskScore: 0,
                signals: [],
                confidence: 1.0,
                processingTimeMs: Date.now() - startTime,
            };
        }

        const ctv = request.ctv;
        let weightedScore = 0;
        let totalWeight = 0;

        // 1. App Bundle Validation
        if (request.app) {
            const appResult = this.appValidator.validateAppBundle({
                bundleId: request.app.bundleId,
                name: request.app.name,
                storeUrl: request.app.storeUrl,
                version: request.app.version,
            });
            allSignals.push(...appResult.signals);
            weightedScore += appResult.riskScore * this.config.appBundleWeight;
            totalWeight += this.config.appBundleWeight;
        }

        // 2. Device Fingerprint Consistency
        if (ctv.deviceFingerprint) {
            const deviceResult = this.deviceChecker.checkDeviceConsistency(
                ctv.deviceFingerprint,
                request.device,
            );
            allSignals.push(...deviceResult.signals);
            weightedScore += deviceResult.riskScore * this.config.deviceConsistencyWeight;
            totalWeight += this.config.deviceConsistencyWeight;
        }

        // 3. Streaming Environment Validation
        if (ctv.streamingEnvironment) {
            const streamResult = this.streamValidator.validateStreamingEnv(
                ctv.streamingEnvironment,
                request.device,
            );
            allSignals.push(...streamResult.signals);
            weightedScore += streamResult.riskScore * this.config.streamingEnvWeight;
            totalWeight += this.config.streamingEnvWeight;
        }

        // Normalize weighted score if not all validators ran
        let deviceRiskScore = totalWeight > 0
            ? Math.round(weightedScore / totalWeight)
            : 0;

        // CRITICAL OVERRIDE: If any single signal indicates high certainty spoof (severity >= 90),
        // do not dilute it with other weights.
        const maxSignalSeverity = allSignals.reduce((max, s) => Math.max(max, s.severity), 0);
        if (maxSignalSeverity >= 90) {
            deviceRiskScore = Math.max(deviceRiskScore, maxSignalSeverity);
        }

        // Determine verdict based on thresholds
        const verdict = this.determineVerdict(deviceRiskScore);

        // Calculate confidence based on how many validators contributed
        const validatorCount = [request.app, ctv.deviceFingerprint, ctv.streamingEnvironment]
            .filter(Boolean).length;
        const confidence = validatorCount / 3;

        return {
            verdict,
            deviceRiskScore,
            signals: allSignals,
            confidence,
            processingTimeMs: Date.now() - startTime,
            deviceFingerprint: ctv.deviceFingerprint,
            ifa: ctv.ifa,
        };
    }

    /**
     * Determine the spoof verdict based on the aggregate risk score.
     */
    private determineVerdict(riskScore: number): CTVSpoofVerdict {
        if (riskScore >= this.config.spoofedThreshold) {
            return CTVSpoofVerdict.SPOOFED;
        }
        if (riskScore >= this.config.suspiciousThreshold) {
            return CTVSpoofVerdict.SUSPICIOUS;
        }
        return CTVSpoofVerdict.CLEAN;
    }

    /**
     * Get current configuration (for diagnostics/testing).
     */
    public getConfig(): CTVSpoofGuardConfig {
        return { ...this.config };
    }
}
