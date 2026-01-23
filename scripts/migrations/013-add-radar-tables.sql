-- Radar tables for real-time mentions and alerts

CREATE TABLE IF NOT EXISTS radar_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  terms TEXT[] NOT NULL,
  sources TEXT[] NOT NULL,
  notify_email TEXT,
  notify_webhook TEXT,
  cooldown_minutes INTEGER NOT NULL DEFAULT 60,
  check_interval_minutes INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  last_notification_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS radar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rule_id UUID NOT NULL REFERENCES radar_rules(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  matched_terms TEXT[] NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  seen BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rule_id, normalized_url)
);

CREATE TABLE IF NOT EXISTS radar_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  rule_count INTEGER NOT NULL DEFAULT 0,
  source_stats JSONB,
  error TEXT
);

CREATE TABLE IF NOT EXISTS radar_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES radar_rules(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_radar_events_user_rule ON radar_events(user_id, rule_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_radar_rules_user ON radar_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_radar_rules_next_run ON radar_rules(is_active, last_run_at);
CREATE INDEX IF NOT EXISTS idx_radar_notifications_rule ON radar_notifications(rule_id, sent_at DESC);
