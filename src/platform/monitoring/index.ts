/**
 * Data Quality Metrics & Alerts Module
 *
 * T-007: Platform monitoring for extraction success rate, enrichment field population,
 * LLM fallback usage, with configurable thresholds and alert channels.
 *
 * Usage:
 *   import { recordExtraction, checkAndDispatchAlerts, getMetricsSummary } from '@/platform/monitoring'
 *
 *   // Record metrics
 *   recordExtraction('enrich', true, { domain: 'example.com', durationMs: 1200 })
 *
 *   // Check thresholds and dispatch alerts
 *   await checkAndDispatchAlerts()
 *
 *   // Get summary for dashboard
 *   const summary = getMetricsSummary()
 */

export * from "./types"
export * from "./metrics"
export * from "./alerts"

import type { MetricsSummary, AlertConfig } from "./types"
import { getAllPrimitiveMetrics } from "./metrics"
import { checkThresholds, dispatchAlerts, getDefaultConfig } from "./alerts"

/**
 * Check all thresholds and dispatch alerts to configured channels
 */
export async function checkAndDispatchAlerts(
  config: AlertConfig = getDefaultConfig()
): Promise<void> {
  const alerts = checkThresholds(config)
  await dispatchAlerts(alerts, config)
}

/**
 * Get a complete metrics summary for dashboard display
 */
export function getMetricsSummary(): MetricsSummary {
  const primitives = getAllPrimitiveMetrics()
  const alerts = checkThresholds()

  return {
    primitives,
    alerts,
    lastUpdated: Date.now(),
  }
}
