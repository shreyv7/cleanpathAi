
import { Neo4jPool } from '@cleanpath/database';
import { GraphIngestor } from '../../application-api/src/services/GraphIngestor';
import { SupplyChainPath, DecisionType } from '@cleanpath/types';
import dotenv from 'dotenv';

dotenv.config();

const NEO4J_CONFIG = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    pass: process.env.NEO4J_PASS || 'password'
};

/**
 * Task 7.1: Graph Integrity Tests
 * Validates that the GraphIngestor correctly maps Edge Decisions and schains
 * into the Neo4j relational topology.
 */
describe('Graph Integrity Integration', () => {
    let neo4j: Neo4jPool;
    let ingestor: GraphIngestor;

    beforeAll(async () => {
        // Initialize Neo4j for the test environment
        neo4j = Neo4jPool.getInstance(NEO4J_CONFIG);
        ingestor = new GraphIngestor();
    });

    afterAll(async () => {
        if (neo4j) {
            await neo4j.close();
        }
    });

    it('should correctly reconstruct a multi-hop supply path topology', async () => {
        const publisherId = 'test_integrity_pub';
        const siteId = 'test_integrity_site_1';
        const requestId = 'req_integrity_123';

        // 1. Cleanup old test data
        await neo4j.write(`
            MATCH (p:Publisher {id: $publisherId})
            OPTIONAL MATCH (p)-[:OWNS]->(s:Site)
            OPTIONAL MATCH (s)-[r:SELLS_VIA|AUCTION_PATH*]->(n)
            DETACH DELETE p, s, n
        `, { publisherId });

        // 2. Prepare mock decision and schain
        const decision: any = {
            requestId,
            decision: DecisionType.ALLOW,
            timestamp: Date.now(),
            processingTimeMs: 10,
            metadata: {
                publisherId,
                domain: 'test-integrity.com',
                siteId: siteId
            }
        };

        const schain: SupplyChainPath = {
            ver: '1.0',
            complete: 1,
            nodes: [
                { asi: 'ssp-alpha.com', sid: 'alpha_01', hp: 0, name: 'SSP Alpha' },
                { asi: 'ssp-beta.io', sid: 'beta_02', hp: 1, name: 'SSP Beta' }
            ]
        };

        // 3. Execute ingestion
        await ingestor.ingestPath(decision, schain);

        // 4. Verify publisher and site nodes
        const nodes = await neo4j.read<any>(`
            MATCH (p:Publisher {id: $publisherId})-[:OWNS]->(s:Site {id: $siteId})
            RETURN p, s
        `, { publisherId, siteId });

        expect(nodes.length).toBe(1);
        expect(nodes[0].p.properties.id).toBe(publisherId);

        // 5. Verify SELLS_VIA relationship (Site -> First SSP)
        const sellsVia = await neo4j.read<any>(`
            MATCH (s:Site {id: $siteId})-[r:SELLS_VIA]->(ssp:SSP {id: 'alpha_01'})
            RETURN r
        `, { siteId });

        expect(sellsVia.length).toBe(1);
        expect(sellsVia[0].r.properties.requestId).toBe(requestId);

        // 6. Verify AUCTION_PATH relationship (SSP Alpha -> SSP Beta)
        const auctionPath = await neo4j.read<any>(`
            MATCH (ssp1:SSP {id: 'alpha_01'})-[r:AUCTION_PATH]->(ssp2:SSP {id: 'beta_02'})
            RETURN r
        `);

        expect(auctionPath.length).toBe(1);
    });

    it('should avoid duplicating SSP nodes when the same intermediary is used across requests', async () => {
        const publisherId = 'test_integrity_pub_2';
        const siteId = 'test_integrity_site_2';

        const schain: SupplyChainPath = {
            ver: '1.0',
            complete: 1,
            nodes: [{ asi: 'common-ssp.com', sid: 'shared_ssp', hp: 1 }]
        };

        // Ingest twice
        await ingestor.ingestPath({
            requestId: 'req_1',
            metadata: { publisherId, domain: 'test.com', siteId }
        } as any, schain);

        await ingestor.ingestPath({
            requestId: 'req_2',
            metadata: { publisherId, domain: 'test.com', siteId }
        } as any, schain);

        // Verify only one SSP node exists with this ID
        const sspCount = await neo4j.read<any>(`
            MATCH (ssp:SSP {id: 'shared_ssp'})
            RETURN count(ssp) as count
        `);

        expect(sspCount[0].count.toNumber()).toBe(1);
    });
});
