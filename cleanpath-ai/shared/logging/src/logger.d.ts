import { LoggerConfig, LogContext } from './types';
export declare class Logger {
    private logger;
    private context;
    private config;
    constructor(config: LoggerConfig, initialContext?: LogContext);
    child(context: LogContext): Logger;
    setContext(context: LogContext): void;
    getContext(): LogContext;
    clearContext(): void;
    trace(message: string, data?: Record<string, unknown>): void;
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
    performance(message: string, durationMs: number, data?: Record<string, unknown>): void;
    flush(): Promise<void>;
}
export declare function createLogger(config: LoggerConfig, context?: LogContext): Logger;
//# sourceMappingURL=logger.d.ts.map