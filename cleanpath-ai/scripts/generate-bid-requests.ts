
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import {
    BidRequest,
    DeviceType,
    AdFormat,
    AdPosition,
    Site,
    Device,
    Impression,
    Publisher
} from '../shared/types/src/BidRequest';

const NUM_REQUESTS = 1000;
const OUTPUT_FILE = path.join(__dirname, '../tests/fixtures/bid-requests.json');

// Fake data pools
const PUBLISHERS: Publisher[] = [
    // Clean Publishers
    { id: 'pub-clean-01', name: 'TechCrunch', domain: 'techcrunch.com', categories: ['tech', 'news'] },
    { id: 'pub-clean-02', name: 'NYTimes', domain: 'nytimes.com', categories: ['news'] },
    { id: 'pub-clean-03', name: 'GitHub', domain: 'github.com', categories: ['tech', 'development'] },

    // MFA Publishers (Simulated)
    { id: 'pub-mfa-01', name: 'Viral Buzz Feed', domain: 'viral-buzz-feed-daily.net', categories: ['viral', 'entertainment'] },
    { id: 'pub-mfa-02', name: 'Top 10 Tricks', domain: 'top-10-tricks-you-wont-believe.org', categories: ['spam', 'clickbait'] },
    { id: 'pub-mfa-03', name: 'Flash Games 247', domain: 'play-free-flash-games-now.biz', categories: ['games'] },
];

const DEVICE_TYPES = Object.values(DeviceType);
const AD_FORMATS = Object.values(AdFormat);
const AD_POSITIONS = Object.values(AdPosition);

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateBidRequest(): BidRequest {
    const publisher = getRandomElement(PUBLISHERS);
    const deviceType = getRandomElement(DEVICE_TYPES);

    const site: Site = {
        id: `site-${randomUUID().substring(0, 8)}`,
        name: publisher.name,
        domain: publisher.domain,
        page: `https://${publisher.domain}/article/${randomUUID().substring(0, 8)}`,
        publisher: publisher,
        mobile: deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET
    };

    const device: Device = {
        type: deviceType,
        ua: `Mozilla/5.0 (${deviceType}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36`,
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        geo: {
            country: 'US',
            city: 'New York'
        },
        os: 'Windows',
        osVersion: '10'
    };

    const impression: Impression = {
        id: `imp-${randomUUID().substring(0, 8)}`,
        format: getRandomElement(AD_FORMATS),
        position: getRandomElement(AD_POSITIONS),
        width: 300,
        height: 250,
        bidFloor: Number((Math.random() * 2).toFixed(2)),
        secure: true
    };

    return {
        id: randomUUID(),
        timestamp: Date.now(),
        impressions: [impression],
        site,
        device,
        user: {
            id: `usr-${randomUUID().substring(0, 12)}`,
            buyerUid: `buyer-${randomUUID().substring(0, 12)}`
        },
        test: true
    };
}

function main() {
    console.log(`Generating ${NUM_REQUESTS} bid requests...`);
    const requests: BidRequest[] = [];

    for (let i = 0; i < NUM_REQUESTS; i++) {
        requests.push(generateBidRequest());
    }

    // Ensure output directory exists (redundant with our plan but good practice)
    const dir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(requests, null, 2));
    console.log(`Successfully wrote ${requests.length} requests to ${OUTPUT_FILE}`);
}

main();
