-- DMG Intelligence Suite Database Schema
-- Run this script to create all necessary tables

-- Brand Extractions table
CREATE TABLE IF NOT EXISTS brand_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  
  -- Core branding data
  color_scheme TEXT,
  logo_url TEXT,
  colors JSONB,
  fonts JSONB,
  typography JSONB,
  spacing JSONB,
  components JSONB,
  images JSONB,
  animations JSONB,
  layout JSONB,
  personality JSONB,
  
  -- Metadata
  site_title TEXT,
  site_description TEXT,
  screenshot_url TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enrichment Jobs table
CREATE TABLE IF NOT EXISTS enrichment_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Input data
  input_type TEXT NOT NULL, -- 'url', 'email', 'domain', 'company_name'
  input_value TEXT NOT NULL,
  normalized_url TEXT,
  domain TEXT,
  
  -- Extracted company data
  company_name TEXT,
  company_description TEXT,
  company_logo TEXT,
  company_industry TEXT,
  company_size TEXT,
  company_founded TEXT,
  company_headquarters TEXT,
  company_website TEXT,
  
  -- Social profiles
  linkedin_url TEXT,
  twitter_url TEXT,
  facebook_url TEXT,
  crunchbase_url TEXT,
  
  -- Contact info
  contact_emails JSONB,
  contact_phones JSONB,
  
  -- Technology stack
  tech_stack JSONB,
  
  -- Financial data
  funding_total TEXT,
  funding_rounds JSONB,
  investors JSONB,
  
  -- Key people
  key_people JSONB,
  
  -- Full raw response
  raw_response JSONB,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Events table (for analytics)
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'brand_extraction', 'enrichment', 'search', etc.
  module TEXT NOT NULL, -- 'brand', 'enrich', 'scouts', 'observe'
  input_value TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_extractions_domain ON brand_extractions(domain);
CREATE INDEX IF NOT EXISTS idx_brand_extractions_status ON brand_extractions(status);
CREATE INDEX IF NOT EXISTS idx_brand_extractions_created ON brand_extractions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_domain ON enrichment_jobs(domain);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_status ON enrichment_jobs(status);
CREATE INDEX IF NOT EXISTS idx_enrichment_jobs_created ON enrichment_jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_module ON usage_events(module);
CREATE INDEX IF NOT EXISTS idx_usage_events_created ON usage_events(created_at DESC);
