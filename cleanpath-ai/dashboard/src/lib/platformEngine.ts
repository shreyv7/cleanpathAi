export interface IntegrationItem {
    id: string;
    name: string;
    type: 'DSP' | 'SSP' | 'DATAWAREHOUSE' | 'COMMUNICATION' | 'MONITORING';
    status: 'CONNECTED' | 'SYNCING' | 'DISCONNECTED';
    lastSync: string;
    eventsSynced: number;
}

export interface ApiKey {
    id: string;
    name: string;
    keyPreview: string;
    scope: 'read_only' | 'full_control' | 'financial_audit';
    status: 'ACTIVE' | 'REVOKED';
    created: string;
}

export interface AuditTrailRecord {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    soc2Hash: string;
    category: 'POLICY' | 'SECURITY' | 'AUTHENTICATION' | 'COMPLIANCE';
}

export interface AppInstance {
    id: string;
    name: string;
    description: string;
    status: 'ACTIVE' | 'INSTALLED' | 'AVAILABLE';
    category: 'INTEGRITY' | 'OPTIMIZATION' | 'ANALYTICS';
}

export const PLATFORM_INTEGRATIONS: IntegrationItem[] = [
    { id: 'int_ttd', name: 'The Trade Desk', type: 'DSP', status: 'CONNECTED', lastSync: 'Just now', eventsSynced: 124200 },
    { id: 'int_dv360', name: 'DV360', type: 'DSP', status: 'CONNECTED', lastSync: '1 min ago', eventsSynced: 98400 },
    { id: 'int_gam', name: 'GoogleAdManager', type: 'SSP', status: 'CONNECTED', lastSync: 'Just now', eventsSynced: 342100 },
    { id: 'int_snowflake', name: 'Snowflake Database', type: 'DATAWAREHOUSE', status: 'CONNECTED', lastSync: '5 mins ago', eventsSynced: 567000 },
    { id: 'int_slack', name: 'Slack Notifications', type: 'COMMUNICATION', status: 'CONNECTED', lastSync: '10 mins ago', eventsSynced: 124 },
    { id: 'int_datadog', name: 'Datadog Telemetry', type: 'MONITORING', status: 'CONNECTED', lastSync: 'Just now', eventsSynced: 87600 }
];

export const INITIAL_API_KEYS: ApiKey[] = [
    { id: 'key_01', name: 'Production Trade Desk Sync', keyPreview: 'cp_live_...9xF5t', scope: 'full_control', status: 'ACTIVE', created: '2026-04-12' },
    { id: 'key_02', name: 'CFO BiqQuery Connector', keyPreview: 'cp_read_...3uD1a', scope: 'financial_audit', status: 'ACTIVE', created: '2026-05-18' }
];

export const IMMUTABLE_AUDIT_TRAIL: AuditTrailRecord[] = [
    { id: 'aud_001', timestamp: '2026-05-25 15:42:10', actor: 'Autonomous Controller', action: 'Suppressed Magnite Reseller Node on Policy [Zero-Tolerance MFA]', soc2Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', category: 'POLICY' },
    { id: 'aud_002', timestamp: '2026-05-25 15:48:32', actor: 'Risk Operator L2', action: 'Approved quarantine of APAC CTV mobile pathways', soc2Hash: '8b7f8303f835cb43bb4afdc3463870e28fb67fa2037953255152a514d3c907a9', category: 'SECURITY' },
    { id: 'aud_003', timestamp: '2026-05-25 15:55:01', actor: 'CFO Workspace API', action: 'Generated quarterly media savings report (compilation hash: abc32)', soc2Hash: '433a0ea7d08b3a0cd3a7e3a985e5108b3401567ba4f1a23daef907d4b4e542ef', category: 'COMPLIANCE' }
];

export const CUSTOM_APP_ECOSYSTEM: AppInstance[] = [
    { id: 'app_ctv', name: 'CTV Emulator Integrity Studio', description: 'Advanced forensic emulator validation and proxy fingerprinting', status: 'ACTIVE', category: 'INTEGRITY' },
    { id: 'app_mfa', name: 'MFA Smart Suppression Module', description: 'Real-time detection and block propagation of artificial MFA hops', status: 'ACTIVE', category: 'OPTIMIZATION' },
    { id: 'app_graph', name: 'Ecosystem Supply Graph Explorer', description: 'Vectorized path analysis mapping intermediate clearing extractions', status: 'INSTALLED', category: 'ANALYTICS' },
    { id: 'app_cfo', name: 'Strategic CFO Scenario Studio', description: 'Simulate direct PMP bypass consolidations and programmatic cost recoveries', status: 'AVAILABLE', category: 'ANALYTICS' }
];

export function getMockApiResponse(endpoint: string): string {
    if (endpoint === '/v1/integrity/google_ad_manager') {
        return `{
  "node": "GoogleAdManager Direct",
  "type": "SSP",
  "integrity_score": 98.4,
  "efficiency_index": 98.0,
  "tax_tier": "A+",
  "status": "TRUSTED",
  "monitored_routes": 142
}`;
    }
    if (endpoint === '/v1/threat/hydra_families') {
        return `{
  "threat_group": "HYDRA-7",
  "vectors": ["CTV Spoofing", "Proxy Clones"],
  "extraction_rate": "11% of regional spend",
  "active_quarantines": ["Magnite Reseller Hub-C"],
  "mitigation_status": "99.4% mitigated"
}`;
    }
    return `{
  "status": "operational",
  "telemetry": "synced",
  "supported_endpoints": [
    "/v1/integrity/google_ad_manager",
    "/v1/threat/hydra_families"
  ]
}`;
}
