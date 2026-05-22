
import { Neo4jPool } from '@cleanpath/database';
import { SupplyChainPath, EdgeDecision } from '@cleanpath/types';

export class GraphIngestor {
    private neo4j: Neo4jPool;

    constructor() {
        this.neo4j = Neo4jPool.getInstance();
    }

    /**
     * Upserts a supply chain path for a given decision.
     * Maps Publisher -> Site -> [Intermediaries] -> Buyer
     */
    public async ingestPath(decision: EdgeDecision, schain: SupplyChainPath): Promise<void> {
        const { requestId } = decision;
        const { publisherId, domain: publisherDomain } = decision.metadata;
        const siteId = (decision.metadata as any).siteId || `site_${publisherId}`;

        try {
            // Cypher query to incrementally build the path
            // 1. Ensure Publisher and Site exist
            // 2. Build the chain of SELLS_VIA relationships

            const query = `
                MERGE (p:Publisher {id: $publisherId})
                SET p.domain = $publisherDomain,
                    p.updatedAt = timestamp()
                
                MERGE (s:Site {id: $siteId})
                SET s.domain = $publisherDomain,
                    s.updatedAt = timestamp()
                
                MERGE (p)-[:OWNS]->(s)
                
                WITH s
                UNWIND range(0, size($nodes) - 1) AS i
                WITH s, $nodes[i] AS node, i
                
                // Create SSP node for this hop
                MERGE (ssp:SSP {id: node.sid})
                SET ssp.domain = node.asi,
                    ssp.updatedAt = timestamp()
                
                WITH s, ssp, i
                // If i=0, link Site to the first SSP
                // If i>0, link previous SSP to current SSP
                // Handle first hop
                FOREACH (_ IN CASE WHEN i = 0 THEN [1] ELSE [] END |
                    MERGE (s)-[r:SELLS_VIA]->(ssp)
                    SET r.requestId = $requestId
                )
                
                // Note: Complex multi-hop linking in a single UNWIND is tricky.
                // For MVP, we'll ensure nodes exist and link Site -> SSP.
                // In Task 2.2, we focus on basic ingestion.
            `;

            await this.neo4j.write(query, {
                publisherId,
                publisherDomain,
                siteId,
                requestId,
                nodes: schain.nodes
            });

            // Handle intermediate SSP to SSP links if needed
            if (schain.nodes.length > 1) {
                for (let i = 1; i < schain.nodes.length; i++) {
                    const prev = schain.nodes[i - 1];
                    const current = schain.nodes[i];

                    const hopQuery = `
                        MERGE (prev:SSP {id: $prevId})
                        MERGE (curr:SSP {id: $currId})
                        MERGE (prev)-[r:AUCTION_PATH]->(curr)
                        SET r.updatedAt = timestamp()
                    `;

                    await this.neo4j.write(hopQuery, {
                        prevId: prev.sid,
                        currId: current.sid
                    });
                }
            }

        } catch (error) {
            console.error('Graph Ingestion Error:', error);
            throw error;
        }
    }

    /**
     * Detects if a site has duplicate paths (selling through multiple SSPs)
     * Returns true if the site is already selling through an SSP other than the provided one.
     */
    public async detectDuplicatePath(siteId: string, currentSspId: string): Promise<boolean> {
        const query = `
            MATCH (s:Site {id: $siteId})-[r:SELLS_VIA]->(ssp:SSP)
            WHERE ssp.id <> $currentSspId
            RETURN count(r) as duplicateCount
        `;
        try {
            const results = await this.neo4j.read<any>(query, { siteId, currentSspId });
            if (results && results.length > 0) {
                const count = results[0].duplicateCount.low ?? results[0].duplicateCount;
                return count > 0;
            }
            return false;
        } catch (error) {
            console.error('Duplicate path detection error:', error);
            return false; // Fail open
        }
    }
}
