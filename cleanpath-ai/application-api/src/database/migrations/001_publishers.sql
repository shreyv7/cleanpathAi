-- Up Migration
CREATE TABLE publishers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'mfa'
    thermal_score INTEGER DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'low', -- 'low', 'medium', 'high'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_publishers_domain ON publishers(domain);
CREATE INDEX idx_publishers_status ON publishers(status);

-- Down Migration
-- DROP TABLE IF EXISTS publishers;
