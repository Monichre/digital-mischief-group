-- Migration: Daedalus workspace tasks and Delphi knowledge
-- Date: 2026-07-13
-- Dependencies: 002-add-auth-tables.sql

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS workspace_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (skill IN ('research', 'enrich', 'brand-recon', 'sentinels', 'observe', 'weaponize-browser')),
  primitive TEXT NOT NULL CHECK (primitive IN ('enrich', 'agent', 'extract', 'scout', 'observe')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'launched',
  target_href TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workspace_tasks_user_created
  ON workspace_tasks(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workspace_tasks_search
  ON workspace_tasks
  USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(prompt, '')));

CREATE TABLE IF NOT EXISTS workspace_rate_limits (
  user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('ingest', 'search')),
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_workspace_rate_window
  ON workspace_rate_limits(window_start);

CREATE TABLE IF NOT EXISTS knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('text', 'url', 'file')),
  title TEXT NOT NULL,
  source_url TEXT,
  file_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  blob_url TEXT,
  blob_pathname TEXT,
  content TEXT,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_user_created
  ON knowledge_sources(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_type
  ON knowledge_sources(user_id, source_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_sources_search
  ON knowledge_sources
  USING gin(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(content, '')));

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public."user"(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  token_estimate INTEGER NOT NULL DEFAULT 0,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_user_source
  ON knowledge_chunks(user_id, source_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_search
  ON knowledge_chunks
  USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding
  ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;
