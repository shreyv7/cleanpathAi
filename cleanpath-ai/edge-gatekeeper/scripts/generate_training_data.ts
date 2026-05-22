import * as fs from 'fs';
import * as path from 'path';
import {
    BidRequest,
    DeviceType,
    CTV_FEATURE_NAMES,
} from '@cleanpath/types';
import { CTVSpoofGuard } from '../src/rules/CTVSpoofGuard';
import { CTVAppValidator } from '../src/rules/CTVAppValidator';
import { CTVFeatureExtractor } from '../src/ml/CTVFeatureExtractor';
import { CTVDeviceCache } from '../src/cache/CTVDeviceCache';

// Configuration
const OUTPUT_FILE = path.resolve(__dirname, '../../data/ctv_training_data.csv');
const NUM_SAMPLES = 1000;
const SPOOF_RATIO = 0.3; // 30% spoofed traffic

// Initialize components
const allowlistPath = path.resolve(__dirname, '../data/ctv-app-allowlist.json');
const appValidator = new CTVAppValidator(allowlistPath);
const spoofGuard = new CTVSpoofGuard(undefined, appValidator);
const featureExtractor = new CTVFeatureExtractor();
// Mock cache for history features
const deviceCache = new CTVDeviceCache();

// Helper to generate random int
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate clean request
function generateCleanRequest(id: string): BidRequest {
    return {
        id: `req-${id}`,
        timestamp: Date.now(),
        impressions: [],
        site: {} as any,
        device: {
            type: DeviceType.CTV,
            ua: 'Roku/DVP-12.0 (12.0.0.1234)',
            ip: '192.168.1.1',
            make: 'Roku',
            model: 'Streaming Stick 4K',
            osVersion: '12.0',
            w: 1920,
            h: 1080,
        },
        app: {
            bundleId: 'com.hulu.plus',
            name: 'Hulu',
            storeUrl: 'https://channelstore.roku.com/details/hulu',
        },
        ctv: {
            ifa: `ifa-clean-${randomInt(1, 100)}`,
            deviceFingerprint: {
                make: 'Roku',
                model: 'Streaming Stick 4K',
                os: 'Roku OS',
                osVersion: '12.0',
                ifa: 'ifa-clean',
                screenResolution: '1920x1080',
            },
            streamingEnvironment: {
                sessionId: `sess-${id}`,
                duration: randomInt(60, 7200),
                concurrentSessions: 1,
                bitrate: randomInt(3000, 8000),
                protocol: 'HLS',
            },
        },
    };
}

// Helper to generate spoofed request
function generateSpoofedRequest(id: string): BidRequest {
    const spoofType = randomInt(1, 3);
    const req = generateCleanRequest(id);
    req.ctv!.ifa = `ifa-spoof-${randomInt(1, 100)}`;

    if (spoofType === 1) {
        // Emulator Spoof
        req.device.ua = 'Android SDK/30 emulator x86';
        req.ctv!.deviceFingerprint.osVersion = '30'; // Android version, unlikely for Roku
    } else if (spoofType === 2) {
        // App Bundling Spoof
        req.app!.bundleId = 'com.fake.app';
        req.app!.storeUrl = 'http://malicious.com';
        // Mismatch logic will catch this
    } else {
        // Session Anomaly
        req.ctv!.streamingEnvironment!.duration = 1; // Bot-like
        req.ctv!.streamingEnvironment!.concurrentSessions = 20;
    }

    return req;
}

async function main() {
    console.log(`Generating ${NUM_SAMPLES} samples (Spoof Ratio: ${SPOOF_RATIO})...`);

    // CSV Header
    const header = ['label', ...CTV_FEATURE_NAMES].join(',');
    const rows: string[] = [header];

    for (let i = 0; i < NUM_SAMPLES; i++) {
        const isSpoof = Math.random() < SPOOF_RATIO;
        const req = isSpoof ? generateSpoofedRequest(i.toString()) : generateCleanRequest(i.toString());

        // Run Spoof Guard
        const result = spoofGuard.evaluate(req);

        // Simulate history in cache
        let history = null;
        if (req.ctv?.ifa && req.ctv?.deviceFingerprint) {
            history = deviceCache.get(req.ctv.ifa);
            // Update cache for next time
            deviceCache.set(req.ctv.ifa, req.ctv.deviceFingerprint);
        }

        // Extract Features
        const features = featureExtractor.extractFeatures(req, result, history);

        // Prepare row
        // Label: 1 if SPOOFED or SUSPICIOUS (risk > 50), 0 otherwise
        // Ideally we use ground truth 'isSpoof', but for now let's use the verdict 
        // to verify the feature extraction aligns with the rules.
        // For TRAINING a new model, we should use the ground truth 'isSpoof'.
        const label = isSpoof ? 1 : 0;

        const values = CTV_FEATURE_NAMES.map(name => features[name]);
        rows.push([label, ...values].join(','));
    }

    // Ensure output directory exists
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, rows.join('\n'));
    console.log(`Successfully wrote training data to ${OUTPUT_FILE}`);
}

main().catch(err => console.error(err));
