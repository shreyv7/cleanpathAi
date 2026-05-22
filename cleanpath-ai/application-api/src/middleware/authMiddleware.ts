import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include clientId
declare global {
    namespace Express {
        interface Request {
            clientId?: string;
        }
    }
}

const DEFAULT_DEV_KEYS = [
    'dev-api-key-change-in-production',
    'dashboard-key-001'
];

/**
 * Authentication Middleware for Application API
 * Protects routes by validating X-API-Key or Authorization Bearer tokens.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const authEnabled = process.env.AUTH_ENABLED !== 'false';
    if (!authEnabled) {
        req.clientId = 'auth-disabled';
        return next();
    }

    // CORS preflight requests should always bypass auth
    if (req.method === 'OPTIONS') {
        return next();
    }

    // Exempt paths
    const publicPaths = ['/health', '/api/health'];
    if (publicPaths.includes(req.path)) {
        req.clientId = 'public';
        return next();
    }

    // Bypass/Exempt internal decision recording path with standard internal key verification
    if (req.path === '/api/financial/record-decision') {
        const internalKey = req.headers['x-internal-service-key'] || req.headers['x-api-key'];
        const configuredInternalKey = process.env.INTERNAL_SERVICE_KEY || 'internal-service-edge-to-api-secret-key-123';
        
        if (internalKey === configuredInternalKey) {
            req.clientId = 'edge-gatekeeper-service';
            return next();
        }

        res.status(401).json({ error: 'Unauthorized: Invalid internal service credential' });
        return;
    }

    // Extract API Key
    let apiKey: string | undefined;

    // 1. Check X-API-Key header
    const headerKey = req.headers['x-api-key'];
    if (headerKey) {
        apiKey = Array.isArray(headerKey) ? headerKey[0] : headerKey;
    }

    // 2. Check Authorization: Bearer <key> header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        apiKey = authHeader.substring(7);
    }

    if (!apiKey) {
        res.status(401).json({ error: 'Unauthorized: Missing API Key' });
        return;
    }

    // Resolve configured API keys
    const configuredKeysEnv = process.env.API_KEYS;
    const allowedKeys = configuredKeysEnv
        ? configuredKeysEnv.split(',').map(k => k.trim())
        : DEFAULT_DEV_KEYS;

    // Validate key
    if (!allowedKeys.includes(apiKey)) {
        res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
        return;
    }

    // Extract Client ID from key (e.g. "dashboard-key-001" -> "dashboard")
    const clientId = apiKey.split('-')[0] || 'client';
    req.clientId = clientId;

    next();
}
