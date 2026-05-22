
import fs from 'fs';
import path from 'path';
import { SupplyChainPath, SupplyChainNode } from '@cleanpath/types';

/**
 * Multi-Hop Path Simulator
 * Generates realistic SupplyChain (schain) objects for testing graph ingestion and analysis.
 */

interface MockSSP {
    asi: string;
    sid: string;
    name: string;
}

const MOCK_SSPS: MockSSP[] = [
    { asi: 'magnite.com', sid: 'mag-123', name: 'Magnite' },
    { asi: 'indexexchange.com', sid: 'ix-456', name: 'Index Exchange' },
    { asi: 'pubmatic.com', sid: 'pub-789', name: 'PubMatic' },
    { asi: 'openx.com', sid: 'ox-001', name: 'OpenX' },
    { asi: 'triplelift.com', sid: 'tl-222', name: 'TripleLift' }
];

const DOMAINS = ['news-portal.com', 'tech-blog.io', 'gaming-hub.net', 'finance-daily.com'];

function generateRandomPath(hops: number): SupplyChainPath {
    const nodes: SupplyChainNode[] = [];

    // Hop 0 is usually the publisher or the first exchange
    for (let i = 0; i < hops; i++) {
        const selectedSSP = MOCK_SSPS[i % MOCK_SSPS.length]; // Deterministic for sequence

        nodes.push({
            asi: selectedSSP.asi,
            sid: selectedSSP.sid,
            hp: i === hops - 1 ? 1 : 0, // Last hop usually receives payment
            rid: `req-${Math.random().toString(36).substring(7)}`,
            name: selectedSSP.name,
            domain: selectedSSP.asi
        });
    }

    return {
        ver: '1.0',
        complete: 1,
        nodes
    };
}

function runSimulator() {
    const dataset: any[] = [];

    DOMAINS.forEach(domain => {
        // Generate a simple 1-hop path (Efficient)
        dataset.push({
            domain,
            type: 'EFFICIENT',
            schain: generateRandomPath(1)
        });

        // Generate a 2-hop path (Standard)
        dataset.push({
            domain,
            type: 'STANDARD',
            schain: generateRandomPath(2)
        });

        // Generate a 4-hop path (Inefficient/Fee Stacking)
        dataset.push({
            domain,
            type: 'FEE_STACKING',
            schain: generateRandomPath(4)
        });
    });

    const outputPath = path.join(__dirname, '../data/simulated-paths.json');

    // Ensure data directory exists
    const dataDir = path.dirname(outputPath);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
    console.log(`Successfully generated ${dataset.length} simulated supply paths to ${outputPath}`);
}

runSimulator();
