-- Up Migration
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    publisher_id UUID REFERENCES publishers(id),
    decision VARCHAR(50) NOT NULL, -- 'ALLOW', 'BLOCK', 'BID_MODIFIER'
    thermal_score INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL,
    geo_country VARCHAR(10),
    device_type VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    audit_metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_decisions_publisher_id ON decisions(publisher_id);
CREATE INDEX idx_decisions_timestamp ON decisions(timestamp);
CREATE INDEX idx_decisions_decision ON decisions(decision);

-- Down Migration
-- DROP TABLE IF EXISTS decisions;
