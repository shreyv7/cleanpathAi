
import { Request, Response } from 'express';
import { Neo4jPool } from '@cleanpath/database';

export class GraphController {
    private get neo4j() {
        return Neo4jPool.getInstance();
    }

    /**
     * Fetches the supply path graph for a specific publisher.
     * Returns nodes and edges in a format suitable for graph visualization.
     */
    public getPublisherGraph = async (req: Request, res: Response): Promise<void> => {
        const { publisher_id } = req.params;

        // Cypher query to get nodes and relationships for the publisher's sites
        const query = `
            MATCH (p:Publisher {id: $publisher_id})-[:OWNS]->(s:Site)
            OPTIONAL MATCH path = (s)-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            UNWIND nodes(path) AS n
            UNWIND relationships(path) AS r
            WITH collect(DISTINCT n) AS nodes, collect(DISTINCT r) AS rels
            RETURN nodes, rels
        `;

        try {
            const results = await this.neo4j.read<any>(query, { publisher_id });

            if (!results || results.length === 0) {
                res.json({ nodes: [], edges: [] });
                return;
            }

            const rawNodes = results[0].nodes || [];
            const rawRels = results[0].rels || [];

            const nodes = rawNodes.map((n: any) => ({
                id: n.identity.toString(),
                label: n.labels[0],
                properties: n.properties
            }));

            const edges = rawRels.map((r: any) => ({
                id: r.identity.toString(),
                source: r.start.toString(),
                target: r.end.toString(),
                type: r.type,
                properties: r.properties
            }));

            res.json({ nodes, edges });
        } catch (error) {
            console.error('Error fetching publisher graph:', error);
            res.status(500).json({ error: 'Failed to fetch graph topology' });
        }
    }

    /**
     * Lists detected supply path anomalies (duplicate paths, high fee stack).
     */
    public getAnomalies = async (req: Request, res: Response): Promise<void> => {
        const query = `
            MATCH (p:Publisher)-[:OWNS]->(s:Site)
            MATCH path = (s)-[:SELLS_VIA|AUCTION_PATH*1..5]->(lastNode)
            WHERE NOT (lastNode)-[:AUCTION_PATH]->()
            WITH s, p, collect(path) AS paths, count(path) AS pathCount
            WHERE pathCount > 1
            RETURN 
                s.id AS siteId,
                s.domain AS siteDomain,
                p.id AS publisherId,
                pathCount,
                'DUPLICATE_PATH' AS type
            ORDER BY pathCount DESC
            LIMIT 50
        `;

        try {
            const results = await this.neo4j.read<any>(query);
            res.json({
                count: results.length,
                anomalies: results.map(row => ({
                    siteId: row.siteId,
                    siteDomain: row.siteDomain,
                    publisherId: row.publisherId,
                    severity: row.pathCount > 3 ? 'HIGH' : 'MEDIUM',
                    type: row.type,
                    details: `${row.pathCount} redundant auction paths detected.`
                }))
            });
        } catch (error) {
            console.error('Error fetching anomalies:', error);
            res.status(500).json({ error: 'Failed to analyze supply path anomalies' });
        }
    }
}
