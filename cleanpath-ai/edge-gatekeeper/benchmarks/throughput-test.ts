
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000/bid';
const DURATION_SECONDS = 30;
const CONCURRENCY = 100;
const FIXTURE_PATH = path.join(__dirname, '../../tests/fixtures/bid-requests.json');

async function runThroughputTest() {
    console.log(`Starting throughput test against ${TARGET_URL}...`);
    console.log(`Config: ${CONCURRENCY} concurrent users, ${DURATION_SECONDS}s duration`);

    if (!fs.existsSync(FIXTURE_PATH)) {
        console.error('Fixture file not found. Run Task 5.1 first.');
        process.exit(1);
    }

    const bidRequests = JSON.parse(fs.readFileSync(FIXTURE_PATH, 'utf-8'));
    let totalRequests = 0;
    let successfulRequests = 0;
    const startTime = Date.now();
    const endTime = startTime + (DURATION_SECONDS * 1000);

    const worker = async () => {
        while (Date.now() < endTime) {
            const request = bidRequests[Math.floor(Math.random() * bidRequests.length)];
            totalRequests++;
            try {
                await axios.post(TARGET_URL, request, {
                    headers: { 'x-api-key': 'test-api-key' },
                    timeout: 1000
                });
                successfulRequests++;
            } catch (e) {
                // Suppress errors for throughput measurement
            }
        }
    };

    const workers = Array(CONCURRENCY).fill(null).map(() => worker());
    await Promise.all(workers);

    const totalTimeSeconds = (Date.now() - startTime) / 1000;
    const qps = successfulRequests / totalTimeSeconds;

    console.log('--- Throughput Results ---');
    console.log(`Total Requests:      ${totalRequests}`);
    console.log(`Successful:          ${successfulRequests}`);
    console.log(`Throughput (QPS):    ${qps.toFixed(2)}`);
    console.log(`Target QPS:          10000`);
    console.log('--------------------------');

    if (qps < 5000) {
        console.warn('WARNING: Current throughput is below 5k QPS target!');
    } else {
        console.log('SUCCESS: Throughput target achieved.');
    }
}

runThroughputTest().catch(console.error);
