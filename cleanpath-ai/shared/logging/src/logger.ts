/**
 * Logger Implementation
 * Structured logging with Pino
 */

import pino, { Logger as PinoLogger } from 'pino';
import { LoggerConfig, LogContext } from './types';

export class Logger {
    private logger: PinoLogger;
    private context: LogContext;
    private config: LoggerConfig;

    constructor(config: LoggerConfig, initialContext: LogContext = {}) {
        this.config = config;
        this.context = initialContext;

        // Configure Pino logger
        this.logger = pino({
            level: config.level,
            base: {
                service: config.service,
                environment: config.environment,
            },
            timestamp: () => `,"timestamp":${Date.now()}`,
            formatters: {
                level: (label) => {
                    return { level: label };
                },
            },
            redact: {
                paths: config.redactPaths || [
                    'password',
                    'token',
                    'apiKey',
                    'secret',
                    'authorization',
                    'cookie',
                    'user.email',
                    'user.phone',
                    'device.ip',
                ],
                censor: '[REDACTED]',
            },
            transport: config.prettyPrint
                ? {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                    },
                }
                : undefined,
        });
    }

    /**
     * Create a child logger with additional context
     */
    child(context: LogContext): Logger {
        const childLogger = new Logger(this.config, {
            ...this.context,
            ...context,
        });
        childLogger.logger = this.logger.child(context);
        return childLogger;
    }

    /**
     * Set context for all subsequent logs
     */
    setContext(context: LogContext): void {
        this.context = { ...this.context, ...context };
    }

    /**
     * Get current context
     */
    getContext(): LogContext {
        return { ...this.context };
    }

    /**
     * Clear context
     */
    clearContext(): void {
        this.context = {};
    }

    /**
     * Trace level logging
     */
    trace(message: string, data?: Record<string, unknown>): void {
        this.logger.trace({ ...this.context, ...data }, message);
    }

    /**
     * Debug level logging
     */
    debug(message: string, data?: Record<string, unknown>): void {
        this.logger.debug({ ...this.context, ...data }, message);
    }

    /**
     * Info level logging
     */
    info(message: string, data?: Record<string, unknown>): void {
        this.logger.info({ ...this.context, ...data }, message);
    }

    /**
     * Warn level logging
     */
    warn(message: string, data?: Record<string, unknown>): void {
        this.logger.warn({ ...this.context, ...data }, message);
    }

    /**
     * Error level logging
     */
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
        const errorData = error instanceof Error
            ? {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: (error as any).code,
                },
            }
            : { error };

        this.logger.error({ ...this.context, ...errorData, ...data }, message);
    }

    /**
     * Fatal level logging
     */
    fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
        const errorData = error instanceof Error
            ? {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: (error as any).code,
                },
            }
            : { error };

        this.logger.fatal({ ...this.context, ...errorData, ...data }, message);
    }

    /**
     * Log with performance metrics
     */
    performance(
        message: string,
        durationMs: number,
        data?: Record<string, unknown>
    ): void {
        const memoryUsage = process.memoryUsage();
        this.logger.info(
            {
                ...this.context,
                ...data,
                performance: {
                    durationMs,
                    memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                },
            },
            message
        );
    }

    /**
     * Flush logs (useful for serverless environments)
     */
    async flush(): Promise<void> {
        return new Promise((resolve) => {
            this.logger.flush(() => resolve());
        });
    }
}

/**
 * Create a logger instance
 */
export function createLogger(config: LoggerConfig, context?: LogContext): Logger {
    return new Logger(config, context);
}
