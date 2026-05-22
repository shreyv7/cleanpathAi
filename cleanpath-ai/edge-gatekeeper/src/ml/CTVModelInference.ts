import { Logger } from '@cleanpath/logging';
import { CTVFeatureVector } from '@cleanpath/types';

export class CTVModelInference {
    private logger: Logger;
    private mlServiceUrl: string;

    constructor(_modelPath: string, logger: Logger) {
        // _modelPath is kept in the constructor signature for backward compatibility
        // but we now rely on the ML_SERVICE_URL environment variable for remote inference.
        this.logger = logger;
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001/predict';
        this.logger.info(`CTV ML Inference initialized. Targeting ML Service at: ${this.mlServiceUrl}`);
    }

    /**
     * Run inference on the feature vector via the remote ML Python service.
     * Returns probability of spoof (0.0 to 1.0).
     * If the service is down or times out, fails open (returns -1).
     */
    async predict(features: CTVFeatureVector): Promise<number> {
        try {
            // We use AbortController to implement a strict timeout (e.g. 50ms)
            // to ensure ML inference never blocks real-time bidding for too long.
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 50);

            const response = await fetch(this.mlServiceUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(features),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                this.logger.warn(`ML Service returned HTTP ${response.status}: ${response.statusText}`);
                return -1;
            }

            const data: any = await response.json();
            
            // Expected response format from the Python FastAPI service:
            // { spoof_probability: 0.99, label: 1, inference_time_ms: 1.5, ... }
            if (typeof data.spoof_probability === 'number') {
                return data.spoof_probability;
            }
            
            return -1; // Fallback if response format is unexpected
            
        } catch (err: any) {
            if (err.name === 'AbortError') {
                this.logger.warn('CTV ML Inference timed out (>50ms). Failing open.');
            } else {
                this.logger.error('Error connecting to remote CTV ML Service', err);
            }
            return -1;
        }
    }
}
