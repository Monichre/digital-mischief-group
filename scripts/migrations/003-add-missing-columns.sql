-- Migration to add missing columns to existing tables
-- Run this if your database was created with an older schema

-- Add normalized_url to enrichment_jobs if it doesn't exist
ALTER TABLE enrichment_jobs
ADD COLUMN IF NOT EXISTS normalized_url TEXT;

-- Add status to usage_events if it doesn't exist
ALTER TABLE usage_events
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'unknown';
