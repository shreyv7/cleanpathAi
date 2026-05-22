-- Migration: 006_budget_schema.sql
-- Description: Schema for Real-time Budget Pacing

CREATE TYPE pacing_mode AS ENUM ('ASAP', 'SMOOTH');

CREATE TABLE IF NOT EXISTS campaign_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id VARCHAR(255) NOT NULL UNIQUE,
    total_budget DECIMAL(15, 6) NOT NULL, -- Total budget for the flight
    remaining_budget DECIMAL(15, 6) NOT NULL, -- Current remaining
    currency VARCHAR(3) DEFAULT 'USD',
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    pacing_mode pacing_mode DEFAULT 'ASAP',
    daily_cap DECIMAL(15, 6), -- Optional daily hard cap
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_budget_id UUID REFERENCES campaign_budgets(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    allocated_amount DECIMAL(15, 6) NOT NULL,
    spent_amount DECIMAL(15, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT interval_check CHECK (end_time > start_time)
);

CREATE INDEX idx_budgets_campaign ON campaign_budgets(campaign_id);
CREATE INDEX idx_intervals_lookup ON budget_intervals(campaign_budget_id, start_time, end_time);
