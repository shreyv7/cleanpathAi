/**
 * Authentication Middleware
 * API key validation for edge requests
 */

import { Logger } from '@cleanpath/logging';

export interface AuthConfig {
    apiKeys: Set<string>;
    headerName: string;
    enabled: boolean;
}

export interface AuthResult {
    authenticated: boolean;
    clientId?: string;
    error?: string;
}

export class AuthMiddleware {
    private config: AuthConfig;
    private logger?: Logger;

    constructor(config: AuthConfig, logger?: Logger) {
        this.config = config;
        this.logger = logger;
    }

    /**
     * Validate API key from headers
     */
    authenticate(headers: Record<string, string | string[] | undefined>): AuthResult {
        if (!this.config.enabled) {
            return { authenticated: true };
        }

        const apiKey = this.extractApiKey(headers);

        if (!apiKey) {
            this.logger?.warn('Missing API key', { headerName: this.config.headerName });
            return {
                authenticated: false,
                error: 'Missing API key',
            };
        }

        if (!this.config.apiKeys.has(apiKey)) {
            this.logger?.warn('Invalid API key', { apiKey: this.maskApiKey(apiKey) });
            return {
                authenticated: false,
                error: 'Invalid API key',
            };
        }

        // Extract client ID from API key (format: client_id.secret)
        const clientId = this.extractClientId(apiKey);

        this.logger?.debug('Authentication successful', { clientId });

        return {
            authenticated: true,
            clientId,
        };
    }

    /**
     * Extract API key from headers
     */
    private extractApiKey(
        headers: Record<string, string | string[] | undefined>
    ): string | undefined {
        const value = headers[this.config.headerName] || headers[this.config.headerName.toLowerCase()];

        if (Array.isArray(value)) {
            return value[0];
        }

        return value;
    }

    /**
     * Extract client ID from API key
     */
    private extractClientId(apiKey: string): string {
        const parts = apiKey.split('.');
        return parts[0] || 'unknown';
    }

    /**
     * Mask API key for logging
     */
    private maskApiKey(apiKey: string): string {
        if (apiKey.length <= 8) {
            return '***';
        }
        return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    }

    /**
     * Add API key
     */
    addApiKey(apiKey: string): void {
        this.config.apiKeys.add(apiKey);
        this.logger?.info('API key added', { clientId: this.extractClientId(apiKey) });
    }

    /**
     * Remove API key
     */
    removeApiKey(apiKey: string): void {
        this.config.apiKeys.delete(apiKey);
        this.logger?.info('API key removed', { clientId: this.extractClientId(apiKey) });
    }

    /**
     * Get active API key count
     */
    getApiKeyCount(): number {
        return this.config.apiKeys.size;
    }
}

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(
    apiKeys: string[] = [],
    headerName: string = 'X-API-Key',
    enabled: boolean = true,
    logger?: Logger
): AuthMiddleware {
    return new AuthMiddleware(
        {
            apiKeys: new Set(apiKeys),
            headerName,
            enabled,
        },
        logger
    );
}

/**
 * Default API keys for development
 */
export const DEV_API_KEYS = [
    'dev_client1.secret123',
    'dev_client2.secret456',
    'test_client.testsecret',
];
