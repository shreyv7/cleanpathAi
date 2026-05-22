export declare enum DeviceType {
    MOBILE = "mobile",
    DESKTOP = "desktop",
    TABLET = "tablet",
    CTV = "ctv",
    UNKNOWN = "unknown"
}
export declare enum AdFormat {
    BANNER = "banner",
    NATIVE = "native",
    VIDEO = "video",
    INTERSTITIAL = "interstitial"
}
export declare enum AdPosition {
    ABOVE_FOLD = "above_fold",
    BELOW_FOLD = "below_fold",
    SIDEBAR = "sidebar",
    FOOTER = "footer",
    HEADER = "header"
}
export interface Device {
    type: DeviceType;
    ua: string;
    ip: string;
    geo?: {
        country: string;
        region?: string;
        city?: string;
    };
    deviceId?: string;
    os?: string;
    osVersion?: string;
}
export interface Impression {
    id: string;
    format: AdFormat;
    position: AdPosition;
    width: number;
    height: number;
    bidFloor?: number;
    secure: boolean;
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
    page: string;
    publisher: Publisher;
    mobile: boolean;
}
export interface User {
    id?: string;
    buyerUid?: string;
}
export interface BidRequest {
    id: string;
    timestamp: number;
    impressions: Impression[];
    site: Site;
    device: Device;
    user?: User;
    test?: boolean;
    timeout?: number;
    metadata?: Record<string, unknown>;
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
//# sourceMappingURL=BidRequest.d.ts.map