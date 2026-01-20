-- Migration: Add Multi-Phase Agent Enrichment Schema
-- Description: Adds enrichment_batches table and agent phase tracking columns
-- Date: 2025-12-21
-- Dependencies: 001-create-tables.sql, 004-add-user-scoping.sql

-- ============================================================================
-- PART 1: Create enrichment_batches table
-- ============================================================================
-- This table tracks CSV batch upload metadata
-- Referenced by app/api/enrich/batch/route.ts but was never created!

CREATE TABLE IF NOT EXISTS enrichment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Batch metadata
  total_rows INT NOT NULL,
  completed_rows INT DEFAULT 0,
  failed_rows INT DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'cancelled')),

  -- Progress tracking
  current_phase TEXT, -- 'discovery', 'profile', 'funding', 'tech_stack', 'custom_fields'
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  estimated_completion_at TIMESTAMPTZ,

  -- Multi-tenancy
  user_id TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrichment_batches_user_id ON enrichment_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_batches_status ON enrichment_batches(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_batches_created_at ON enrichment_batches(created_at DESC);

-- ============================================================================
-- PART 2: Add agent phase tracking columns to enrichment_jobs
-- ============================================================================
-- These columns store the output of each agent phase
-- Allows for source attribution and phase-level retry

-- Add batch relationship
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES enrichment_batches(id) ON DELETE CASCADE;

-- Add agent phase data columns (JSONB for flexibility)
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS discovery_data JSONB,
ADD COLUMN IF NOT EXISTS profile_data JSONB,
ADD COLUMN IF NOT EXISTS funding_data JSONB,
ADD COLUMN IF NOT EXISTS tech_stack_data JSONB,
ADD COLUMN IF NOT EXISTS custom_fields_data JSONB;

-- Add source attribution (field → URLs mapping)
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS sources JSONB;
-- Example: {"company_name": ["https://acme.com/about"], "funding_total": ["https://crunchbase.com/acme"]}

-- Add phase tracking
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS current_phase TEXT,
ADD COLUMN IF NOT EXISTS completed_phases TEXT[], -- array of completed phase names
ADD COLUMN IF NOT EXISTS failed_phase TEXT,
ADD COLUMN IF NOT EXISTS phase_error_message TEXT;

-- Add ICP fit score (from Custom Fields Agent)
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS icp_fit_score INT CHECK (icp_fit_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS icp_fit_reasons TEXT[];

-- Add buying signals (from Custom Fields Agent)
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS buying_signals JSONB;
-- Example: [{"signal": "hiring_engineers", "confidence": 0.85, "source": "https://..."}]

-- Indexes for agent phase queries
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_batch_id ON enrichment_jobs(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_current_phase ON enrichment_jobs(current_phase);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_icp_fit_score ON enrichment_jobs(icp_fit_score DESC) WHERE icp_fit_score IS NOT NULL;

-- ============================================================================
-- PART 3: Create agent_execution_logs table (optional but recommended)
-- ============================================================================
-- Tracks each agent phase execution for debugging and analytics

CREATE TABLE IF NOT EXISTS agent_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  enrichment_job_id UUID REFERENCES enrichment_jobs(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES enrichment_batches(id) ON DELETE CASCADE,

  -- Agent info
  agent_name TEXT NOT NULL, -- 'discovery', 'profile', 'funding', 'tech_stack', 'custom_fields'
  agent_version TEXT DEFAULT '1.0',

  -- Execution details
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INT, -- calculated: completed_at - started_at

  -- Results
  input_data JSONB, -- what was passed to the agent
  output_data JSONB, -- what the agent returned
  error_message TEXT,
  error_stack TEXT,

  -- Metrics
  api_calls_made INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  cost_usd DECIMAL(10, 6), -- track Firecrawl/OpenAI costs per agent

  -- Sources used
  sources_accessed TEXT[], -- URLs the agent scraped/searched

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_job_id ON agent_execution_logs(enrichment_job_id);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_agent_name ON agent_execution_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_status ON agent_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_agent_execution_logs_created_at ON agent_execution_logs(created_at DESC);

-- ============================================================================
-- PART 4: Update existing data (data migration)
-- ============================================================================
-- For existing enrichment_jobs, initialize new columns with sensible defaults

-- Mark existing jobs as "completed" with single-phase data
UPDATE enrichment_jobs
SET
  completed_phases = ARRAY['single_phase_extract'],
  current_phase = NULL
WHERE status = 'completed' AND completed_phases IS NULL;

-- Initialize sources from raw_data if available
UPDATE enrichment_jobs
SET sources = jsonb_build_object(
  'company_name', ARRAY[normalized_url],
  'company_description', ARRAY[normalized_url],
  'company_industry', ARRAY[normalized_url]
)
WHERE status = 'completed' AND sources IS NULL AND normalized_url IS NOT NULL;

-- ============================================================================
-- PART 5: Add helpful views for analytics
-- ============================================================================

-- View: Batch progress summary
CREATE OR REPLACE VIEW batch_progress_summary AS
SELECT
  b.id,
  b.total_rows,
  b.completed_rows,
  b.failed_rows,
  b.status,
  b.progress_percentage,
  b.user_id,
  b.started_at,
  b.completed_at,
  EXTRACT(EPOCH FROM (COALESCE(b.completed_at, NOW()) - b.started_at)) AS duration_seconds,
  ROUND((b.completed_rows::DECIMAL / NULLIF(b.total_rows, 0)) * 100, 2) AS actual_completion_percentage,
  COUNT(DISTINCT j.current_phase) AS active_phases
FROM enrichment_batches b
LEFT JOIN enrichment_jobs j ON j.batch_id = b.id AND j.status = 'processing'
GROUP BY b.id;

-- View: Agent performance metrics
CREATE OR REPLACE VIEW agent_performance_metrics AS
SELECT
  agent_name,
  COUNT(*) AS total_executions,
  COUNT(*) FILTER (WHERE status = 'completed') AS successful_executions,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_executions,
  ROUND(AVG(duration_ms), 2) AS avg_duration_ms,
  ROUND(AVG(api_calls_made), 2) AS avg_api_calls,
  SUM(cost_usd) AS total_cost_usd,
  ROUND(AVG(cost_usd), 6) AS avg_cost_usd
FROM agent_execution_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY agent_name
ORDER BY total_executions DESC;

-- ============================================================================
-- PART 6: Add update trigger for updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to enrichment_batches
DROP TRIGGER IF EXISTS update_enrichment_batches_updated_at ON enrichment_batches;
CREATE TRIGGER update_enrichment_batches_updated_at
  BEFORE UPDATE ON enrichment_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('enrichment_batches', 'agent_execution_logs')
ORDER BY table_name;

-- Verify new columns exist on enrichment_jobs
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'enrichment_jobs'
  AND column_name IN ('batch_id', 'discovery_data', 'profile_data', 'funding_data', 'tech_stack_data', 'custom_fields_data', 'sources', 'icp_fit_score')
ORDER BY column_name;

-- ============================================================================
-- ROLLBACK SCRIPT (if needed)
-- ============================================================================
/*
-- To rollback this migration:

DROP VIEW IF EXISTS batch_progress_summary;
DROP VIEW IF EXISTS agent_performance_metrics;
DROP TABLE IF EXISTS agent_execution_logs CASCADE;

ALTER TABLE enrichment_jobs
  DROP COLUMN IF EXISTS batch_id,
  DROP COLUMN IF EXISTS discovery_data,
  DROP COLUMN IF EXISTS profile_data,
  DROP COLUMN IF EXISTS funding_data,
  DROP COLUMN IF EXISTS tech_stack_data,
  DROP COLUMN IF EXISTS custom_fields_data,
  DROP COLUMN IF EXISTS sources,
  DROP COLUMN IF EXISTS current_phase,
  DROP COLUMN IF EXISTS completed_phases,
  DROP COLUMN IF EXISTS failed_phase,
  DROP COLUMN IF EXISTS phase_error_message,
  DROP COLUMN IF EXISTS icp_fit_score,
  DROP COLUMN IF EXISTS icp_fit_reasons,
  DROP COLUMN IF EXISTS buying_signals;

DROP TABLE IF EXISTS enrichment_batches CASCADE;
*/
