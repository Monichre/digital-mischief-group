-- Research missions table for storing live research results
-- Run: psql $DATABASE_URL -f scripts/006-add-research-missions-table.sql

CREATE TABLE IF NOT EXISTS research_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  query TEXT NOT NULL,
  depth VARCHAR(50) DEFAULT 'standard',
  sources TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  findings JSONB DEFAULT '[]',
  summary TEXT,
  error_message TEXT,
  user_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add user_id column if table exists but column doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'research_missions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE research_missions ADD COLUMN user_id VARCHAR(255);
  END IF;
END $$;

-- Add summary column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'research_missions' AND column_name = 'summary'
  ) THEN
    ALTER TABLE research_missions ADD COLUMN summary TEXT;
  END IF;
END $$;

-- Add findings column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'research_missions' AND column_name = 'findings'
  ) THEN
    ALTER TABLE research_missions ADD COLUMN findings JSONB DEFAULT '[]';
  END IF;
END $$;

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_research_missions_user_id ON research_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_research_missions_created_at ON research_missions(created_at DESC);
