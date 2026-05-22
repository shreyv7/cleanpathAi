-- Up Migration
CREATE TABLE thermal_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publisher_id UUID REFERENCES publishers(id),
    score INTEGER NOT NULL,
    reasons JSONB DEFAULT '[]'::jsonb, -- Array of reasons/rules triggered
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_thermal_score_history_publisher_id ON thermal_score_history(publisher_id);
CREATE INDEX idx_thermal_score_history_timestamp ON thermal_score_history(snapshot_timestamp);

-- Down Migration
-- DROP TABLE IF EXISTS thermal_score_history;
