/**
 * OpenRTB-like Bid Request Structure
 * Simplified for MVP - focuses on display ads and CTV
 */

import { CTVDeviceFingerprint, StreamingEnvironment } from './CTVDevice';
import { SupplyChainPath } from './SupplyPath';

export enum DeviceType {
    MOBILE = 'mobile',
    DESKTOP = 'desktop',
    TABLET = 'tablet',
    CTV = 'ctv',
    UNKNOWN = 'unknown',
}

export enum AdFormat {
    BANNER = 'banner',
    NATIVE = 'native',
    VIDEO = 'video',
    INTERSTITIAL = 'interstitial',
}

export enum AdPosition {
    ABOVE_FOLD = 'above_fold',
    BELOW_FOLD = 'below_fold',
    SIDEBAR = 'sidebar',
    FOOTER = 'footer',
    HEADER = 'header',
}

export interface Device {
    type: DeviceType;
    ua: string; // User agent
    ip: string;
    geo?: {
        country: string;
        region?: string;
        city?: string;
    };
    deviceId?: string;
    make?: string;
    model?: string;
    os?: string;
    osVersion?: string;
    /** Screen width in pixels */
    w?: number;
    /** Screen height in pixels */
    h?: number;
    /** Physical pixel ratio */
    pxratio?: number;
}

export interface Impression {
    id: string;
    format: AdFormat;
    position: AdPosition;
    width: number;
    height: number;
    bidFloor?: number; // Minimum bid price
    secure: boolean; // HTTPS required
}

export interface Publisher {
    id: string;
    name: string;
    domain: string;
    categories?: string[];
}

export interface Site {
    id: string;
    name: string;
    domain: string;
    page: string; // Full URL
    publisher: Publisher;
    mobile: boolean;
}

export interface User {
    id?: string; // Anonymized user ID
    buyerUid?: string; // Buyer-specific user ID
}

/**
 * CTV App metadata — describes the streaming application
 * making the ad request in CTV environments.
 */
export interface CTVApp {
    /** App bundle identifier (e.g. "com.roku.nbc") */
    bundleId: string;
    /** Human-readable app name */
    name: string;
    /** App store URL for validation */
    storeUrl?: string;
    /** Application version */
    version?: string;
    /** Publisher domain of the app */
    domain?: string;
}

/**
 * CTV context — device fingerprint and streaming session
 * data specific to Connected TV bid requests.
 */
export interface CTVContext {
    /** CTV device fingerprint attributes */
    deviceFingerprint: CTVDeviceFingerprint;
    /** Active streaming session metadata */
    streamingEnvironment?: StreamingEnvironment;
    /** Identifier for Advertising (top-level convenience) */
    ifa: string;
    /** Number of ad breaks seen this session */
    sessionDepth?: number;
}

export interface BidRequest {
    id: string; // Unique request ID
    timestamp: number; // Unix timestamp in milliseconds
    impressions: Impression[];
    site: Site;
    device: Device;
    user?: User;
    test?: boolean; // Test mode flag
    timeout?: number; // Max response time in ms
    metadata?: Record<string, unknown>; // Additional metadata
    /** CTV app metadata — present only for CTV inventory */
    app?: CTVApp;
    /** CTV-specific context — device fingerprint and streaming env */
    ctv?: CTVContext;
    /** OpenRTB SupplyChain object describing the path this request took */
    schain?: SupplyChainPath;
}

export interface BidRequestValidationError {
    field: string;
    message: string;
    code: string;
}

export interface BidRequestValidationResult {
    valid: boolean;
    errors: BidRequestValidationError[];
}

