/**
 * Data Quality Metrics Collector
 *
 * T-007: Track extraction success rate, enrichment field population, and LLM fallback usage.
 * Uses rolling windows (1h default) for aggregation.
 */

import type {
  MetricEvent,
  MetricType,
  Primitive,
  AggregatedMetrics,
  DomainMetrics,
  UserMetrics,
  EnrichmentFieldStats,
  EnrichmentQualityReport,
} from "./types"

// ============================================
// In-Memory Metrics Store (1h rolling window)
// ============================================

const DEFAULT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_EVENTS_PER_PRIMITIVE = 10000

class MetricsStore {
  private events: Map<Primitive, MetricEvent[]> = new Map()
  private windowMs: number

  constructor(windowMs = DEFAULT_WINDOW_MS) {
    this.windowMs = windowMs
    // Initialize for all primitives
    const primitives: Primitive[] = ["extract", "observe", "scout", "enrich", "agent"]
    for (const p of primitives) {
      this.events.set(p, [])
    }
  }

  record(event: MetricEvent): void {
    const primitive = event.primitive
    const events = this.events.get(primitive) || []

    events.push(event)

    // Prune old events and cap size
    const cutoff = Date.now() - this.windowMs
    const pruned = events.filter((e) => e.timestamp > cutoff).slice(-MAX_EVENTS_PER_PRIMITIVE)
    this.events.set(primitive, pruned)
  }

  getEvents(primitive: Primitive): MetricEvent[] {
    const cutoff = Date.now() - this.windowMs
    return (this.events.get(primitive) || []).filter((e) => e.timestamp > cutoff)
  }

  getAllEvents(): MetricEvent[] {
    const cutoff = Date.now() - this.windowMs
    const all: MetricEvent[] = []
    for (const events of Array.from(this.events.values())) {
      all.push(...events.filter((e) => e.timestamp > cutoff))
    }
    return all
  }

  clear(primitive?: Primitive): void {
    if (primitive) {
      this.events.set(primitive, [])
    } else {
      for (const p of Array.from(this.events.keys())) {
        this.events.set(p, [])
      }
    }
  }
}

// Singleton store
const metricsStore = new MetricsStore()

// ============================================
// Recording Functions
// ============================================

export function recordMetric(
  type: MetricType,
  primitive: Primitive,
  success: boolean,
  options: {
    userId?: string
    domain?: string
    durationMs?: number
    metadata?: Record<string, unknown>
  } = {}
): void {
  const event: MetricEvent = {
    type,
    primitive,
    timestamp: Date.now(),
    success,
    userId: options.userId,
    domain: options.domain,
    durationMs: options.durationMs,
    metadata: options.metadata,
  }
  metricsStore.record(event)
}

/**
 * Record an extraction attempt
 */
export function recordExtraction(
  primitive: Primitive,
  success: boolean,
  options: {
    userId?: string
    domain?: string
    durationMs?: number
    error?: string
  } = {}
): void {
  recordMetric(success ? "extraction_success" : "extraction_failure", primitive, success, {
    userId: options.userId,
    domain: options.domain,
    durationMs: options.durationMs,
    metadata: options.error ? { error: options.error } : undefined,
  })
}

/**
 * Record LLM fallback usage (Safe Mode activated)
 */
export function recordLLMFallback(
  primitive: Primitive,
  options: {
    userId?: string
    reason?: string
    originalProvider?: string
    fallbackProvider?: string
  } = {}
): void {
  recordMetric("llm_fallback_usage", primitive, false, {
    userId: options.userId,
    metadata: {
      reason: options.reason,
      originalProvider: options.originalProvider,
      fallbackProvider: options.fallbackProvider,
    },
  })
}

/**
 * Record an LLM request
 */
export function recordLLMRequest(
  primitive: Primitive,
  success: boolean,
  options: {
    provider?: string
    model?: string
    durationMs?: number
    usedSafeMode?: boolean
  } = {}
): void {
  recordMetric("llm_request", primitive, success, {
    durationMs: options.durationMs,
    metadata: {
      provider: options.provider,
      model: options.model,
      usedSafeMode: options.usedSafeMode,
    },
  })
}

/**
 * Record a Firecrawl request
 */
export function recordFirecrawlRequest(
  primitive: Primitive,
  success: boolean,
  options: {
    url?: string
    durationMs?: number
    attempts?: number
    errorCode?: string
  } = {}
): void {
  recordMetric("firecrawl_request", primitive, success, {
    domain: options.url,
    durationMs: options.durationMs,
    metadata: {
      attempts: options.attempts,
      errorCode: options.errorCode,
    },
  })
}

// ============================================
// Aggregation Functions
// ============================================

export function getAggregatedMetrics(primitive: Primitive): AggregatedMetrics {
  const events = metricsStore.getEvents(primitive)
  const now = Date.now()
  const windowStart = now - DEFAULT_WINDOW_MS

  const totalRequests = events.length
  const successfulRequests = events.filter((e) => e.success).length
  const failedRequests = totalRequests - successfulRequests
  const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 1

  const durations = events.filter((e) => e.durationMs != null).map((e) => e.durationMs!)
  const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0

  const llmFallbackEvents = events.filter((e) => e.type === "llm_fallback_usage")
  const llmFallbackCount = llmFallbackEvents.length
  const llmFallbackRate = totalRequests > 0 ? llmFallbackCount / totalRequests : 0

  // Domain breakdown
  const byDomain: Record<string, DomainMetrics> = {}
  for (const event of events) {
    if (event.domain) {
      if (!byDomain[event.domain]) {
        byDomain[event.domain] = {
          domain: event.domain,
          requests: 0,
          successes: 0,
          failures: 0,
          successRate: 0,
        }
      }
      byDomain[event.domain].requests++
      if (event.success) {
        byDomain[event.domain].successes++
      } else {
        byDomain[event.domain].failures++
      }
    }
  }
  for (const d of Object.values(byDomain)) {
    d.successRate = d.requests > 0 ? d.successes / d.requests : 1
  }

  // User breakdown
  const byUser: Record<string, UserMetrics> = {}
  for (const event of events) {
    if (event.userId) {
      if (!byUser[event.userId]) {
        byUser[event.userId] = {
          userId: event.userId,
          requests: 0,
          successes: 0,
          failures: 0,
          successRate: 0,
        }
      }
      byUser[event.userId].requests++
      if (event.success) {
        byUser[event.userId].successes++
      } else {
        byUser[event.userId].failures++
      }
    }
  }
  for (const u of Object.values(byUser)) {
    u.successRate = u.requests > 0 ? u.successes / u.requests : 1
  }

  return {
    primitive,
    windowStart,
    windowEnd: now,
    totalRequests,
    successfulRequests,
    failedRequests,
    successRate,
    avgDurationMs,
    llmFallbackCount,
    llmFallbackRate,
    byDomain: Object.keys(byDomain).length > 0 ? byDomain : undefined,
    byUser: Object.keys(byUser).length > 0 ? byUser : undefined,
  }
}

export function getAllPrimitiveMetrics(): Record<Primitive, AggregatedMetrics> {
  const primitives: Primitive[] = ["extract", "observe", "scout", "enrich", "agent"]
  const result: Record<string, AggregatedMetrics> = {}
  for (const p of primitives) {
    result[p] = getAggregatedMetrics(p)
  }
  return result as Record<Primitive, AggregatedMetrics>
}

// ============================================
// Enrichment Field Population Analysis
// ============================================

const ENRICH_CORE_FIELDS = [
  "company_name",
  "domain",
  "description",
  "industry",
  "employee_count",
  "funding_stage",
  "tech_stack",
  "location",
]

export function analyzeEnrichmentQuality(
  records: Array<Record<string, unknown>>
): EnrichmentQualityReport {
  const totalEnrichments = records.length
  if (totalEnrichments === 0) {
    return {
      totalEnrichments: 0,
      avgFieldPopulation: 0,
      fieldStats: [],
      lowPopulationFields: [],
    }
  }

  const fieldStats: EnrichmentFieldStats[] = []
  let totalPopulation = 0

  for (const fieldName of ENRICH_CORE_FIELDS) {
    const populatedCount = records.filter((r) => {
      const value = r[fieldName]
      if (value === null || value === undefined) return false
      if (typeof value === "string" && value.trim() === "") return false
      if (Array.isArray(value) && value.length === 0) return false
      return true
    }).length

    const populationRate = populatedCount / totalEnrichments
    totalPopulation += populationRate

    fieldStats.push({
      fieldName,
      totalRecords: totalEnrichments,
      populatedCount,
      populationRate,
    })
  }

  const avgFieldPopulation = totalPopulation / ENRICH_CORE_FIELDS.length
  const lowPopulationFields = fieldStats
    .filter((f) => f.populationRate < 0.5)
    .map((f) => f.fieldName)

  return {
    totalEnrichments,
    avgFieldPopulation,
    fieldStats,
    lowPopulationFields,
  }
}

// ============================================
// Utility for testing/debugging
// ============================================

export function clearMetrics(primitive?: Primitive): void {
  metricsStore.clear(primitive)
}

export function getMetricsStore(): MetricsStore {
  return metricsStore
}
