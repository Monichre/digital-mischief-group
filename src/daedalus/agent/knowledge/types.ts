export const KNOWLEDGE_SOURCE_TYPES = ['text', 'url', 'file'] as const

export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number]

export type KnowledgeSource = {
  id: string
  source_type: KnowledgeSourceType
  title: string
  source_url: string | null
  file_name: string | null
  mime_type: string | null
  size_bytes: number | null
  blob_pathname: string | null
  summary: string | null
  status: 'processing' | 'ready' | 'failed'
  error_message: string | null
  chunk_count: number
  created_at: string
}

export type KnowledgeSearchResult = {
  id: string
  source_id: string
  source_title: string
  source_type: KnowledgeSourceType
  content: string
  similarity: number | null
}
