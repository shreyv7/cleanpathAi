// Node Labels: Publisher, Site, SSP, Buyer
// Relationship Types: SELLS_VIA, AUCTION_PATH

// Constraints for Publisher
CREATE CONSTRAINT publisher_id_unique IF NOT EXISTS
FOR (p:Publisher) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT publisher_domain_unique IF NOT EXISTS
FOR (p:Publisher) REQUIRE p.domain IS UNIQUE;

// Constraints for Site
CREATE CONSTRAINT site_id_unique IF NOT EXISTS
FOR (s:Site) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT site_domain_unique IF NOT EXISTS
FOR (s:Site) REQUIRE s.domain IS UNIQUE;

// Constraints for SSP (Supply Side Platform / Intermediary)
CREATE CONSTRAINT ssp_id_unique IF NOT EXISTS
FOR (s:SSP) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT ssp_domain_unique IF NOT EXISTS
FOR (s:SSP) REQUIRE s.domain IS UNIQUE;

// Constraints for Buyer (DSP / Advertiser)
CREATE CONSTRAINT buyer_id_unique IF NOT EXISTS
FOR (b:Buyer) REQUIRE b.id IS UNIQUE;

// Node Property Indices (for performance)
CREATE INDEX publisher_name_index IF NOT EXISTS FOR (p:Publisher) ON (p.name);
CREATE INDEX site_name_index IF NOT EXISTS FOR (s:Site) ON (s.name);
CREATE INDEX ssp_name_index IF NOT EXISTS FOR (s:SSP) ON (s.name);
