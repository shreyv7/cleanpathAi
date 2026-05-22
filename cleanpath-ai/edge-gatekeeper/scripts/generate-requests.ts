import * as fs from 'fs';
import * as path from 'path';
import { BidRequest, DeviceType, AdFormat, AdPosition, PublisherMFAProfile } from '@cleanpath/types';

const DATA_DIR = path.resolve(__dirname, '../data');
const PUB_FILE = path.join(DATA_DIR, 'publishers.json');
const REQ_FILE = path.join(DATA_DIR, 'requests.json');

if (!fs.existsSync(PUB_FILE)) {
    console.error(`Publisher file not found: ${PUB_FILE}`);
    process.exit(1);
}

const publishers: PublisherMFAProfile[] = JSON.parse(fs.readFileSync(PUB_FILE, 'utf-8'));

const getRandomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const DEVICE_TYPES = [DeviceType.MOBILE, DeviceType.DESKTOP, DeviceType.TABLET];
const AD_FORMATS = [AdFormat.BANNER, AdFormat.NATIVE, AdFormat.VIDEO];
const AD_POSITIONS = [AdPosition.ABOVE_FOLD, AdPosition.BELOW_FOLD, AdPosition.SIDEBAR, AdPosition.FOOTER, AdPosition.HEADER];

const requestCount = 1000;
const requests: BidRequest[] = [];

for (let i = 0; i < requestCount; i++) {
    const publisher = getRandomElement(publishers);
    const deviceType = getRandomElement(DEVICE_TYPES);
    const isMobile = deviceType === DeviceType.MOBILE || deviceType === DeviceType.TABLET;

    const request: BidRequest = {
        id: `req_${Date.now()}_${i}`,
        timestamp: Date.now(),
        impressions: [{
            id: `imp_${i}_1`,
            format: getRandomElement(AD_FORMATS),
            position: getRandomElement(AD_POSITIONS),
            width: isMobile ? 320 : 728,
            height: isMobile ? 50 : 90,
            bidFloor: Math.round(Math.random() * 200) / 100,
            secure: true
        }],
        site: {
            id: `site_${publisher.publisherId}`,
            name: publisher.domain,
            domain: publisher.domain,
            page: `https://${publisher.domain}/article/${getRandomInt(1000, 9999)}`,
            publisher: {
                id: publisher.publisherId,
                name: publisher.domain,
                domain: publisher.domain,
                categories: ['IAB1', 'IAB2']
            },
            mobile: isMobile
        },
        device: {
            type: deviceType,
            ua: isMobile ?
                'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' :
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            ip: `192.168.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}`
        },
        test: false,
        timeout: 1000
    };
    requests.push(request);
}

fs.writeFileSync(REQ_FILE, JSON.stringify(requests, null, 2));
console.log(`Generated ${requests.length} bid requests to ${REQ_FILE}`);
