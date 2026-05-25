/**
 * CleanPath AI - DSP Pre-Bid Traffic Simulator
 * 
 * Simulates high-concurrency buy-side programmatic bid streams hitting the Edge Gatekeeper node.
 * Generates realistic allowed, shaded, and blocked logs inside the database.
 * 
 * Usage: node scripts/simulate-dsp-traffic.js [--once] [--interval=1000]
 */

const http = require('http');

const PORT = process.env.GATEKEEPER_PORT || 8000;
const GATEKEEPER_URL = `http://localhost:${PORT}/api/decisions/process`;
const API_KEY = process.env.API_KEY || 'dev-api-key-change-in-production';

const CAMPAIGNS = ['camp_conversion_optimizer', 'camp_cfo_tv_premium', 'camp_global_reach'];
const DOMAINS = [
    { name: 'nytimes.com', publisherId: 'pub_gam_1001', type: 'clean', probability: 0.45 },
    { name: 'bloomberg.com', publisherId: 'pub_gam_1002', type: 'clean', probability: 0.15 },
    { name: 'wired.com', publisherId: 'pub_gam_1003', type: 'clean', probability: 0.10 },
    { name: 'win-free-money-now.xyz', publisherId: 'pub_mfa_5001', type: 'mfa', probability: 0.15 },
    { name: 'download-free-ram.net', publisherId: 'pub_mfa_5002', type: 'mfa', probability: 0.05 },
    { name: 'pluto-tv-spoofed.com', publisherId: 'pub_ctv_9001', type: 'ctv_spoof', probability: 0.10 }
];

function selectRandomDomain() {
    const r = Math.random();
    let sum = 0;
    for (const d of DOMAINS) {
        sum += d.probability;
        if (r <= sum) return d;
    }
    return DOMAINS[0];
}

function generateBidPayload() {
    const domainObj = selectRandomDomain();
    const campaignId = CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)];
    const reqId = `req_dsp_${Math.random().toString(36).substring(2, 11)}`;
    const bidPrice = parseFloat((Math.random() * 8.5 + 1.5).toFixed(2)); // $1.50 - $10.00 CPM

    // OpenRTB-compliant mock payload
    const payload = {
        id: reqId,
        site: {
            publisher: {
                id: domainObj.publisherId,
                name: domainObj.name,
                domain: domainObj.name
            },
            domain: domainObj.name,
            page: `https://www.${domainObj.name}/news/article-${Math.floor(Math.random() * 1000)}`
        },
        impressions: [
            {
                id: 'imp_1',
                banner: { w: 300, h: 250 },
                bidfloor: 0.50
            }
        ],
        device: {
            type: domainObj.type === 'ctv_spoof' ? 'connected_tv' : 'desktop',
            ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
    };

    // Inject custom emulator flags or ifas based on threat type
    if (domainObj.type === 'ctv_spoof') {
        payload.ctv = {
            ifa: `ifa_${Math.random().toString(36).substring(2, 11)}`,
            deviceFingerprint: `emu_roku_player_${Math.random().toString(36).substring(2, 6)}`
        };
        // Add suspicious spoof indicators (e.g. mismatched OS / CTV UserAgent)
        payload.device.ua = 'Roku/DVP-9.10 (049.10E04111A)';
        payload.device.type = 'connected_tv';
    }

    return payload;
}

function sendTraffic() {
    const payload = generateBidPayload();
    const bodyString = JSON.stringify(payload);

    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/api/decisions/process',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'Content-Length': Buffer.byteLength(bodyString)
        }
    };

    const req = http.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => { responseBody += chunk; });
        res.on('end', () => {
            if (res.statusCode === 200) {
                try {
                    const parsed = JSON.parse(responseBody);
                    const decision = parsed.decision;
                    console.log(`[SIMULATOR] Bid: ${payload.site.domain} | Decision: \x1b[35m${decision.decision}\x1b[0m | Latency: ${decision.processingTimeMs}ms | Reason: ${decision.blockReason || 'NONE'} | Shaded CPM: $${decision.metadata?.shadedPrice || 'N/A'}`);
                } catch (e) {
                    console.error('[SIMULATOR] Response Parse Error:', e.message);
                }
            } else {
                console.error(`[SIMULATOR] Error: HTTP ${res.statusCode}`, responseBody);
            }
        });
    });

    req.on('error', (err) => {
        console.error('[SIMULATOR] Connection Refused - Ensure edge-gatekeeper is running on port 8000:', err.message);
    });

    req.write(bodyString);
    req.end();
}

// Parse args
const args = process.argv.slice(2);
const onceMode = args.includes('--once');
let intervalMs = 1000;

for (const arg of args) {
    if (arg.startsWith('--interval=')) {
        intervalMs = parseInt(arg.split('=')[1], 10) || 1000;
    }
}

console.log('----------------------------------------------------');
console.log('📡 Starting CleanPath AI Programmatic Traffic Stream');
console.log(`🔗 Targeting Gatekeeper: ${GATEKEEPER_URL}`);
console.log(`⏱️ Send Interval: ${onceMode ? 'ONCE' : intervalMs + 'ms'}`);
console.log('----------------------------------------------------');

if (onceMode) {
    sendTraffic();
} else {
    // Run continuous loop
    sendTraffic();
    setInterval(sendTraffic, intervalMs);
}
