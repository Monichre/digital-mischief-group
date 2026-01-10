export type ResearchDepth = "quick" | "standard" | "deep"
export type ResearchStatus = "pending" | "running" | "completed" | "failed"

export interface ResearchFinding {
  title: string
  content: string
  source: string
  url?: string
  relevance: number
  category: "fact" | "insight" | "trend" | "competitor" | "opportunity"
}

export interface ResearchMission {
  id: string
  name: string
  query: string
  status: ResearchStatus
  depth: ResearchDepth
  sources: string[]
  findings: ResearchFinding[]
  summary: string | null
  raw_results: Record<string, unknown> | null
  created_at: string
  completed_at: string | null
}

export interface ResearchRequest {
  name: string
  query: string
  depth?: ResearchDepth
  sources?: ("perplexity" | "exa" | "serper" | "firecrawl")[]
}
