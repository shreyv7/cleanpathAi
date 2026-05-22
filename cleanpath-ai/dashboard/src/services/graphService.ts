
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-change-in-production';

export interface GraphData {
    nodes: any[];
    links: any[];
}

/**
 * Fetches the supply path graph topology for a specific publisher.
 */
export async function fetchPublisherGraph(publisherId: string): Promise<GraphData> {
    try {
        const response = await fetch(`${API_BASE_URL}/graph/path/${publisherId}`, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch publisher graph');
        }
        const data = await response.json();

        // Ensure links are compatible with d3-force (expecting source/target)
        return {
            nodes: data.nodes || [],
            links: (data.edges || []).map((e: any) => ({
                ...e,
                source: e.source,
                target: e.target
            }))
        };
    } catch (error) {
        console.error('graphService: fetchPublisherGraph failed', error);
        return { nodes: [], links: [] };
    }
}

/**
 * Fetches a list of detected supply path anomalies (duplicates, fee stacking).
 */
export async function fetchAnomalies(): Promise<any[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/graph/anomalies`, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch anomalies');
        }
        const data = await response.json();
        return data.anomalies || [];
    } catch (error) {
        console.error('graphService: fetchAnomalies failed', error);
        return [];
    }
}
