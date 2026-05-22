
import axios from 'axios';
import { TrafficSimulator, TrafficScenario } from '../src/simulation/TrafficSimulator';
import { BidRequest } from '@cleanpath/types';

const TARGET_URL = 'http://localhost:4000/bid';
const CONCURRENCY = 50;
const DURATION_MS = 10000; // 10 seconds

async function runLoadTest() {
    console.log(`Starting Load Test`);
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Concurrency: ${CONCURRENCY}`);
    console.log(`Duration: ${DURATION_MS / 1000}s`);

    const simulator = new TrafficSimulator(TrafficScenario.MIXED_TRAFFIC);
    let active = true;

    // Metrics
    let totalRequests = 0;
    let successCount = 0;
    let errorCount = 0;
    const latencies: number[] = [];

    const startTime = Date.now();
    const endTime = startTime + DURATION_MS;

    const worker = async (id: number) => {
        while (active && Date.now() < endTime) {
            const request = simulator.generateRequest();
            const reqStart = Date.now();

            try {
                await axios.post(TARGET_URL, request, { timeout: 1000 });
                latencies.push(Date.now() - reqStart);
                successCount++;
            } catch (err) {
                errorCount++;
            }
            totalRequests++;

            // Small yield to allow event loop breathing
            if (totalRequests % 100 === 0) await new Promise(r => setImmediate(r));
        }
    };

    // Start workers
    const promises = Array(CONCURRENCY).fill(null).map((_, i) => worker(i));

    // Wait for duration
    await Promise.all(promises);
    active = false;

    // Report
    const totalTime = (Date.now() - startTime) / 1000;
    const qps = totalRequests / totalTime;

    latencies.sort((a, b) => a - b);
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;

    console.log('\n--- Load Test Results ---');
    console.log(`Duration:       ${totalTime.toFixed(2)}s`);
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful:     ${successCount}`);
    console.log(`Errors:         ${errorCount}`);
    console.log(`Throughput:     ${qps.toFixed(2)} req/sec`);
    console.log(`Avg Latency:    ${avgLatency.toFixed(2)}ms`);
    console.log(`P95 Latency:    ${p95}ms`);
    console.log('-------------------------');

    if (qps > 800 && errorCount === 0) {
        console.log('SUCCESS: High throughput and reliability achieved.');
    } else {
        console.warn('WARNING: Performance goals may not be met.');
    }
}

// Give server a moment to start if run consecutively
setTimeout(runLoadTest, 2000);
