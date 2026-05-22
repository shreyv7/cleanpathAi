import { GraphIngestor } from '../src/services/GraphIngestor';
import { EdgeDecision, SupplyChainPath, DecisionType } from '@cleanpath/types';
import { Neo4jPool } from '@cleanpath/database';

async function run() {
    // Initialize Neo4j pool first
    Neo4jPool.getInstance({
        uri: 'neo4j://localhost:7687',
        user: 'neo4j',
        pass: 'password'
    });

    const ingestor = new GraphIngestor();

    const decision: any = {
        requestId: 'req-dup-test',
        decision: DecisionType.ALLOW,
        timestamp: Date.now(),
        processingTimeMs: 10,
        metadata: {
            publisherId: 'pub123',
            domain: 'thetimes.com',
            siteId: 'site_123'
        }
    };

    // 1. Ingest first path via SSP1
    const path1: SupplyChainPath = {
        ver: '1.0',
        complete: 1,
        nodes: [{ asi: 'ssp1.com', sid: 'ssp1', hp: 1, rid: 'req1' }]
    };
    await ingestor.ingestPath(decision as EdgeDecision, path1);
    console.log('Path 1 ingested (SSP1)');

    // 2. Ingest second path via SSP2 (Duplicate Path!)
    const path2: SupplyChainPath = {
        ver: '1.0',
        complete: 1,
        nodes: [{ asi: 'ssp2.com', sid: 'ssp2', hp: 1, rid: 'req2' }]
    };
    await ingestor.ingestPath(decision, path2);
    console.log('Path 2 ingested (SSP2)');

    // 3. Detect duplicate for SSP2
    const isDuplicate = await ingestor.detectDuplicatePath('site_123', 'ssp2');
    console.log(`Is SSP2 a duplicate path? ${isDuplicate}`); // Should be true, because ssp1 exists

    // 4. Detect duplicate for a new site that doesn't exist
    const isDuplicateNew = await ingestor.detectDuplicatePath('site_999', 'ssp1');
    console.log(`Is site_999 a duplicate path? ${isDuplicateNew}`); // Should be false
}

run().then(() => {
    console.log('Neo4j Cypher verification completed successfully.');
    process.exit(0);
}).catch(err => {
    console.error('Failed:', err);
    process.exit(1);
});
