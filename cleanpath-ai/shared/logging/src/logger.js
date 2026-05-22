"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
exports.createLogger = createLogger;
const pino_1 = __importDefault(require("pino"));
class Logger {
    logger;
    context;
    config;
    constructor(config, initialContext = {}) {
        this.config = config;
        this.context = initialContext;
        this.logger = (0, pino_1.default)({
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
    child(context) {
        const childLogger = new Logger(this.config, {
            ...this.context,
            ...context,
        });
        childLogger.logger = this.logger.child(context);
        return childLogger;
    }
    setContext(context) {
        this.context = { ...this.context, ...context };
    }
    getContext() {
        return { ...this.context };
    }
    clearContext() {
        this.context = {};
    }
    trace(message, data) {
        this.logger.trace({ ...this.context, ...data }, message);
    }
    debug(message, data) {
        this.logger.debug({ ...this.context, ...data }, message);
    }
    info(message, data) {
        this.logger.info({ ...this.context, ...data }, message);
    }
    warn(message, data) {
        this.logger.warn({ ...this.context, ...data }, message);
    }
    error(message, error, data) {
        const errorData = error instanceof Error
            ? {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                },
            }
            : { error };
        this.logger.error({ ...this.context, ...errorData, ...data }, message);
    }
    fatal(message, error, data) {
        const errorData = error instanceof Error
            ? {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                },
            }
            : { error };
        this.logger.fatal({ ...this.context, ...errorData, ...data }, message);
    }
    performance(message, durationMs, data) {
        const memoryUsage = process.memoryUsage();
        this.logger.info({
            ...this.context,
            ...data,
            performance: {
                durationMs,
                memoryUsageMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            },
        }, message);
    }
    async flush() {
        return new Promise((resolve) => {
            this.logger.flush(() => resolve());
        });
    }
}
exports.Logger = Logger;
function createLogger(config, context) {
    return new Logger(config, context);
}
//# sourceMappingURL=logger.js.map