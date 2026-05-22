
-- Up Migration
ALTER TABLE decisions 
ADD COLUMN graph_path_id VARCHAR(255);

CREATE INDEX idx_decisions_graph_path_id ON decisions(graph_path_id);

-- Down Migration
-- DROP INDEX IF EXISTS idx_decisions_graph_path_id;
-- ALTER TABLE decisions 
-- DROP COLUMN IF EXISTS graph_path_id;
