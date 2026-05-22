export declare function redactEmail(text: string): string;
export declare function redactPhone(text: string): string;
export declare function redactIP(text: string): string;
export declare function redactCreditCard(text: string): string;
export declare function redactSSN(text: string): string;
export declare function sanitizePII(text: string): string;
export declare function sanitizeObject<T extends Record<string, unknown>>(obj: T): T;
export declare function maskSensitiveFields<T extends Record<string, unknown>>(obj: T, sensitiveFields?: string[]): T;
//# sourceMappingURL=sanitize.d.ts.map