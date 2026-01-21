/**
 * LLM Provider Comparison Harness
 *
 * Compare responses from multiple providers against shared schemas
 */

import type { z } from "zod"
import { generateObject, generateText, type GenerateObjectOptions, type GenerateTextOptions } from "./operations"
import type { LLMProvider, LLMResponse } from "./types"

export interface HarnessResult<T = string> {
  provider: LLMProvider
  model: string
  success: boolean
  data?: T
  error?: string
  durationMs: number
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface ComparisonResult<T = string> {
  results: HarnessResult<T>[]
  fastest?: HarnessResult<T>
  allSucceeded: boolean
  summary: {
    successful: number
    failed: number
    averageDurationMs: number
  }
}

/**
 * Compare text generation across multiple providers
 */
export async function compareText(
  options: Omit<GenerateTextOptions, "provider">,
  providers: LLMProvider[] = ["anthropic", "openai"]
): Promise<ComparisonResult<string>> {
  const results: HarnessResult<string>[] = []

  await Promise.all(
    providers.map(async (provider) => {
      const start = Date.now()
      try {
        const response = await generateText({ ...options, provider })
        results.push({
          provider,
          model: response.model,
          success: true,
          data: response.data,
          durationMs: response.durationMs,
          usage: response.usage,
        })
      } catch (error) {
        results.push({
          provider,
          model: options.model ?? "default",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        })
      }
    })
  )

  return summarizeResults(results)
}

/**
 * Compare object generation across multiple providers
 */
export async function compareObject<T extends z.ZodTypeAny>(
  options: Omit<GenerateObjectOptions<T>, "provider">,
  providers: LLMProvider[] = ["anthropic", "openai"]
): Promise<ComparisonResult<z.infer<T>>> {
  const results: HarnessResult<z.infer<T>>[] = []

  await Promise.all(
    providers.map(async (provider) => {
      const start = Date.now()
      try {
        const response = await generateObject({ ...options, provider })
        results.push({
          provider,
          model: response.model,
          success: true,
          data: response.data,
          durationMs: response.durationMs,
          usage: response.usage,
        })
      } catch (error) {
        results.push({
          provider,
          model: options.model ?? "default",
          success: false,
          error: error instanceof Error ? error.message : String(error),
          durationMs: Date.now() - start,
        })
      }
    })
  )

  return summarizeResults(results)
}

function summarizeResults<T>(results: HarnessResult<T>[]): ComparisonResult<T> {
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  const fastest = successful.length > 0
    ? successful.reduce((a, b) => (a.durationMs < b.durationMs ? a : b))
    : undefined

  const averageDurationMs = successful.length > 0
    ? Math.round(successful.reduce((sum, r) => sum + r.durationMs, 0) / successful.length)
    : 0

  return {
    results,
    fastest,
    allSucceeded: failed.length === 0,
    summary: {
      successful: successful.length,
      failed: failed.length,
      averageDurationMs,
    },
  }
}

/**
 * Log comparison results in a readable format
 */
export function logComparisonResults<T>(
  comparison: ComparisonResult<T>,
  label?: string
): void {
  console.log(`\n=== LLM Comparison${label ? `: ${label}` : ""} ===`)
  console.log(`Total: ${comparison.results.length} providers`)
  console.log(`Success: ${comparison.summary.successful}`)
  console.log(`Failed: ${comparison.summary.failed}`)
  console.log(`Avg Duration: ${comparison.summary.averageDurationMs}ms`)

  if (comparison.fastest) {
    console.log(`Fastest: ${comparison.fastest.provider} (${comparison.fastest.durationMs}ms)`)
  }

  console.log("\n--- Details ---")
  for (const result of comparison.results) {
    const status = result.success ? "✓" : "✗"
    const info = result.success
      ? `${result.durationMs}ms`
      : result.error?.slice(0, 50)
    console.log(`${status} ${result.provider} (${result.model}): ${info}`)
  }
}
