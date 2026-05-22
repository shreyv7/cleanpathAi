export interface DecisionStats {
    period: string;
    total_requests: number;
    blocked_requests: number;
    block_rate: number;
    avg_thermal_score: number;
    avg_latency: number;
    estimated_waste_saved?: number; // Calculated field
}

export interface DecisionLogEntry {
    id: string;
    request_id: string;
    publisher_id: string;
    decision: 'ALLOW' | 'BLOCK' | 'BID_MODIFIER' | 'REROUTE';
    thermal_score: number;
    latency_ms: number;
    geo_country?: string;
    device_type?: string;
    timestamp: string;
}

export interface DecisionLogResponse {
    data: DecisionLogEntry[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

