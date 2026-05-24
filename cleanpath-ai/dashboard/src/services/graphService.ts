
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'dev-api-key-change-in-production';

async function fetchWithTimeout(resource: string, options: any = {}, timeout = 3000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

export interface GraphData {
    nodes: any[];
    links: any[];
}

/**
 * Fetches the supply path graph topology for a specific publisher.
 */
export async function fetchPublisherGraph(publisherId: string): Promise<GraphData> {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/graph/path/${publisherId}`, {
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
        console.warn('graphService: fetchPublisherGraph failed. Returning simulated Supply Path topology.');
        // High-fidelity fallback simulated nodes and paths representing a CTV bid stream
        const mockNodes = [
            { id: '1', label: 'Hulu SSP', type: 'ssp', properties: { domain: 'hulu.ssp.com' } },
            { id: '2', label: 'Magnite SSP', type: 'ssp', properties: { domain: 'magnite.com' } },
            { id: '3', label: 'The Trade Desk DSP', type: 'dsp', properties: { domain: 'thetradedesk.com' } },
            { id: '4', label: 'CleanPath Gatekeeper', type: 'agent', properties: { domain: 'cleanpath.ai' } },
            { id: '5', label: 'hulu.com', type: 'publisher', properties: { domain: 'hulu.com' } }
        ];
        const mockLinks = [
            { source: '3', target: '4', type: 'SHADED_BY', properties: { fee: 0.02 } },
            { source: '4', target: '2', type: 'ROUTED_TO', properties: { fee: 0.05 } },
            { source: '2', target: '1', type: 'HOP', properties: { fee: 0.12 } },
            { source: '1', target: '5', type: 'DELIVERED_TO', properties: { fee: 0.00 } }
        ];
        return { nodes: mockNodes, links: mockLinks };
    }
}

/**
 * Fetches a list of detected supply path anomalies (duplicates, fee stacking).
 */
export async function fetchAnomalies(): Promise<any[]> {
    try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/graph/anomalies`, {
            headers: { 'X-API-Key': API_KEY }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch anomalies');
        }
        const data = await response.json();
        return data.anomalies || [];
    } catch (error) {
        console.warn('graphService: fetchAnomalies failed. Returning simulated ad supply anomalies.');
        return [
            { 
                siteId: 'pub_anomaly_1', 
                siteDomain: 'hulu.com', 
                type: 'fee_stacking', 
                severity: 'HIGH', 
                details: 'Triple hop detected on Magnite SSP stacking 18% unnecessary fees.', 
                timestamp: new Date(Date.now() - 3600000).toISOString() 
            },
            { 
                siteId: 'pub_anomaly_2', 
                siteDomain: 'roku.freetv', 
                type: 'domain_spoofing', 
                severity: 'HIGH', 
                details: 'Declared Roku CTV inventory running on unverified desktop web canvas.', 
                timestamp: new Date(Date.now() - 7200000).toISOString() 
            }
        ];
    }
}
