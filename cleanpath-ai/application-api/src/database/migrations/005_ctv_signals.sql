-- Up Migration: CTV Spoof Detection Support
-- Phase 3 - Stage 1, Task 1.4

-- Add CTV signals column to existing decisions table
ALTER TABLE decisions
    ADD COLUMN ctv_signals JSONB DEFAULT NULL,
    ADD COLUMN domain VARCHAR(255),
    ADD COLUMN risk_level VARCHAR(50),
    ADD COLUMN block_reason VARCHAR(100),
    ADD COLUMN signals JSONB DEFAULT '[]'::jsonb;

-- Create index for CTV-specific queries
CREATE INDEX idx_decisions_ctv_signals ON decisions USING GIN (ctv_signals) WHERE ctv_signals IS NOT NULL;

-- CTV Device Registry: tracks known device fingerprints by IFA
CREATE TABLE ctv_device_registry (
    ifa VARCHAR(255) PRIMARY KEY,
    device_make VARCHAR(100) NOT NULL,
    device_model VARCHAR(100) NOT NULL,
    os VARCHAR(50),
    os_version VARCHAR(50),
    firmware_version VARCHAR(100),
    screen_resolution VARCHAR(20),
    last_seen_ip VARCHAR(45),
    last_app_bundle VARCHAR(255),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    mutation_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'blocked')),
    override_reason TEXT,
    override_by VARCHAR(100),
    override_at TIMESTAMP WITH TIME ZONE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for CTV device registry
CREATE INDEX idx_ctv_device_status ON ctv_device_registry(status);
CREATE INDEX idx_ctv_device_risk_score ON ctv_device_registry(risk_score) WHERE risk_score > 50;
CREATE INDEX idx_ctv_device_last_seen ON ctv_device_registry(last_seen);

-- Down Migration
-- ALTER TABLE decisions DROP COLUMN IF EXISTS ctv_signals;
-- ALTER TABLE decisions DROP COLUMN IF EXISTS domain;
-- ALTER TABLE decisions DROP COLUMN IF EXISTS risk_level;
-- ALTER TABLE decisions DROP COLUMN IF EXISTS block_reason;
-- ALTER TABLE decisions DROP COLUMN IF EXISTS signals;
-- DROP TABLE IF EXISTS ctv_device_registry;
