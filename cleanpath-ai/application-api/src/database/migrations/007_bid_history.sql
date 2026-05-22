
CREATE TABLE IF NOT EXISTS bid_history (
    bid_request_id UUID PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL,
    site_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bid_price DECIMAL(15, 6) NOT NULL,
    win_status BOOLEAN DEFAULT FALSE,
    clearing_price DECIMAL(15, 6), -- For second-price auctions or win notification
    device_type VARCHAR(50),
    geo_country VARCHAR(2)
);

CREATE INDEX idx_bid_history_campaign ON bid_history(campaign_id, timestamp);
CREATE INDEX idx_bid_history_site ON bid_history(site_id, timestamp);
