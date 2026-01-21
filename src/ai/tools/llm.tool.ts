/**
 * LLM Tool - Backward Compatible Wrapper
 *
 * This module provides backward compatibility with the original API
 * while using the new unified LLM provider service under the hood.
 *
 * @deprecated Use `@/platform/llm-service` directly for new code
 */

import type { ToolSet } from "ai"
import { z } from "zod"
import {
  generateText as unifiedGenerateText,
  generateObject as unifiedGenerateObject,
  isQuotaError,
} from "@/platform/llm-service"
import { DEFAULT_JSON_MODEL, DEFAULT_TEXT_MODEL } from "@/ai/models"

export type LLMProvider = "ai-gateway"

export interface LLMResponse {
  text: string
  provider: LLMProvider
  model: string
}

export interface LLMRequestOptions {
  prompt: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
  model?: string
  tools?: ToolSet
  maxSteps?: number
}

/**
 * Check if error is a credit/quota error
 * @deprecated Use `isQuotaError` from `@/platform/llm-service` instead
 */
export function isLLMCreditError(error: unknown): boolean {
  return isQuotaError(error)
}

/**
 * Generate text with fallback handling
 * @deprecated Use `generateText` from `@/platform/llm-service` instead
 */
export async function generateWithFallback(options: LLMRequestOptions): Promise<LLMResponse> {
  const model = options.model ?? DEFAULT_TEXT_MODEL

  const result = await unifiedGenerateText({
    prompt: options.prompt,
    systemPrompt: options.systemPrompt,
    model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    tools: options.tools,
    maxSteps: options.maxSteps,
  })

  return {
    text: result.data,
    provider: "ai-gateway",
    model: result.model,
  }
}

/**
 * Generate structured object with schema validation
 * @deprecated Use `generateObject` from `@/platform/llm-service` instead
 */
export async function generateObjectWithFallback<TSchema extends z.ZodTypeAny>(options: {
  schema: TSchema
  prompt: string
  systemPrompt?: string
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
  maxSteps?: number
  safeModeSchema?: z.ZodTypeAny
}): Promise<{ object: z.infer<TSchema>; provider: LLMProvider; model: string }> {
  const model = options.model ?? DEFAULT_JSON_MODEL

  const result = await unifiedGenerateObject({
    schema: options.schema,
    prompt: options.prompt,
    systemPrompt: options.systemPrompt,
    model,
    maxTokens: options.maxTokens,
    temperature: options.temperature,
    tools: options.tools,
    maxSteps: options.maxSteps,
    safeModeSchema: options.safeModeSchema,
  })

  return {
    object: result.data,
    provider: "ai-gateway",
    model: result.model,
  }
}
