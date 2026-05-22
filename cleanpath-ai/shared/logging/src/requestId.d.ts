export declare function generateRequestId(): string;
export declare function generateTraceId(): string;
export declare function generateSpanId(): string;
export declare function extractRequestId(headers: Record<string, string | string[] | undefined>): string | undefined;
export declare function extractTraceId(headers: Record<string, string | string[] | undefined>): string | undefined;
export declare function createCorrelationContext(headers: Record<string, string | string[] | undefined>): {
    requestId: string;
    traceId: string;
    spanId: string;
};
//# sourceMappingURL=requestId.d.ts.map