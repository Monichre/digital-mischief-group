-- Migration 010: Add AI analysis capabilities to Sentinels/Scouts
-- Adds fields for AI insights, competitive intelligence, and agent run tracking

-- Add AI analysis fields to scout_results table
ALTER TABLE scout_results
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS relevance_score FLOAT,
ADD COLUMN IF NOT EXISTS opportunity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20),
ADD COLUMN IF NOT EXISTS extracted_entities JSONB;

-- Create sentinel_insights table for AI-generated insights
CREATE TABLE IF NOT EXISTS sentinel_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  run_id UUID,
  insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('competitive', 'trend', 'opportunity', 'threat')),
  title TEXT NOT NULL,
  description TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 100),
  actionable BOOLEAN DEFAULT false,
  priority VARCHAR(20) CHECK (priority IN ('high', 'medium', 'low')),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for sentinel_insights
CREATE INDEX IF NOT EXISTS idx_sentinel_insights_scout_id ON sentinel_insights(scout_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_insights_run_id ON sentinel_insights(run_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_insights_type ON sentinel_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_sentinel_insights_priority ON sentinel_insights(priority);
CREATE INDEX IF NOT EXISTS idx_sentinel_insights_created_at ON sentinel_insights(created_at DESC);

-- Create sentinel_agent_runs table for tracking AI analysis runs
CREATE TABLE IF NOT EXISTS sentinel_agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  search_results_count INT NOT NULL DEFAULT 0,
  new_results_count INT NOT NULL DEFAULT 0,
  analysis_duration_ms INT,
  thoughts JSONB,
  insights_generated INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes for sentinel_agent_runs
CREATE INDEX IF NOT EXISTS idx_sentinel_agent_runs_scout_id ON sentinel_agent_runs(scout_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_agent_runs_status ON sentinel_agent_runs(status);
CREATE INDEX IF NOT EXISTS idx_sentinel_agent_runs_created_at ON sentinel_agent_runs(created_at DESC);

-- Create competitive_intel table for tracking competitor activity
CREATE TABLE IF NOT EXISTS competitive_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  run_id UUID REFERENCES sentinel_agent_runs(id) ON DELETE CASCADE,
  competitor_name VARCHAR(255),
  action_type VARCHAR(50) CHECK (action_type IN ('product_launch', 'pricing_change', 'feature_release', 'partnership', 'funding', 'other')),
  summary TEXT NOT NULL,
  impact VARCHAR(20) CHECK (impact IN ('high', 'medium', 'low')),
  url TEXT NOT NULL,
  discovered_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for competitive_intel
CREATE INDEX IF NOT EXISTS idx_competitive_intel_scout_id ON competitive_intel(scout_id);
CREATE INDEX IF NOT EXISTS idx_competitive_intel_run_id ON competitive_intel(run_id);
CREATE INDEX IF NOT EXISTS idx_competitive_intel_competitor ON competitive_intel(competitor_name);
CREATE INDEX IF NOT EXISTS idx_competitive_intel_action_type ON competitive_intel(action_type);
CREATE INDEX IF NOT EXISTS idx_competitive_intel_discovered_at ON competitive_intel(discovered_at DESC);

-- Create trends table for tracking market trends
CREATE TABLE IF NOT EXISTS sentinel_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES scouts(id) ON DELETE CASCADE,
  run_id UUID REFERENCES sentinel_agent_runs(id) ON DELETE CASCADE,
  trend_name VARCHAR(255) NOT NULL,
  strength INT CHECK (strength >= 0 AND strength <= 100),
  evidence JSONB,
  emerging BOOLEAN DEFAULT false,
  first_detected TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for sentinel_trends
CREATE INDEX IF NOT EXISTS idx_sentinel_trends_scout_id ON sentinel_trends(scout_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_trends_run_id ON sentinel_trends(run_id);
CREATE INDEX IF NOT EXISTS idx_sentinel_trends_strength ON sentinel_trends(strength DESC);
CREATE INDEX IF NOT EXISTS idx_sentinel_trends_emerging ON sentinel_trends(emerging);
CREATE INDEX IF NOT EXISTS idx_sentinel_trends_first_detected ON sentinel_trends(first_detected DESC);

-- Add comments for documentation
COMMENT ON TABLE sentinel_insights IS 'AI-generated insights from sentinel analysis';
COMMENT ON TABLE sentinel_agent_runs IS 'Tracks AI agent execution for each sentinel run';
COMMENT ON TABLE competitive_intel IS 'Competitive intelligence extracted from search results';
COMMENT ON TABLE sentinel_trends IS 'Market trends detected across sentinel runs';
