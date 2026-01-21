-- T-005: Observe Reliability Migration
-- Adds columns to support full content storage, diffs, webhooks, and notification suppression

-- Add new columns to monitors table
ALTER TABLE monitors 
ADD COLUMN IF NOT EXISTS last_content TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS notification_cooldown_minutes INTEGER DEFAULT 60;

-- Add new columns to monitor_changes table  
ALTER TABLE monitor_changes
ADD COLUMN IF NOT EXISTS old_content TEXT,
ADD COLUMN IF NOT EXISTS new_content TEXT,
ADD COLUMN IF NOT EXISTS diff_additions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS diff_deletions INTEGER DEFAULT 0;

-- Create notifications tracking table for suppression controls
CREATE TABLE IF NOT EXISTS monitor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monitor_id UUID NOT NULL REFERENCES monitors(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'webhook')),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient suppression lookups
CREATE INDEX IF NOT EXISTS idx_monitor_notifications_monitor_created 
ON monitor_notifications(monitor_id, created_at DESC);
