-- Create leads table for analytics and lead capture
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  type VARCHAR(50) NOT NULL, -- 'newsletter', 'waitlist', 'contact'
  feature VARCHAR(100), -- for waitlist leads
  source VARCHAR(50), -- 'time', 'scroll', 'exit', 'manual', etc.

  -- Visitor identification
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  landing_page VARCHAR(500),

  -- Engagement tracking
  interaction_count INTEGER DEFAULT 1,
  last_interaction TIMESTAMP,

  -- Additional metadata (JSON)
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT unique_email_type UNIQUE(email, type)
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_type ON leads(type);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Create analytics_events table for detailed event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,

  -- Event identification
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  event_label VARCHAR(255),

  -- User identification (nullable for anonymous users)
  user_id VARCHAR(100),
  session_id VARCHAR(100),

  -- Visitor data
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  page_path VARCHAR(500),

  -- Event properties (JSON)
  properties JSONB,

  -- Timestamps
  event_timestamp TIMESTAMP DEFAULT NOW(),

  -- Indexes for querying
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(event_timestamp DESC);

-- Create page_views table for basic traffic analytics
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,

  -- Page identification
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),

  -- User identification
  user_id VARCHAR(100),
  session_id VARCHAR(100),

  -- Visitor data
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,

  -- Engagement metrics
  time_on_page INTEGER, -- seconds
  scroll_depth INTEGER, -- percentage

  -- Timestamps
  viewed_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT page_views_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_timestamp ON page_views(viewed_at DESC);

-- Create visitor_sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,

  -- User identification (nullable for anonymous)
  user_id VARCHAR(100),

  -- Session data
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  landing_page VARCHAR(500),

  -- Location data (can be enriched with IP geolocation)
  country VARCHAR(100),
  city VARCHAR(100),

  -- Session metrics
  page_count INTEGER DEFAULT 1,
  event_count INTEGER DEFAULT 0,
  session_duration INTEGER, -- seconds

  -- Timestamps
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,

  CONSTRAINT visitor_sessions_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_user_id ON visitor_sessions(user_id);
CREATE INDEX idx_visitor_sessions_started ON visitor_sessions(started_at DESC);

-- Grant permissions (adjust as needed)
-- GRANT ALL ON leads TO your_db_user;
-- GRANT ALL ON analytics_events TO your_db_user;
-- GRANT ALL ON page_views TO your_db_user;
-- GRANT ALL ON visitor_sessions TO your_db_user;

COMMENT ON TABLE leads IS 'Captured leads from newsletter, waitlist, and contact forms';
COMMENT ON TABLE analytics_events IS 'Detailed event tracking for user interactions';
COMMENT ON TABLE page_views IS 'Page view tracking with engagement metrics';
COMMENT ON TABLE visitor_sessions IS 'Visitor session tracking for cohort analysis';
