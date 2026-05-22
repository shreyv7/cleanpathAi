
import { Neo4jPool } from '@cleanpath/database';
import dotenv from 'dotenv';
import { SupplyChainPath, DecisionType } from '@cleanpath/types';
import { GraphIngestor } from '../services/GraphIngestor';

dotenv.config();

const NEO4J_CONFIG = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    pass: process.env.NEO4J_PASS || 'password'
};

/**
 * Task 5.2: Seed Duplicate Auction Scenarios
 * This script populates Neo4j with a specific scenario:
 * One publisher site having two distinct supply paths:
 * 1. A clean, direct path (1 hop).
 * 2. A bloated, redundant path (3 hops).
 * 
 * This allows the Anomaly Detection API and Dashboard to demonstrate detection of
 * Duplicate Paths and Fee Stacking.
 */
async function seedAnomalies() {
    console.log('Starting anomaly seeding...');

    // Initialize Neo4j explicitly for the seeder
    const neo4j = Neo4jPool.getInstance(NEO4J_CONFIG);
    const ingestor = new GraphIngestor();

    const publisherId = 'pub_anomaly_1';
    const publisherDomain = 'luxury-watch-reviews.com';
    const siteId = 'site_luxury_1';

    try {
        // 1. Clear existing data for this publisher for idempotency
        console.log(`Cleaning up data for ${publisherId}...`);
        await neo4j.write(`
            MATCH (p:Publisher {id: $publisherId})
            OPTIONAL MATCH (p)-[:OWNS]->(s:Site)
            OPTIONAL MATCH (s)-[r:SELLS_VIA|AUCTION_PATH*]->(n)
            DETACH DELETE p, s, n
        `, { publisherId });

        // 2. Create "Clean" Path: Publisher -> Site -> SSP_Direct -> Buyer
        console.log('Creating clean path...');
        const cleanDecision: any = {
            requestId: 'req_clean_101',
            decision: DecisionType.ALLOW,
            timestamp: Date.now(),
            processingTimeMs: 5,
            metadata: {
                publisherId,
                domain: publisherDomain,
                siteId: siteId
            }
        };

        const cleanSchain: SupplyChainPath = {
            ver: '1.0',
            complete: 1,
            nodes: [
                { asi: 'premium-exchange.com', sid: 'px_777', hp: 1, name: 'Premium Exchange', domain: 'premium-exchange.com' }
            ]
        };

        await ingestor.ingestPath(cleanDecision, cleanSchain);

        // 3. Create "Anomaly" Path: Publisher -> Site -> Intermediary_A -> Intermediary_B -> Reseller_C -> Buyer
        console.log('Creating anomaly path (Redundant and High-Hop)...');
        const anomalyDecision: any = {
            requestId: 'req_anomaly_202',
            decision: DecisionType.ALLOW,
            timestamp: Date.now(),
            processingTimeMs: 8,
            metadata: {
                publisherId,
                domain: publisherDomain,
                siteId: siteId
            }
        };

        const anomalySchain: SupplyChainPath = {
            ver: '1.0',
            complete: 1,
            nodes: [
                { asi: 'shady-reseller.net', sid: 'sr_123', hp: 0, name: 'Shady Reseller', domain: 'shady-reseller.net' },
                { asi: 'redundant-hop.io', sid: 'rh_456', hp: 0, name: 'Redundant Hop', domain: 'redundant-hop.io' },
                { asi: 'opaque-exchange.com', sid: 'oe_999', hp: 1, name: 'Opaque Exchange', domain: 'opaque-exchange.com' }
            ]
        };

        await ingestor.ingestPath(anomalyDecision, anomalySchain);

        console.log('Seeding complete.');
        console.log(`Publisher: ${publisherDomain} (${publisherId})`);
        console.log('Detected anomalies should now show 2 redundant paths for this publisher site.');

    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    } finally {
        await neo4j.close();
    }
}

seedAnomalies().catch((err) => {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
});
