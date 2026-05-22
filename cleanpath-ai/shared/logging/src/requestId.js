"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRequestId = generateRequestId;
exports.generateTraceId = generateTraceId;
exports.generateSpanId = generateSpanId;
exports.extractRequestId = extractRequestId;
exports.extractTraceId = extractTraceId;
exports.createCorrelationContext = createCorrelationContext;
const crypto_1 = require("crypto");
function generateRequestId() {
    const timestamp = Date.now().toString(36);
    const random = (0, crypto_1.randomBytes)(8).toString('hex');
    return `req_${timestamp}_${random}`;
}
function generateTraceId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
function generateSpanId() {
    return (0, crypto_1.randomBytes)(8).toString('hex');
}
function extractRequestId(headers) {
    const requestId = headers['x-request-id'] || headers['X-Request-ID'];
    return Array.isArray(requestId) ? requestId[0] : requestId;
}
function extractTraceId(headers) {
    const traceId = headers['x-trace-id'] || headers['X-Trace-ID'];
    return Array.isArray(traceId) ? traceId[0] : traceId;
}
function createCorrelationContext(headers) {
    return {
        requestId: extractRequestId(headers) || generateRequestId(),
        traceId: extractTraceId(headers) || generateTraceId(),
        spanId: generateSpanId(),
    };
}
//# sourceMappingURL=requestId.js.map