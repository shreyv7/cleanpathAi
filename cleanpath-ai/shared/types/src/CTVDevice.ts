/**
 * CTV Device Fingerprint Types
 * Device integrity and streaming environment metadata for CTV spoof detection
 */

/**
 * CTV device fingerprint — attributes reported by the CTV device or
 * inferred from the bid request that identify the physical hardware.
 */
export interface CTVDeviceFingerprint {
    /** Device manufacturer (e.g. "Roku", "Amazon", "Samsung") */
    make: string;
    /** Device model identifier (e.g. "Roku Ultra 2022", "Fire TV Stick 4K") */
    model: string;
    /** Identifier for Advertising — persistent per-device ad ID */
    ifa: string;
    /** Operating system name (e.g. "Roku OS", "Fire OS", "Tizen") */
    os: string;
    /** OS version string (e.g. "12.0", "7.6.1.4") */
    osVersion: string;
    /** Firmware version reported by device */
    firmwareVersion?: string;
    /** Screen resolution as "WIDTHxHEIGHT" (e.g. "3840x2160") */
    screenResolution?: string;
    /** HDCP (High-bandwidth Digital Content Protection) support level */
    hdcp?: string;
    /** Whether hardware DRM is supported */
    hardwareDrm?: boolean;
    /** Device connection type ("ethernet" | "wifi" | "unknown") */
    connectionType?: 'ethernet' | 'wifi' | 'unknown';
}

/**
 * CTV app bundle metadata — describes the streaming application making
 * the ad request. Used for allowlist validation and bundle-to-store consistency checks.
 */
export interface CTVAppBundle {
    /** Unique bundle identifier (e.g. "com.roku.nbc", "com.hulu.plus") */
    bundleId: string;
    /** Human-readable app name */
    name: string;
    /** App store URL for verification */
    storeUrl?: string;
    /** Application version string */
    version?: string;
    /** Device types this app is expected to run on */
    expectedDeviceTypes?: string[];
    /** Publisher or developer of the app */
    publisher?: string;
}

/**
 * Streaming environment metadata — describes the active streaming session,
 * used for detecting emulator patterns and impossible session states.
 */
export interface StreamingEnvironment {
    /** Unique session identifier */
    sessionId: string;
    /** Session duration in seconds at time of ad request */
    duration: number;
    /** Number of concurrent active sessions for this IFA */
    concurrentSessions?: number;
    /** IP-derived geolocation */
    ipGeo?: {
        country: string;
        region?: string;
        city?: string;
        lat?: number;
        lon?: number;
    };
    /** Region declared by the app/SDK */
    declaredRegion?: string;
    /** Streaming protocol (e.g. "SSAI", "CSAI", "DAI") */
    protocol?: string;
    /** Current video bitrate in kbps */
    bitrate?: number;
    /** Whether the stream is live (true) or VOD (false) */
    isLive?: boolean;
    /** Content genre or category */
    contentGenre?: string;
}

/**
 * Known CTV firmware version ranges per manufacturer.
 * Used for validating whether a reported OS version falls within plausible ranges.
 */
export interface CTVFirmwareRange {
    make: string;
    os: string;
    minVersion: string;
    maxVersion: string;
    /** Expected screen resolutions for this device family */
    expectedResolutions: string[];
}
