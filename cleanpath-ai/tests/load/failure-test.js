import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

// Custom metrics for chaos testing
const failOpenSuccess = new Rate('fail_open_success');
const redisErrors = new Counter('redis_connection_errors');

/**
 * FAILURE TEST PLAN
 * Run this while manually stopping Docker containers:
 * 
 * 1. Normal Operation: Expect 200 OK
 * 2. Stop Redis: Expect 200 OK (Fail-Open)
 * 3. Stop Neo4j: Expect 200 OK (Graceful Degradation)
 * 4. Stop Postgres: Expect 200 OK (Async Audit Failure shouldn't block bid)
 */

export const options = {
    scenarios: {
        chaos_test: {
            executor: 'constant-vus',
            vus: 50,              // Steady load
            duration: '5m',       // Long enough to execute docker stop/start commands
        },
    },
    thresholds: {
        // Critical: Even during failure, we must respond with 200 (Allow or Block default)
        // We allow slightly higher latency during timeouts (e.g. 1000ms Redis timeout)
        http_req_failed: ['rate<0.01'],
    },
};

const PAYLOAD = {
    id: 'chaos-test',
    imp: [{ id: '1', banner: { w: 300, h: 250 }, bidfloor: 1.0 }],
    site: { domain: 'chaos-test.com', publisher: { id: 'pub-chaos' } },
    device: { ip: '1.2.3.4', ua: 'k6-chaos-agent' }
};

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'dev-api-key-change-in-production'
        },
        timeout: '2s' // Strict client timeout
    };

    const res = http.post('http://localhost:8000/api/decisions/process', JSON.stringify(PAYLOAD), params);

    // Primary assertion: Did the API survive?
    const isAlive = check(res, {
        'status is 200': (r) => r.status === 200,
        'responded in time': (r) => r.timings.duration < 1500, // Allow for Redis connection timeout (1s)
    });

    failOpenSuccess.add(isAlive);

    if (res.status === 500) {
        console.error(`CRITICAL FAILURE: 500 Internal Server Error. Body: ${res.body}`);
    }

    sleep(0.5);
}
