/**
 * Data Quality Alerts
 *
 * T-007: Define thresholds and alert channels (Slack/email/console).
 * Triggers alerts when metrics breach configured thresholds.
 */

import type {
  Alert,
  AlertConfig,
  AlertSeverity,
  AlertThreshold,
  Primitive,
  MetricType,
} from "./types"
import { getAggregatedMetrics } from "./metrics"

// ============================================
// Default Thresholds
// ============================================

const DEFAULT_THRESHOLDS: AlertThreshold[] = [
  // Extract: alert if success rate drops below 80%
  {
    metric: "extraction_success",
    primitive: "extract",
    minSuccessRate: 0.8,
    windowMinutes: 60,
  },
  // Enrich: alert if success rate drops below 75%
  {
    metric: "extraction_success",
    primitive: "enrich",
    minSuccessRate: 0.75,
    windowMinutes: 60,
  },
  // Observe: alert if success rate drops below 85%
  {
    metric: "extraction_success",
    primitive: "observe",
    minSuccessRate: 0.85,
    windowMinutes: 60,
  },
  // Scout: alert if success rate drops below 80%
  {
    metric: "extraction_success",
    primitive: "scout",
    minSuccessRate: 0.8,
    windowMinutes: 60,
  },
  // LLM fallback: alert if more than 20% of requests use fallback
  {
    metric: "llm_fallback_usage",
    primitive: "enrich",
    maxFallbackRate: 0.2,
    windowMinutes: 60,
  },
  {
    metric: "llm_fallback_usage",
    primitive: "extract",
    maxFallbackRate: 0.2,
    windowMinutes: 60,
  },
]

// ============================================
// Alert State (cooldown tracking)
// ============================================

const alertCooldowns: Map<string, number> = new Map()

function getAlertKey(primitive: Primitive, metric: MetricType): string {
  return `${primitive}:${metric}`
}

function isInCooldown(primitive: Primitive, metric: MetricType, cooldownMs: number): boolean {
  const key = getAlertKey(primitive, metric)
  const lastTriggered = alertCooldowns.get(key)
  if (!lastTriggered) return false
  return Date.now() - lastTriggered < cooldownMs
}

function setCooldown(primitive: Primitive, metric: MetricType): void {
  const key = getAlertKey(primitive, metric)
  alertCooldowns.set(key, Date.now())
}

// ============================================
// Alert Generation
// ============================================

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function determineSeverity(
  threshold: AlertThreshold,
  currentValue: number,
  thresholdValue: number
): AlertSeverity {
  // Critical if more than 50% worse than threshold
  if (threshold.minSuccessRate) {
    if (currentValue < thresholdValue * 0.5) return "critical"
  }
  if (threshold.maxFallbackRate) {
    if (currentValue > thresholdValue * 2) return "critical"
  }
  return "warning"
}

export function checkThresholds(config: AlertConfig = getDefaultConfig()): Alert[] {
  const alerts: Alert[] = []
  const cooldownMs = config.cooldownMinutes * 60 * 1000

  for (const threshold of config.thresholds) {
    // Skip if in cooldown
    if (isInCooldown(threshold.primitive, threshold.metric, cooldownMs)) {
      continue
    }

    const metrics = getAggregatedMetrics(threshold.primitive)

    // Check success rate threshold
    if (threshold.minSuccessRate !== undefined) {
      if (metrics.successRate < threshold.minSuccessRate && metrics.totalRequests > 5) {
        const severity = determineSeverity(threshold, metrics.successRate, threshold.minSuccessRate)
        alerts.push({
          id: generateAlertId(),
          severity,
          primitive: threshold.primitive,
          metric: threshold.metric,
          message: `${threshold.primitive} success rate (${(metrics.successRate * 100).toFixed(1)}%) below threshold (${(threshold.minSuccessRate * 100).toFixed(1)}%)`,
          currentValue: metrics.successRate,
          threshold: threshold.minSuccessRate,
          triggeredAt: Date.now(),
          metadata: {
            totalRequests: metrics.totalRequests,
            failedRequests: metrics.failedRequests,
          },
        })
        setCooldown(threshold.primitive, threshold.metric)
      }
    }

    // Check fallback rate threshold
    if (threshold.maxFallbackRate !== undefined) {
      if (metrics.llmFallbackRate > threshold.maxFallbackRate && metrics.totalRequests > 5) {
        const severity = determineSeverity(threshold, metrics.llmFallbackRate, threshold.maxFallbackRate)
        alerts.push({
          id: generateAlertId(),
          severity,
          primitive: threshold.primitive,
          metric: threshold.metric,
          message: `${threshold.primitive} LLM fallback rate (${(metrics.llmFallbackRate * 100).toFixed(1)}%) exceeds threshold (${(threshold.maxFallbackRate * 100).toFixed(1)}%)`,
          currentValue: metrics.llmFallbackRate,
          threshold: threshold.maxFallbackRate,
          triggeredAt: Date.now(),
          metadata: {
            llmFallbackCount: metrics.llmFallbackCount,
            totalRequests: metrics.totalRequests,
          },
        })
        setCooldown(threshold.primitive, threshold.metric)
      }
    }

    // Check max failure count
    if (threshold.maxFailureCount !== undefined) {
      if (metrics.failedRequests > threshold.maxFailureCount) {
        alerts.push({
          id: generateAlertId(),
          severity: "warning",
          primitive: threshold.primitive,
          metric: threshold.metric,
          message: `${threshold.primitive} failure count (${metrics.failedRequests}) exceeds threshold (${threshold.maxFailureCount})`,
          currentValue: metrics.failedRequests,
          threshold: threshold.maxFailureCount,
          triggeredAt: Date.now(),
        })
        setCooldown(threshold.primitive, threshold.metric)
      }
    }
  }

  return alerts
}

// ============================================
// Alert Dispatch
// ============================================

export async function dispatchAlerts(
  alerts: Alert[],
  config: AlertConfig = getDefaultConfig()
): Promise<void> {
  if (alerts.length === 0) return

  for (const channel of config.channels) {
    switch (channel) {
      case "console":
        dispatchToConsole(alerts)
        break
      case "slack":
        if (config.slackWebhookUrl) {
          await dispatchToSlack(alerts, config.slackWebhookUrl)
        }
        break
      case "email":
        if (config.emailRecipients && config.emailRecipients.length > 0) {
          await dispatchToEmail(alerts, config.emailRecipients)
        }
        break
    }
  }
}

function dispatchToConsole(alerts: Alert[]): void {
  for (const alert of alerts) {
    const level = alert.severity === "critical" ? "error" : "warn"
    console[level](`[ALERT:${alert.severity.toUpperCase()}]`, alert.message, {
      primitive: alert.primitive,
      metric: alert.metric,
      currentValue: alert.currentValue,
      threshold: alert.threshold,
      metadata: alert.metadata,
    })
  }
}

async function dispatchToSlack(alerts: Alert[], webhookUrl: string): Promise<void> {
  const blocks = alerts.map((alert) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `*${alert.severity === "critical" ? "🔴" : "🟡"} ${alert.severity.toUpperCase()}*\n${alert.message}\n_Primitive: ${alert.primitive} | Metric: ${alert.metric}_`,
    },
  }))

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    })
  } catch (error) {
    console.error("[Alerts] Failed to dispatch to Slack:", error)
  }
}

async function dispatchToEmail(alerts: Alert[], recipients: string[]): Promise<void> {
  // Integration point for Resend or other email service
  // For now, log the intent
  console.info("[Alerts] Email dispatch requested", {
    alertCount: alerts.length,
    recipients,
    alerts: alerts.map((a) => ({
      severity: a.severity,
      message: a.message,
    })),
  })
}

// ============================================
// Config Helper
// ============================================

export function getDefaultConfig(): AlertConfig {
  return {
    thresholds: DEFAULT_THRESHOLDS,
    channels: ["console"],
    slackWebhookUrl: process.env.SLACK_ALERT_WEBHOOK_URL,
    emailRecipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(",").map((e) => e.trim()),
    cooldownMinutes: 15,
  }
}

export function createAlertConfig(overrides: Partial<AlertConfig>): AlertConfig {
  const defaults = getDefaultConfig()
  return {
    ...defaults,
    ...overrides,
    thresholds: overrides.thresholds ?? defaults.thresholds,
    channels: overrides.channels ?? defaults.channels,
  }
}

// ============================================
// Utility
// ============================================

export function clearCooldowns(): void {
  alertCooldowns.clear()
}
