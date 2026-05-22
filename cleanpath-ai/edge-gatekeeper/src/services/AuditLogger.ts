
import axios from 'axios';
import { EdgeDecision } from '@cleanpath/types';
import { Logger } from '@cleanpath/logging';

export interface AuditLoggerConfig {
    apiUrl: string;
    enabled: boolean;
    timeoutMs: number;
}

export class AuditLogger {
    private config: AuditLoggerConfig;
    private logger: Logger;

    constructor(config: AuditLoggerConfig, logger: Logger) {
        this.config = config;
        this.logger = logger;
    }

    /**
     * Record a decision to the audit API
     * Fire-and-forget style to avoid blocking the bid response
     */
    async recordDecision(decision: EdgeDecision): Promise<void> {
        if (!this.config.enabled) return;

        const payload = {
            request_id: decision.requestId,
            publisher_id: decision.metadata.publisherId,
            domain: decision.metadata.domain,
            decision: decision.decision,
            thermal_score: decision.metadata.thermalScore,
            risk_level: decision.metadata.riskLevel,
            latency_ms: decision.processingTimeMs,
            block_reason: decision.blockReason,
            signals: decision.metadata.signals || []
        };

        // Attempt to send, but don't await the actual network call in a way that blocks
        // In a real Lambda, we might use background execution or Kinesis
        this.send(payload).catch(err => {
            this.logger.error('Failed to record decision to audit API', err, {
                requestId: decision.requestId
            });
        });
    }

    private async send(payload: any): Promise<void> {
        const headers: Record<string, string> = {};
        const internalKey = process.env.INTERNAL_SERVICE_KEY || 'internal-service-edge-to-api-secret-key-123';
        headers['X-Internal-Service-Key'] = internalKey;

        await axios.post(`${this.config.apiUrl}/decisions`, payload, {
            timeout: this.config.timeoutMs,
            headers
        });
    }

    /**
     * Generic log for arbitrary events
     */
    async log(eventName: string, data: any): Promise<void> {
        if (!this.config.enabled) return;

        const payload = {
            event: eventName,
            timestamp: Date.now(),
            data
        };

        this.send(payload).catch(err => {
            this.logger.error(`Failed to log event ${eventName}`, err);
        });
    }
}
