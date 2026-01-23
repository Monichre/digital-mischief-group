-- Migration: Add Cortex dossiers table
-- Description: Stores saved intelligence dossiers for the Cortex vault
-- Date: 2026-01-26
-- Dependencies: 001-create-tables.sql, 002-add-auth-tables.sql

CREATE TABLE IF NOT EXISTS cortex_dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  enrichment_job_id UUID REFERENCES enrichment_jobs(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_name TEXT,
  target_identifier TEXT,
  directive TEXT NOT NULL,
  summary TEXT,
  dossier_json JSONB NOT NULL,
  search_text TEXT,
  logo_url TEXT,
  sources JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cortex_dossiers_user_id ON cortex_dossiers(user_id);
CREATE INDEX IF NOT EXISTS idx_cortex_dossiers_created_at ON cortex_dossiers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cortex_dossiers_directive ON cortex_dossiers(directive);

CREATE INDEX IF NOT EXISTS idx_cortex_dossiers_search ON cortex_dossiers
USING gin(to_tsvector('english', COALESCE(search_text, '')))
WHERE search_text IS NOT NULL;
