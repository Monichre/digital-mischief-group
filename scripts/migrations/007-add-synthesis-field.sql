-- Migration: Add synthesis field to enrichment_jobs
-- Description: Adds synthesis column for executive summary text
-- Date: 2025-12-22
-- Dependencies: 005-add-enrichment-agent-schema.sql

-- Add synthesis column for executive summary
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS synthesis TEXT;

-- Add index for searching synthesis content
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_synthesis ON enrichment_jobs
USING gin(to_tsvector('english', synthesis))
WHERE synthesis IS NOT NULL;

-- Verification
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'enrichment_jobs'
  AND column_name = 'synthesis';
