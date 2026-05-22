
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000/bid';
const REQUESTS_COUNT = 1000;
const FIXTURE_PATH = path.join(__dirname, '../../tests/fixtures/bid-requests.json');

async function runLatencyTest() {
    console.log(`Starting latency test against ${TARGET_URL}...`);

    if (!fs.existsSync(FIXTURE_PATH)) {
        console.error('Fixture file not found. Run Task 5.1 first.');
        process.exit(1);
    }

    const bidRequests = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
    const latencies: number[] = [];

    for (let i = 0; i < REQUESTS_COUNT; i++) {
        const request = bidRequests[Math.floor(Math.random() * bidRequests.length)];
        const start = performance.now();
        try {
            await axios.post(TARGET_URL, request, {
                headers: { 'x-api-key': 'test-api-key' }
            });
            const end = performance.now();
            latencies.push(end - start);
        } catch (e: any) {
            console.error(`Request failed: ${e.message}`);
        }
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(latencies.length * 0.5)];
    const p95 = latencies[Math.floor(latencies.length * 0.95)];
    const p99 = latencies[Math.floor(latencies.length * 0.99)];
    const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log('--- Latency Results ---');
    console.log(`Average: ${avg.toFixed(2)}ms`);
    console.log(`P50:     ${p50.toFixed(2)}ms`);
    console.log(`P95:     ${p95.toFixed(2)}ms`);
    console.log(`P99:     ${p99.toFixed(2)}ms`);
    console.log('-----------------------');

    if (p99 > 30) {
        console.warn('WARNING: P99 latency exceeds 30ms target!');
    } else {
        console.log('SUCCESS: P99 latency is within 30ms target.');
    }
}

runLatencyTest().catch(console.error);
