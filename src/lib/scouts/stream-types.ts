// Sentinel/Scout streaming event types
// Follows the same pattern as enrich/stream-types.ts

export type SearchEngine = 'serper' | 'exa' | 'firecrawl'

export type ThoughtType = 'observation' | 'reasoning' | 'decision' | 'insight' | 'action'

export interface ConductorThought {
  type: ThoughtType
  content: string
  timestamp: number
  relatedPhase?: string
}

export interface SearchProgress {
  engine: SearchEngine
  status: 'starting' | 'searching' | 'completed' | 'failed'
  found: number
  new: number
  total: number
}

export interface AIInsight {
  type: 'competitive' | 'trend' | 'opportunity' | 'threat'
  title: string
  description: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
  metadata?: Record<string, unknown>
}

export interface CompetitiveIntel {
  competitor_name?: string
  action_type: 'product_launch' | 'pricing_change' | 'feature_release' | 'partnership' | 'funding' | 'other'
  summary: string
  impact: 'high' | 'medium' | 'low'
  url: string
}

export interface TrendSignal {
  trend_name: string
  strength: number // 0-100
  evidence: string[]
  emerging: boolean
}

export interface OpportunityScore {
  url: string
  title: string
  relevance_score: number // 0-100
  opportunity_type: string
  reasoning: string
}

// Streaming event types - following SSE pattern from enrich
export type SentinelStreamEvent =
  | {
      type: 'search_start'
      data: {
        engine: SearchEngine
        query: string
      }
    }
  | {
      type: 'search_progress'
      data: SearchProgress
    }
  | {
      type: 'search_complete'
      data: {
        engine: SearchEngine
        total: number
        newResults: number
        duration_ms: number
      }
    }
  | {
      type: 'deduplication'
      data: {
        before: number
        after: number
        duplicates_removed: number
      }
    }
  | {
      type: 'ai_analysis_start'
      data: {
        total_results: number
        phases: string[]
      }
    }
  | {
      type: 'ai_thought'
      data: ConductorThought
    }
  | {
      type: 'ai_phase_complete'
      data: {
        phase: string
        duration_ms: number
        insights_found: number
      }
    }
  | {
      type: 'insight_generated'
      data: AIInsight
    }
  | {
      type: 'competitive_intel'
      data: CompetitiveIntel
    }
  | {
      type: 'trend_detected'
      data: TrendSignal
    }
  | {
      type: 'storage_complete'
      data: {
        stored: number
        insights_saved: number
      }
    }
  | {
      type: 'complete'
      data: {
        success: true
        new_results: number
        total_searched: number
        insights: AIInsight[]
        competitive_intel: CompetitiveIntel[]
        trends: TrendSignal[]
        duration_ms: number
        run_id: string
      }
    }
  | {
      type: 'error'
      data: {
        message: string
        phase: string
        recoverable: boolean
      }
    }

// AI Analysis result structure
export interface SentinelAnalysis {
  competitive_intel: CompetitiveIntel[]
  trends: TrendSignal[]
  opportunities: OpportunityScore[]
  insights: AIInsight[]
  synthesis: string
  confidence_score: number
  thoughts: ConductorThought[]
}

// Database models for new tables
export interface SentinelInsight {
  id: string
  scout_id: string
  run_id: string | null
  insight_type: 'competitive' | 'trend' | 'opportunity' | 'threat'
  title: string
  description: string
  confidence_score: number
  actionable: boolean
  priority: 'high' | 'medium' | 'low'
  metadata: Record<string, unknown>
  created_at: string
}

export interface SentinelAgentRun {
  id: string
  scout_id: string
  search_results_count: number
  new_results_count: number
  analysis_duration_ms: number
  thoughts: ConductorThought[]
  insights_generated: number
  status: 'running' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}
