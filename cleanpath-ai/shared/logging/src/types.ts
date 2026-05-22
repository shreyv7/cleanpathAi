/**
 * Logging Configuration Types
 */

export enum LogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal',
}

export interface LoggerConfig {
    level: LogLevel;
    service: string;
    environment: 'development' | 'staging' | 'production' | 'test';
    prettyPrint?: boolean;
    redactPaths?: string[]; // Paths to redact for PII compliance
}

export interface LogContext {
    requestId?: string;
    userId?: string;
    publisherId?: string;
    sessionId?: string;
    traceId?: string;
    spanId?: string;
    [key: string]: unknown;
}

export interface LogMetadata {
    timestamp: number;
    level: LogLevel;
    service: string;
    environment: string;
    context?: LogContext;
    error?: {
        name: string;
        message: string;
        stack?: string;
        code?: string;
    };
    performance?: {
        durationMs: number;
        memoryUsageMB?: number;
    };
}
