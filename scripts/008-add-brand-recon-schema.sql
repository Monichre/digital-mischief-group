-- Migration: Add Brand Recon Competitive Intelligence Schema
-- Description: Tables for competitive analysis and market positioning
-- Date: 2025-12-22
-- Dependencies: 005-add-enrichment-agent-schema.sql

-- ============================================================================
-- PART 1: Create brand_recon_jobs table
-- ============================================================================
-- Stores competitive intelligence and market positioning analysis

CREATE TABLE IF NOT EXISTS brand_recon_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source company (links to enrichment_jobs)
  enrichment_job_id UUID REFERENCES enrichment_jobs(id) ON DELETE CASCADE,
  source_company_name TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  source_industry TEXT,

  -- Competitive neighborhood (5-15 competitors discovered)
  competitors JSONB NOT NULL DEFAULT '[]',
  -- Example: [
  --   {
  --     "name": "Acme Corp",
  --     "domain": "acme.com",
  --     "positioning": "Enterprise workflow automation",
  --     "value_props": ["Fast", "Secure", "Scalable"],
  --     "price_tier": "enterprise",
  --     "segment": "enterprise",
  --     "website": "https://acme.com",
  --     "confidence": 0.92
  --   }
  -- ]

  -- Market positioning analysis
  positioning_statement TEXT,
  value_propositions TEXT[],
  target_segments TEXT[],
  differentiation_points TEXT[],

  -- Price tier classification
  price_tier TEXT CHECK (price_tier IN ('budget', 'mid-market', 'premium', 'enterprise')),
  pricing_model TEXT, -- "freemium", "subscription", "usage-based", "enterprise"

  -- Competitive landscape insights
  market_positioning_matrix JSONB,
  -- Example: {
  --   "quadrants": {
  --     "leaders": ["company1", "company2"],
  --     "challengers": ["company3"],
  --     "niche_players": ["company4"],
  --     "emerging": ["company5"]
  --   }
  -- }

  white_space_opportunities JSONB,
  -- Example: [
  --   {
  --     "opportunity": "AI-powered analytics for mid-market",
  --     "market_size": "estimated_medium",
  --     "competition_level": "low",
  --     "reasoning": "..."
  --   }
  -- ]

  -- Content generation
  email_templates JSONB,
  landing_page_variants JSONB,
  social_media_content JSONB,

  -- Metadata
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  sources JSONB, -- URLs used for competitive research

  -- Multi-tenancy
  user_id TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_enrichment_job_id ON brand_recon_jobs(enrichment_job_id);
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_user_id ON brand_recon_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_status ON brand_recon_jobs(status);
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_source_domain ON brand_recon_jobs(source_domain);
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_created_at ON brand_recon_jobs(created_at DESC);

-- Full-text search helper function (IMMUTABLE wrapper required for indexes)
CREATE OR REPLACE FUNCTION brand_recon_search_vector(positioning TEXT, value_props TEXT[])
RETURNS tsvector
LANGUAGE plpgsql
IMMUTABLE AS $$
BEGIN
  RETURN to_tsvector('english',
    COALESCE(positioning, '') || ' ' ||
    array_to_string(COALESCE(value_props, ARRAY[]::TEXT[]), ' ')
  );
END;
$$;

-- Full-text search index on positioning and value props
CREATE INDEX IF NOT EXISTS idx_brand_recon_jobs_positioning_search ON brand_recon_jobs
USING gin(brand_recon_search_vector(positioning_statement, value_propositions));

-- ============================================================================
-- PART 2: Add triggers for updated_at
-- ============================================================================

-- Create update_updated_at_column function if it doesn't exist (from migration 005)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_brand_recon_jobs_updated_at ON brand_recon_jobs;
CREATE TRIGGER update_brand_recon_jobs_updated_at
  BEFORE UPDATE ON brand_recon_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 3: Create helpful views
-- ============================================================================

-- View: Brand recon summary with enrichment context
CREATE OR REPLACE VIEW brand_recon_summary AS
SELECT
  br.id,
  br.source_company_name,
  br.source_domain,
  br.source_industry,
  jsonb_array_length(br.competitors) AS competitor_count,
  br.price_tier,
  br.positioning_statement,
  br.status,
  br.created_at,
  br.completed_at,
  ej.icp_fit_score,
  ej.employee_count AS source_employee_count,
  ej.funding_total AS source_funding
FROM brand_recon_jobs br
LEFT JOIN enrichment_jobs ej ON ej.id = br.enrichment_job_id
ORDER BY br.created_at DESC;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'brand_recon_jobs'
ORDER BY table_name;

-- Verify columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'brand_recon_jobs'
ORDER BY ordinal_position;
