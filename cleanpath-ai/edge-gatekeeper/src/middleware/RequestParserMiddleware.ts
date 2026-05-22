/**
 * Request Parser Middleware
 * Bid request normalization and enrichment
 */

import { BidRequest, DeviceType, AdFormat } from '@cleanpath/types';
import { Logger } from '@cleanpath/logging';

export interface ParseResult {
    success: boolean;
    bidRequest?: BidRequest;
    error?: string;
}

export class RequestParserMiddleware {
    private logger?: Logger;

    constructor(logger?: Logger) {
        this.logger = logger;
    }

    /**
     * Parse and normalize bid request
     */
    parse(rawBody: string | object): ParseResult {
        try {
            // Parse JSON if string
            const data = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

            // Validate basic structure
            if (!data || typeof data !== 'object') {
                return {
                    success: false,
                    error: 'Invalid request body',
                };
            }

            // Normalize bid request
            const bidRequest = this.normalizeBidRequest(data);

            this.logger?.debug('Bid request parsed successfully', {
                requestId: bidRequest.id,
                publisherId: bidRequest.site?.publisher?.id,
            });

            return {
                success: true,
                bidRequest,
            };
        } catch (error) {
            this.logger?.error('Failed to parse bid request', error);
            return {
                success: false,
                error: (error as Error).message,
            };
        }
    }

    /**
     * Normalize bid request to standard format
     */
    private normalizeBidRequest(data: any): BidRequest {
        return {
            id: data.id || this.generateRequestId(),
            timestamp: data.timestamp || Date.now(),
            impressions: this.normalizeImpressions(data.impressions || data.imp || []),
            site: this.normalizeSite(data.site),
            device: this.normalizeDevice(data.device),
            user: data.user,
            test: data.test || false,
            timeout: data.timeout || data.tmax,
            metadata: data.metadata || {},
        };
    }

    /**
     * Normalize impressions array
     */
    private normalizeImpressions(impressions: any[]): any[] {
        return impressions.map((imp, index) => ({
            id: imp.id || `imp_${index}`,
            format: this.normalizeAdFormat(imp.format || imp.banner ? 'banner' : 'native'),
            position: imp.position || imp.pos || 'unknown',
            width: imp.width || imp.w || 0,
            height: imp.height || imp.h || 0,
            bidFloor: imp.bidFloor || imp.bidfloor || imp.bidfloorcur || 0,
            secure: imp.secure !== undefined ? imp.secure : true,
        }));
    }

    /**
     * Normalize site object
     */
    private normalizeSite(site: any): any {
        if (!site) {
            throw new Error('Missing site information');
        }

        return {
            id: site.id,
            name: site.name,
            domain: site.domain,
            page: site.page || site.url,
            publisher: this.normalizePublisher(site.publisher || site.pub),
            mobile: site.mobile !== undefined ? site.mobile : false,
        };
    }

    /**
     * Normalize publisher object
     */
    private normalizePublisher(publisher: any): any {
        if (!publisher) {
            throw new Error('Missing publisher information');
        }

        return {
            id: publisher.id,
            name: publisher.name,
            domain: publisher.domain,
            categories: publisher.categories || publisher.cat || [],
        };
    }

    /**
     * Normalize device object
     */
    private normalizeDevice(device: any): any {
        if (!device) {
            throw new Error('Missing device information');
        }

        return {
            type: this.normalizeDeviceType(device.type || device.devicetype),
            ua: device.ua || device.userAgent || '',
            ip: device.ip || '',
            geo: device.geo,
            deviceId: device.deviceId || device.ifa || device.didsha1,
            os: device.os,
            osVersion: device.osVersion || device.osv,
        };
    }

    /**
     * Normalize device type
     */
    private normalizeDeviceType(type: any): DeviceType {
        if (typeof type === 'string') {
            const normalized = type.toLowerCase();
            if (normalized.includes('mobile') || normalized.includes('phone')) {
                return DeviceType.MOBILE;
            }
            if (normalized.includes('tablet')) {
                return DeviceType.TABLET;
            }
            if (normalized.includes('ctv') || normalized.includes('tv')) {
                return DeviceType.CTV;
            }
            if (normalized.includes('desktop') || normalized.includes('pc')) {
                return DeviceType.DESKTOP;
            }
        }

        // OpenRTB device type codes
        if (typeof type === 'number') {
            switch (type) {
                case 1:
                    return DeviceType.MOBILE;
                case 2:
                    return DeviceType.DESKTOP;
                case 4:
                    return DeviceType.TABLET;
                case 7:
                    return DeviceType.CTV;
                default:
                    return DeviceType.UNKNOWN;
            }
        }

        return DeviceType.UNKNOWN;
    }

    /**
     * Normalize ad format
     */
    private normalizeAdFormat(format: any): AdFormat {
        if (typeof format === 'string') {
            const normalized = format.toLowerCase();
            if (normalized.includes('banner')) {
                return AdFormat.BANNER;
            }
            if (normalized.includes('native')) {
                return AdFormat.NATIVE;
            }
            if (normalized.includes('video')) {
                return AdFormat.VIDEO;
            }
            if (normalized.includes('interstitial')) {
                return AdFormat.INTERSTITIAL;
            }
        }

        return AdFormat.BANNER; // Default
    }

    /**
     * Generate request ID
     */
    private generateRequestId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 10);
        return `req_${timestamp}_${random}`;
    }

    /**
     * Enrich bid request with additional data
     */
    enrich(bidRequest: BidRequest, enrichmentData: Record<string, any>): BidRequest {
        return {
            ...bidRequest,
            metadata: {
                ...bidRequest.metadata,
                ...enrichmentData,
            },
        };
    }
}

/**
 * Create request parser middleware
 */
export function createRequestParserMiddleware(logger?: Logger): RequestParserMiddleware {
    return new RequestParserMiddleware(logger);
}
