import {
    BidRequest,
    CTVSpoofResult,
    CTVSpoofSignal,
    CTVFeatureVector,
} from '@cleanpath/types';
import { CachedDeviceEntry } from '../cache/CTVDeviceCache';

/**
 * CTV Feature Extractor
 * Transforms raw bid request signals and spoof detection results into
 * a structured numeric feature vector for ML models.
 */
export class CTVFeatureExtractor {
    /**
     * Extract features from a request context
     */
    extractFeatures(
        request: BidRequest,
        spoofResult: CTVSpoofResult,
        deviceHistory?: CachedDeviceEntry | null,
    ): CTVFeatureVector {
        const now = new Date();
        const device = request.device;
        const ctv = request.ctv || { ifa: '', deviceFingerprint: {} as any, streamingEnvironment: {} as any };
        const app = request.app || { bundleId: '', name: '' };
        const env = ctv.streamingEnvironment;

        // --- Traffic Features ---
        const feat_hour_of_day = now.getUTCHours();
        const feat_day_of_week = now.getUTCDay();
        // Request velocity not yet available in real-time context, default 0
        const feat_request_velocity = 0;

        // --- App Features ---
        // Find specific signals in the spoof result
        const signals = spoofResult.signals || [];
        const bundleAnomalySignal = signals.find(s => s.signal === CTVSpoofSignal.BUNDLE_MISMATCH);
        const storeUrlMismatchSignal = signals.find(s => s.signal === CTVSpoofSignal.STORE_URL_MISMATCH);

        // Calculate app risk score based on presence of app-related signals
        const feat_app_risk_score = (bundleAnomalySignal ? 50 : 0) + (storeUrlMismatchSignal ? 50 : 0);

        // "is_allowlisted" is inferred: if no BUNDLE_MISMATCH and app exists, likely allowlisted
        // ideally passed from Validator, but here approximated by absence of mismatch signal
        const feat_is_allowlisted = (app.bundleId && !bundleAnomalySignal) ? 1.0 : 0.0;

        const feat_store_url_match = storeUrlMismatchSignal ? 0.0 : 1.0;
        const feat_bundle_anomaly = bundleAnomalySignal ? 1.0 : 0.0;

        // --- Device Features ---
        const feat_device_risk_score = spoofResult.deviceRiskScore;
        const emulatorSignal = signals.find(s => s.signal === CTVSpoofSignal.EMULATOR_DETECTED);
        const feat_is_emulator = emulatorSignal ? 1.0 : 0.0;

        // Heuristic for generic make
        const make = (ctv.deviceFingerprint?.make || device.make || '').toLowerCase();
        const isGeneric = ['generic', 'unknown', 'android', 'linux'].includes(make);
        const feat_is_generic_make = isGeneric ? 1.0 : 0.0;

        // Parse OS major version
        const osVer = ctv.deviceFingerprint?.osVersion || device.osVersion || '0';
        const feat_os_major_version = parseFloat(osVer.split('.')[0]) || 0;

        const feat_screen_width = device?.w || 0;
        const feat_screen_height = device?.h || 0;

        // --- Session Features ---
        const feat_session_duration = env?.duration || 0;
        const feat_concurrent_sessions = env?.concurrentSessions || 0;
        const feat_bitrate = env?.bitrate || 0;

        const geoSignal = signals.find(s => s.signal === CTVSpoofSignal.GEO_ANOMALY);
        const feat_geo_mismatch = geoSignal ? 1.0 : 0.0;

        const protocol = (env?.protocol || '').toLowerCase();
        const feat_is_ssai = (protocol.includes('ssai') || protocol.includes('server')) ? 1.0 : 0.0;

        // --- History Features ---
        const feat_mutation_count = deviceHistory ? deviceHistory.mutationCount : 0;

        let feat_days_since_first_seen = 0;
        if (deviceHistory && deviceHistory.firstSeen) {
            const msDiff = now.getTime() - deviceHistory.firstSeen;
            feat_days_since_first_seen = Math.max(0, Math.floor(msDiff / (1000 * 60 * 60 * 24)));
        }

        const feat_historical_risk = deviceHistory ? deviceHistory.riskScore : 0;
        // Known bad list feature reserved for future external blocklist integration
        const feat_known_bad_list = 0.0;

        return {
            feat_hour_of_day,
            feat_day_of_week,
            feat_request_velocity,
            feat_app_risk_score,
            feat_is_allowlisted,
            feat_store_url_match,
            feat_bundle_anomaly,
            feat_device_risk_score,
            feat_is_emulator,
            feat_is_generic_make,
            feat_os_major_version,
            feat_screen_width,
            feat_screen_height,
            feat_session_duration,
            feat_concurrent_sessions,
            feat_bitrate,
            feat_geo_mismatch,
            feat_is_ssai,
            feat_mutation_count,
            feat_days_since_first_seen,
            feat_historical_risk,
            feat_known_bad_list,
        };
    }
}
