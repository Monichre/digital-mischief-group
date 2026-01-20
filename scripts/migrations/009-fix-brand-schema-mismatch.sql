-- Fix schema mismatch between code and database

-- 1. Add missing columns to usage_events
ALTER TABLE usage_events
ADD COLUMN IF NOT EXISTS duration_ms INTEGER;

-- 2. Add missing columns to brand_extractions for the new extraction format
ALTER TABLE brand_extractions
ADD COLUMN IF NOT EXISTS input_url TEXT,
ADD COLUMN IF NOT EXISTS normalized_url TEXT,
ADD COLUMN IF NOT EXISTS colors JSONB,
ADD COLUMN IF NOT EXISTS fonts JSONB,
ADD COLUMN IF NOT EXISTS typography JSONB,
ADD COLUMN IF NOT EXISTS spacing JSONB,
ADD COLUMN IF NOT EXISTS components JSONB,
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS animations JSONB,
ADD COLUMN IF NOT EXISTS layout JSONB,
ADD COLUMN IF NOT EXISTS personality JSONB,
ADD COLUMN IF NOT EXISTS site_title TEXT,
ADD COLUMN IF NOT EXISTS site_description TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- 3. Populate input_url and normalized_url from existing url column if null
UPDATE brand_extractions
SET input_url = url,
    normalized_url = url
WHERE input_url IS NULL AND url IS NOT NULL;

-- 4. Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_brand_extractions_status_new ON brand_extractions(status)
WHERE status IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_brand_extractions_input_url ON brand_extractions(input_url);
