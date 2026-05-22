import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test Configuration
export const options = {
    stages: [
        { duration: '30s', target: 100 },   // Warm up: ramp to 100 users
        { duration: '1m', target: 500 },    // Sustained load: 500 users
        { duration: '2m', target: 2000 },   // Stress test: ramp to 2000 users
        { duration: '30s', target: 0 },     // Cooldown: ramp down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<20', 'p(99)<30'], // 99% of requests must complete below 30ms
        errors: ['rate<0.01'],                       // Error rate must be less than 1%
    },
};

// Realistic Bid Request Payload
const BID_REQUEST_TEMPLATE = {
    id: 'k6-test-req',
    imp: [{
        id: '1',
        banner: { w: 300, h: 250 },
        bidfloor: 0.5
    }],
    site: {
        id: 'site123',
        domain: 'example.com',
        publisher: { id: 'pub123', domain: 'publisher.com' }
    },
    device: {
        ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) k6-load-test',
        ip: '127.0.0.1',
        geo: { country: 'US' }
    },
    user: { id: 'user123' },
    at: 1,
    tmax: 500
};

export default function () {
    // Generate unique request ID per iteration
    const payload = JSON.parse(JSON.stringify(BID_REQUEST_TEMPLATE));
    payload.id = `req-${__VU}-${__ITER}-${Date.now()}`;

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Key': 'dev-api-key-change-in-production', // Matches .env default
    };

    const res = http.post('http://localhost:8000/api/decisions/process', JSON.stringify(payload), { headers });

    const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'latency < 30ms': (r) => r.timings.duration < 30,
    });

    if (!success) {
        errorRate.add(1);
    }

    // Simulate realistic user pacing (think time)
    sleep(0.1); // Short sleep for high-throughput service simulation
}
