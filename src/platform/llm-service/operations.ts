/**
 * LLM Operations
 *
 * High-level operations for text generation, object generation, and streaming
 */

import {
  generateText as aiGenerateText,
  generateObject as aiGenerateObject,
  streamText as aiStreamText,
  type ToolSet,
} from "ai"
import type { z } from "zod"
import { getLLMProvider } from "./provider"
import {
  type LLMProvider,
  type LLMResponse,
  createLLMError,
} from "./types"
import { stripMarkdownFences, isQuotaError, sleep, getBackoffDelay } from "./utils"
import { recordLLMRequest, recordLLMFallback } from "@/platform/monitoring"

export interface GenerateTextOptions {
  prompt: string
  systemPrompt?: string
  provider?: LLMProvider
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
  maxSteps?: number
  maxRetries?: number
}

export interface GenerateObjectOptions<T extends z.ZodTypeAny> {
  schema: T
  prompt: string
  systemPrompt?: string
  provider?: LLMProvider
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
  maxSteps?: number
  maxRetries?: number
  safeModeSchema?: z.ZodTypeAny
}

export interface StreamTextOptions {
  prompt: string
  systemPrompt?: string
  provider?: LLMProvider
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
  onChunk?: (chunk: string) => void
}

/**
 * Generate text with unified provider interface
 */
export async function generateText(
  options: GenerateTextOptions
): Promise<LLMResponse<string>> {
  const startTime = Date.now()
  const maxRetries = options.maxRetries ?? 2
  const providerName = options.provider ?? "anthropic"
  const { model, modelId } = getLLMProvider(providerName, options.model)

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await aiGenerateText({
        model: model as any,
        system: options.systemPrompt,
        prompt: options.prompt,
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
        tools: options.tools,
        ...(options.maxSteps ? { maxSteps: options.maxSteps } : {}),
      } as Parameters<typeof aiGenerateText>[0])

      const text = stripMarkdownFences(result.text)
      const durationMs = Date.now() - startTime

      recordLLMRequest("enrich", true, {
        provider: providerName,
        model: modelId,
        durationMs,
        usedSafeMode: false,
      })

      return {
        data: text,
        provider: providerName,
        model: modelId,
        usage: result.usage
          ? {
              promptTokens: result.usage.inputTokens ?? 0,
              completionTokens: result.usage.outputTokens ?? 0,
              totalTokens: result.usage.totalTokens ?? 0,
            }
          : undefined,
        durationMs,
      }
    } catch (error) {
      lastError = error

      if (isQuotaError(error)) {
        recordLLMRequest("enrich", false, {
          provider: providerName,
          model: modelId,
          durationMs: Date.now() - startTime,
        })
        throw createLLMError(
          "Quota exceeded",
          providerName,
          modelId,
          "quota_exceeded",
          error
        )
      }

      if (attempt < maxRetries) {
        await sleep(getBackoffDelay(attempt))
      }
    }
  }

  recordLLMRequest("enrich", false, {
    provider: providerName,
    model: modelId,
    durationMs: Date.now() - startTime,
  })
  throw createLLMError(
    `Failed after ${maxRetries + 1} attempts`,
    providerName,
    modelId,
    "unknown",
    lastError
  )
}

/**
 * Generate structured object with schema validation
 */
export async function generateObject<T extends z.ZodTypeAny>(
  options: GenerateObjectOptions<T>
): Promise<LLMResponse<z.infer<T>>> {
  const startTime = Date.now()
  const maxRetries = options.maxRetries ?? 2
  const providerName = options.provider ?? "anthropic"
  const { model, modelId } = getLLMProvider(providerName, options.model)

  let lastError: unknown
  let usedSafeMode = false

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await aiGenerateObject({
        model: model as any,
        schema: options.schema,
        system: options.systemPrompt,
        prompt: options.prompt,
        temperature: options.temperature,
        maxOutputTokens: options.maxTokens,
        tools: options.tools,
        maxSteps: options.maxSteps,
      })

      const durationMs = Date.now() - startTime
      recordLLMRequest("enrich", true, {
        provider: providerName,
        model: modelId,
        durationMs,
        usedSafeMode: false,
      })

      return {
        data: result.object,
        provider: providerName,
        model: modelId,
        usage: result.usage
          ? {
              promptTokens: result.usage.inputTokens ?? 0,
              completionTokens: result.usage.outputTokens ?? 0,
              totalTokens: result.usage.totalTokens ?? 0,
            }
          : undefined,
        durationMs,
      }
    } catch (error) {
      lastError = error

      if (isQuotaError(error)) {
        recordLLMRequest("enrich", false, {
          provider: providerName,
          model: modelId,
          durationMs: Date.now() - startTime,
        })
        throw createLLMError(
          "Quota exceeded",
          providerName,
          modelId,
          "quota_exceeded",
          error
        )
      }

      // On validation failure, try safe mode schema if provided
      if (
        attempt === maxRetries &&
        options.safeModeSchema &&
        error instanceof Error &&
        error.message.includes("validation")
      ) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const safeResult = await aiGenerateObject({
            model: model as any,
            schema: options.safeModeSchema,
            system: options.systemPrompt,
            prompt: options.prompt,
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
          })

          usedSafeMode = true
          console.warn(`[LLM] Used safe mode fallback for ${modelId}`)

          const fallbackDurationMs = Date.now() - startTime
          recordLLMFallback("enrich", {
            reason: "validation_failure",
            originalProvider: providerName,
            fallbackProvider: providerName,
          })
          recordLLMRequest("enrich", true, {
            provider: providerName,
            model: modelId,
            durationMs: fallbackDurationMs,
            usedSafeMode: true,
          })

          return {
            data: safeResult.object as z.infer<T>,
            provider: providerName,
            model: modelId,
            usage: safeResult.usage
              ? {
                  promptTokens: safeResult.usage.inputTokens ?? 0,
                  completionTokens: safeResult.usage.outputTokens ?? 0,
                  totalTokens: safeResult.usage.totalTokens ?? 0,
                }
              : undefined,
            durationMs: fallbackDurationMs,
          }
        } catch {
          // Continue to throw primary error
        }
      }

      if (attempt < maxRetries) {
        await sleep(getBackoffDelay(attempt))
      }
    }
  }

  recordLLMRequest("enrich", false, {
    provider: providerName,
    model: modelId,
    durationMs: Date.now() - startTime,
    usedSafeMode,
  })
  throw createLLMError(
    `Failed after ${maxRetries + 1} attempts`,
    providerName,
    modelId,
    usedSafeMode ? "validation_failed" : "unknown",
    lastError
  )
}

/**
 * Stream text generation
 */
export async function streamText(
  options: StreamTextOptions
): Promise<{
  stream: AsyncIterable<string>
  fullText: Promise<string>
}> {
  const providerName = options.provider ?? "anthropic"
  const { model, modelId } = getLLMProvider(providerName, options.model)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = aiStreamText({
    model: model as any,
    system: options.systemPrompt,
    prompt: options.prompt,
    temperature: options.temperature,
    maxOutputTokens: options.maxTokens,
    tools: options.tools,
  })

  // Create async iterable for streaming chunks
  async function* streamChunks(): AsyncIterable<string> {
    for await (const chunk of result.textStream) {
      options.onChunk?.(chunk)
      yield chunk
    }
  }

  // Full text promise
  const fullText = Promise.resolve(result.text).then((text) => stripMarkdownFences(text))

  return {
    stream: streamChunks(),
    fullText,
  }
}
