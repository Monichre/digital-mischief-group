-- Migration to add missing columns to existing tables
-- Run this if your database was created with an older schema

-- Add normalized_url to enrichment_jobs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'enrichment_jobs' AND column_name = 'normalized_url'
  ) THEN
    ALTER TABLE enrichment_jobs ADD COLUMN normalized_url TEXT;
  END IF;
END $$;

-- Add status to usage_events if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'usage_events' AND column_name = 'status'
  ) THEN
    ALTER TABLE usage_events ADD COLUMN status TEXT NOT NULL DEFAULT 'unknown';
  END IF;
END $$;
