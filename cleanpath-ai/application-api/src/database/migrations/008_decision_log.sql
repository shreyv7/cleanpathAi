-- Migration: 008_decision_log.sql
-- Description: Structured decision log for financial dashboard queries
-- Governance Reset v1 — Phase 2: Financial Core

CREATE TABLE IF NOT EXISTS decision_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(255) NOT NULL,
    campaign_id VARCHAR(255),
    decision VARCHAR(50) NOT NULL,        -- 'allow', 'block', 'bid_modifier', 'reroute'
    decision_source VARCHAR(50),          -- 'MFA', 'CTV', 'PACING', 'SUPPLY_PATH'
    thermal_score NUMERIC(5, 2),
    ctv_risk_score NUMERIC(5, 2),
    bid_value_usd NUMERIC(10, 6),
    shaded_bid_usd NUMERIC(10, 6),        -- After bid shading
    savings_usd NUMERIC(10, 6),           -- originalPrice - shadedPrice
    publisher_id VARCHAR(255),
    domain VARCHAR(255),
    processing_time_ms NUMERIC(8, 3),
    block_reason VARCHAR(255),
    reroute_target VARCHAR(255),
    supply_chain_fee_pct NUMERIC(5, 4),   -- From graph path analysis
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_decision_log_campaign ON decision_log(campaign_id, created_at);
CREATE INDEX idx_decision_log_created ON decision_log(created_at);
CREATE INDEX idx_decision_log_decision ON decision_log(decision);
CREATE INDEX idx_decision_log_domain ON decision_log(domain, created_at);
