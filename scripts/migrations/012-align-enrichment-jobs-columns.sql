-- Migration: Align enrichment_jobs columns with agent schema
-- Description: Adds missing columns used by enrichment APIs and backfills from legacy fields
-- Date: 2026-01-24
-- Dependencies: 001-create-tables.sql

-- ============================================================================
-- PART 1: Add missing columns used by the enrichment pipeline
-- ============================================================================

ALTER TABLE enrichment_jobs
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS employee_count TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INT,
  ADD COLUMN IF NOT EXISTS headquarters TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS technologies JSONB,
  ADD COLUMN IF NOT EXISTS leadership JSONB,
  ADD COLUMN IF NOT EXISTS raw_data JSONB,
  ADD COLUMN IF NOT EXISTS synthesis TEXT;

-- Agent phase columns (safe to add if older migrations were skipped)
ALTER TABLE enrichment_jobs
  ADD COLUMN IF NOT EXISTS discovery_data JSONB,
  ADD COLUMN IF NOT EXISTS profile_data JSONB,
  ADD COLUMN IF NOT EXISTS funding_data JSONB,
  ADD COLUMN IF NOT EXISTS tech_stack_data JSONB,
  ADD COLUMN IF NOT EXISTS custom_fields_data JSONB,
  ADD COLUMN IF NOT EXISTS sources JSONB,
  ADD COLUMN IF NOT EXISTS icp_fit_score INT CHECK (icp_fit_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS icp_fit_reasons TEXT[],
  ADD COLUMN IF NOT EXISTS buying_signals JSONB,
  ADD COLUMN IF NOT EXISTS completed_phases TEXT[],
  ADD COLUMN IF NOT EXISTS current_phase TEXT,
  ADD COLUMN IF NOT EXISTS failed_phase TEXT,
  ADD COLUMN IF NOT EXISTS phase_error_message TEXT;

-- ============================================================================
-- PART 2: Backfill new columns from legacy schema where possible
-- ============================================================================

UPDATE enrichment_jobs
SET
  industry = COALESCE(industry, company_industry),
  employee_count = COALESCE(employee_count, company_size),
  headquarters = COALESCE(headquarters, company_headquarters),
  website = COALESCE(website, company_website),
  technologies = COALESCE(technologies, tech_stack),
  leadership = COALESCE(leadership, key_people),
  raw_data = COALESCE(raw_data, raw_response)
WHERE
  industry IS NULL
  OR employee_count IS NULL
  OR headquarters IS NULL
  OR website IS NULL
  OR technologies IS NULL
  OR leadership IS NULL
  OR raw_data IS NULL;

UPDATE enrichment_jobs
SET founded_year = CASE
  WHEN founded_year IS NULL AND company_founded ~ '^[0-9]{4}$' THEN company_founded::INT
  ELSE founded_year
END
WHERE founded_year IS NULL AND company_founded IS NOT NULL;

-- ============================================================================
-- PART 3: Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_synthesis ON enrichment_jobs
USING gin(to_tsvector('english', synthesis))
WHERE synthesis IS NOT NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'enrichment_jobs'
  AND column_name IN (
    'industry',
    'employee_count',
    'founded_year',
    'headquarters',
    'website',
    'technologies',
    'leadership',
    'raw_data',
    'synthesis'
  )
ORDER BY column_name;
