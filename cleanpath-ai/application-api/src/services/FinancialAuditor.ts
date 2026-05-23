
import { Neo4jPool } from '@cleanpath/database';

export interface PathFeeAnalysis {
    siteId: string;
    siteDomain: string;
    totalFeePercentage: number;
    hopCount: number;
    path: Array<{
        id: string;
        label: string;
        fee?: number;
    }>;
}

export class FinancialAuditor {
    private neo4j: Neo4jPool;

    constructor() {
        this.neo4j = Neo4jPool.getInstance();
    }

    /**
     * Aggregates fees across all relationship hops for a specific supply path.
     * Identifies "High-Tax" routes where cumulative fees exceed efficiency thresholds.
     */
    public async analyzePathFees(siteId: string): Promise<PathFeeAnalysis[]> {
        const query = `
            MATCH (s:Site {id: $siteId})
            MATCH path = (s)-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            WHERE NOT (lastNode)-[:AUCTION_PATH]->()
            
            // Extract relationships to calculate fees
            // Note: In MVP, fees are stored on the relationship 'r'
            WITH s, path, relationships(path) AS rels
            
            // Sum all fees in the path. Default to 1% (0.01) if not specified per hop.
            UNWIND rels AS r
            WITH s, path, sum(coalesce(r.fee, 0.01)) AS totalFees, count(r) AS hops
            
            RETURN 
                s.id AS siteId,
                s.domain AS siteDomain,
                totalFees AS totalFeePercentage,
                hops AS hopCount,
                [node in nodes(path) | {
                    id: node.id,
                    label: labels(node)[0],
                    domain: node.domain
                }] AS pathNodes
        `;

        try {
            const results = await this.neo4j.read<any>(query, { siteId });
            return results.map((row: any) => ({
                siteId: row.siteId,
                siteDomain: row.siteDomain,
                totalFeePercentage: parseFloat(row.totalFeePercentage.toFixed(4)),
                hopCount: row.hopCount.low || row.hopCount,
                path: row.pathNodes
            }));
        } catch (error) {
            console.error('Financial Audit Error:', error);
            throw error;
        }
    }

    /**
     * Utility to bulk find paths exceeding a specific fee threshold (e.g., 0.15 for 15%)
     */
    public async findHighFeePaths(threshold: number = 0.10): Promise<PathFeeAnalysis[]> {
        const query = `
            MATCH path = (s:Site)-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            WHERE NOT (lastNode)-[:AUCTION_PATH]->()
            
            WITH s, path, relationships(path) AS rels
            UNWIND rels AS r
            WITH s, path, sum(coalesce(r.fee, 0.01)) AS totalFees, count(r) AS hops
            WHERE totalFees > $threshold
            
            RETURN 
                s.id AS siteId,
                s.domain AS siteDomain,
                totalFees AS totalFeePercentage,
                hops AS hopCount,
                [node in nodes(path) | {
                    id: node.id,
                    label: labels(node)[0],
                    domain: node.domain
                }] AS pathNodes
            ORDER BY totalFees DESC
            LIMIT 50
        `;

        try {
            const results = await this.neo4j.read<any>(query, { threshold });
            return results.map((row: any) => ({
                siteId: row.siteId,
                siteDomain: row.siteDomain,
                totalFeePercentage: parseFloat(row.totalFeePercentage.toFixed(4)),
                hopCount: row.hopCount.low || row.hopCount,
                path: row.pathNodes
            }));
        } catch (error) {
            console.error('High fee path query error:', error);
            return []; // Graceful degradation if Neo4j is unavailable
        }
    }

    /**
     * Get average supply chain fees for a specific publisher domain.
     * Used by WorkingMediaCalculator to compute supply chain fee impact.
     */
    public async getAveragePathFees(domain: string): Promise<number> {
        const query = `
            MATCH path = (s:Site {domain: $domain})-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            WHERE NOT (lastNode)-[:AUCTION_PATH]->()
            
            WITH path, relationships(path) AS rels
            UNWIND rels AS r
            WITH path, sum(coalesce(r.fee, 0.01)) AS totalFees
            
            RETURN avg(totalFees) AS avgFee
        `;

        try {
            const results = await this.neo4j.read<any>(query, { domain });
            if (results.length > 0 && results[0].avgFee != null) {
                return parseFloat(results[0].avgFee.toFixed(4));
            }
            return 0;
        } catch (error) {
            console.error('Average path fees error:', error);
            return 0; // Graceful degradation
        }
    }
}
