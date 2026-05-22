/**
 * CTV ML Feature Schema
 *
 * Defines the structured numeric feature vector used for:
 * 1. Training the CTV Spoof Guard ML models (Gradient Boosted Trees / RL)
 * 2. Real-time inference in the edge pipeline
 *
 * All features must be numeric (float/int) for direct tensor conversion.
 * Categorical features should be pre-encoded or hashed if not explicitly enumerated.
 */

export interface CTVFeatureVector {
    // --- Traffic / Context Features (3) ---
    /** Hour of day (0-23) UTC */
    feat_hour_of_day: number;
    /** Day of week (0-6) UTC, 0=Sunday */
    feat_day_of_week: number;
    /** Requests per minute for this IFA (if available, else 0) */
    feat_request_velocity: number;

    // --- App Validation Features (4) ---
    /** App bundle risk score (0-100) from CTVAppValidator */
    feat_app_risk_score: number;
    /** 1.0 if allowlisted, 0.0 otherwise */
    feat_is_allowlisted: number;
    /** 1.0 if store URL matches bundle pattern, 0.0 otherwise */
    feat_store_url_match: number;
    /** 1.0 if bundle ID looks spoofed (e.g. "com.fake.hulu"), 0.0 otherwise */
    feat_bundle_anomaly: number;

    // --- Device Integrity Features (6) ---
    /** Device risk score (0-100) from CTVDeviceChecker */
    feat_device_risk_score: number;
    /** Emulator signal detected (1.0 or 0.0) */
    feat_is_emulator: number;
    /** Unknown/Generic device make (1.0 or 0.0) */
    feat_is_generic_make: number;
    /** OS version major number (e.g. 12 for "12.5") */
    feat_os_major_version: number;
    /** Screen width in pixels */
    feat_screen_width: number;
    /** Screen height in pixels */
    feat_screen_height: number;

    // --- Streaming Session Features (5) ---
    /** Session duration in seconds */
    feat_session_duration: number;
    /** Number of concurrent sessions for this IFA */
    feat_concurrent_sessions: number;
    /** Video bitrate in Kbps */
    feat_bitrate: number;
    /** 1.0 if geo-mismatch detected, 0.0 otherwise */
    feat_geo_mismatch: number;
    /** 1.0 if protocol is "SSAI", 0.0 otherwise */
    feat_is_ssai: number;

    // --- History / Behavior Features (4) ---
    /** Number of device attribute mutations observed */
    feat_mutation_count: number;
    /** Days since this IFA was first seen */
    feat_days_since_first_seen: number;
    /** Risk score from previous history (0-100) */
    feat_historical_risk: number;
    /** 1.0 if labeled as bad in known-bad lists (future use), 0.0 otherwise */
    feat_known_bad_list: number;
}

/**
 * Ordered list of feature names matching the vector for CSV headers
 */
export const CTV_FEATURE_NAMES: (keyof CTVFeatureVector)[] = [
    'feat_hour_of_day',
    'feat_day_of_week',
    'feat_request_velocity',
    'feat_app_risk_score',
    'feat_is_allowlisted',
    'feat_store_url_match',
    'feat_bundle_anomaly',
    'feat_device_risk_score',
    'feat_is_emulator',
    'feat_is_generic_make',
    'feat_os_major_version',
    'feat_screen_width',
    'feat_screen_height',
    'feat_session_duration',
    'feat_concurrent_sessions',
    'feat_bitrate',
    'feat_geo_mismatch',
    'feat_is_ssai',
    'feat_mutation_count',
    'feat_days_since_first_seen',
    'feat_historical_risk',
    'feat_known_bad_list',
];
