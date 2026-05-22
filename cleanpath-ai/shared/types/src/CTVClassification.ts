/**
 * CTV Spoof Classification Types
 * Detection results and signal taxonomy for CTV device integrity validation
 */

import { CTVDeviceFingerprint } from './CTVDevice';

/**
 * Enumeration of spoof signal types detected by the CTV validation pipeline.
 * Each signal represents a specific category of integrity violation.
 */
export enum CTVSpoofSignal {
    /** Mobile emulator or virtual machine detected posing as CTV */
    EMULATOR_DETECTED = 'emulator_detected',
    /** App bundle ID doesn't match known store listing or allowlist */
    BUNDLE_MISMATCH = 'bundle_mismatch',
    /** IP geolocation inconsistent with declared region */
    GEO_ANOMALY = 'geo_anomaly',
    /** Device attributes changed unexpectedly for the same IFA */
    DEVICE_ATTRIBUTE_CHANGE = 'device_attribute_change',
    /** Streaming session metadata is implausible */
    SESSION_ANOMALY = 'session_anomaly',
    /** User-Agent string inconsistent with declared device type */
    UA_INCONSISTENCY = 'ua_inconsistency',
    /** OS version outside known firmware range for device family */
    OS_MISMATCH = 'os_mismatch',
    /** Screen resolution doesn't match expected values for device */
    RESOLUTION_MISMATCH = 'resolution_mismatch',
    /** Bundle-to-store URL mismatch */
    STORE_URL_MISMATCH = 'store_url_mismatch',
    /** Excessive concurrent sessions from same IFA */
    CONCURRENT_SESSION_ABUSE = 'concurrent_session_abuse',
}

/**
 * Spoof verdict — overall classification of the CTV request integrity.
 */
export enum CTVSpoofVerdict {
    /** Device passes all integrity checks */
    CLEAN = 'clean',
    /** Some signals raised but below block threshold */
    SUSPICIOUS = 'suspicious',
    /** Strong evidence of spoofing — should be blocked */
    SPOOFED = 'spoofed',
}

/**
 * Individual signal detail — one specific integrity check result.
 */
export interface CTVSignalDetail {
    /** Which signal was triggered */
    signal: CTVSpoofSignal;
    /** Severity score for this signal (0-100) */
    severity: number;
    /** Human-readable description of the finding */
    description: string;
    /** Raw evidence data */
    evidence?: Record<string, unknown>;
}

/**
 * Consolidated CTV spoof detection result — output of the CTV Spoof Guard.
 */
export interface CTVSpoofResult {
    /** Overall verdict */
    verdict: CTVSpoofVerdict;
    /** Aggregate device risk score (0-100) */
    deviceRiskScore: number;
    /** Individual signals detected */
    signals: CTVSignalDetail[];
    /** Confidence in the verdict (0.0-1.0) */
    confidence: number;
    /** Total processing time for CTV evaluation in ms */
    processingTimeMs: number;
    /** Device fingerprint snapshot at time of evaluation */
    deviceFingerprint?: CTVDeviceFingerprint;
    /** IFA of the evaluated device */
    ifa?: string;
}

/**
 * Reusable validation result shape for individual CTV validators
 * (app bundle validator, device checker, stream validator).
 */
export interface CTVValidationResult {
    /** Whether validation passed */
    passed: boolean;
    /** Signals detected during this validation step */
    signals: CTVSignalDetail[];
    /** Risk score contribution from this validator (0-100) */
    riskScore: number;
    /** Validator processing time in ms */
    processingTimeMs: number;
}
