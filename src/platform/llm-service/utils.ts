/**
 * LLM Service Utilities
 *
 * Helpers for validation, parsing, and error handling
 */

import type { z } from "zod"

/**
 * Strip markdown code fences from LLM output
 *
 * Handles:
 * - ```json ... ```
 * - ```typescript ... ```
 * - ``` ... ```
 * - Plain text
 */
export function stripMarkdownFences(text: string): string {
  // Trim whitespace first
  let cleaned = text.trim()

  // Match code blocks with optional language specifier
  const fenceRegex = /^```(?:\w+)?\s*\n?([\s\S]*?)\n?```$/
  const match = cleaned.match(fenceRegex)

  if (match) {
    cleaned = match[1].trim()
  }

  return cleaned
}

/**
 * Parse JSON safely with fence stripping
 */
export function parseJSON<T>(text: string): T {
  const cleaned = stripMarkdownFences(text)

  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try to extract JSON from the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    throw new Error(`Failed to parse JSON: ${cleaned.slice(0, 100)}...`)
  }
}

export interface ValidationOptions {
  maxRetries?: number
  onRetry?: (attempt: number, error: unknown) => void
  safeModeSchema?: z.ZodTypeAny
}

/**
 * Validate data against schema with retry support
 *
 * On validation failure:
 * 1. Retry up to maxRetries times
 * 2. Fall back to safeModeSchema if provided
 * 3. Throw on complete failure
 */
export async function validateWithRetry<T>(
  data: unknown,
  schema: z.ZodType<T>,
  options: ValidationOptions = {}
): Promise<{ data: T; usedSafeMode: boolean }> {
  const { maxRetries = 0, onRetry, safeModeSchema } = options
  let lastError: unknown

  // Try primary schema
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = schema.parse(data)
      return { data: result, usedSafeMode: false }
    } catch (error) {
      lastError = error
      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, error)
      }
    }
  }

  // Try safe mode schema if provided
  if (safeModeSchema) {
    try {
      const result = safeModeSchema.parse(data) as T
      return { data: result, usedSafeMode: true }
    } catch {
      // Continue to throw primary error
    }
  }

  throw lastError
}

/**
 * Detect if an error is a credit/quota error
 */
export function isQuotaError(error: unknown): boolean {
  if (!error) return false

  const errorMessage = error instanceof Error ? error.message : String(error)
  const creditIndicators = [
    "credit balance",
    "insufficient funds",
    "insufficient_quota",
    "quota exceeded",
    "billing",
    "payment required",
    "rate limit",
  ]

  const hasCreditsMessage = creditIndicators.some((indicator) =>
    errorMessage.toLowerCase().includes(indicator)
  )

  const hasQuotaStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error.status === 400 || error.status === 402 || error.status === 429)

  return hasCreditsMessage || hasQuotaStatus
}

/**
 * Sleep helper for retry delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(attempt: number, baseMs: number = 1000): number {
  return Math.min(baseMs * Math.pow(2, attempt), 30000)
}
