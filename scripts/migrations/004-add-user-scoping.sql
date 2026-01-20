-- Add user_id columns to scope data to users

ALTER TABLE enrichment_jobs ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE brand_extractions ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE usage_events ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add indexes for user queries
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_user ON enrichment_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_extractions_user ON brand_extractions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_user ON usage_events(user_id);
