/**
 * Data Quality Metrics & Alerts Types
 * 
 * T-007: Defines types for extraction success rate, enrichment field population,
 * LLM fallback usage, thresholds, and alert channels.
 */

// ============================================
// Metric Types
// ============================================

export type Primitive = "extract" | "observe" | "scout" | "enrich" | "agent"

export type MetricType =
  | "extraction_success"
  | "extraction_failure"
  | "enrichment_field_population"
  | "llm_fallback_usage"
  | "llm_request"
  | "firecrawl_request"
  | "api_request"

export interface MetricEvent {
  type: MetricType
  primitive: Primitive
  timestamp: number
  userId?: string
  domain?: string
  success: boolean
  durationMs?: number
  metadata?: Record<string, unknown>
}

export interface AggregatedMetrics {
  primitive: Primitive
  windowStart: number
  windowEnd: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  successRate: number
  avgDurationMs: number
  llmFallbackCount: number
  llmFallbackRate: number
  byDomain?: Record<string, DomainMetrics>
  byUser?: Record<string, UserMetrics>
}

export interface DomainMetrics {
  domain: string
  requests: number
  successes: number
  failures: number
  successRate: number
}

export interface UserMetrics {
  userId: string
  requests: number
  successes: number
  failures: number
  successRate: number
}

// ============================================
// Threshold & Alert Types
// ============================================

export interface AlertThreshold {
  metric: MetricType
  primitive: Primitive
  minSuccessRate?: number
  maxFailureCount?: number
  maxFallbackRate?: number
  windowMinutes: number
}

export type AlertSeverity = "warning" | "critical"

export type AlertChannel = "slack" | "email" | "console"

export interface AlertConfig {
  thresholds: AlertThreshold[]
  channels: AlertChannel[]
  slackWebhookUrl?: string
  emailRecipients?: string[]
  cooldownMinutes: number
}

export interface Alert {
  id: string
  severity: AlertSeverity
  primitive: Primitive
  metric: MetricType
  message: string
  currentValue: number
  threshold: number
  triggeredAt: number
  metadata?: Record<string, unknown>
}

// ============================================
// Field Population Types (for Enrich)
// ============================================

export interface EnrichmentFieldStats {
  fieldName: string
  totalRecords: number
  populatedCount: number
  populationRate: number
}

export interface EnrichmentQualityReport {
  totalEnrichments: number
  avgFieldPopulation: number
  fieldStats: EnrichmentFieldStats[]
  lowPopulationFields: string[]
}

// ============================================
// Dashboard Types
// ============================================

export interface MetricsSummary {
  primitives: Record<Primitive, AggregatedMetrics>
  alerts: Alert[]
  lastUpdated: number
}
