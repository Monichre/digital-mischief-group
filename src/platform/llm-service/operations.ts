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
import { getLLMProvider, canUseDirectProvider } from "./provider"
import {
  type LLMProvider,
  type LLMResponse,
  type LLMErrorCode,
  createLLMError,
  SUPPORTED_MODELS,
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

const FALLBACK_PROVIDER_ORDER: LLMProvider[] = [
  "anthropic",
  "openai",
  "groq",
  "perplexity",
]

const JSON_INSTRUCTION = "Return a json object."

function getFallbackProviders(primary: LLMProvider): LLMProvider[] {
  return FALLBACK_PROVIDER_ORDER.filter((provider) => provider !== primary)
}

function resolveModelForProvider(provider: LLMProvider, model?: string): string | undefined {
  if (!model) return undefined
  const modelConfig = SUPPORTED_MODELS[model]
  if (!modelConfig) return undefined
  return modelConfig.provider === provider ? model : undefined
}

function ensureJsonInstruction(
  provider: LLMProvider,
  prompt: string,
  systemPrompt?: string
): { prompt: string; systemPrompt?: string } {
  if (provider !== "openai") {
    return { prompt, systemPrompt }
  }

  const combined = `${systemPrompt ?? ""}\n${prompt}`.toLowerCase()
  if (combined.includes("json")) {
    return { prompt, systemPrompt }
  }

  return {
    prompt: `${prompt}\n\n${JSON_INSTRUCTION}`,
    systemPrompt,
  }
}

/**
 * Generate text with unified provider interface
 */
export async function generateText(
  options: GenerateTextOptions
): Promise<LLMResponse<string>> {
  const requestStart = Date.now()
  const maxRetries = options.maxRetries ?? 2
  const primaryProvider = options.provider ?? "anthropic"
  const providersToTry = [primaryProvider, ...getFallbackProviders(primaryProvider)]

  let lastError: unknown
  let lastErrorCode: LLMErrorCode = "unknown"
  let lastProvider = primaryProvider
  let lastModelId = ""

  for (let providerIndex = 0; providerIndex < providersToTry.length; providerIndex++) {
    const providerName = providersToTry[providerIndex]
    const modelOverride = resolveModelForProvider(providerName, options.model)
    const providerStart = Date.now()
    let providerError: unknown
    // Using explicit type cast to prevent TypeScript from narrowing this variable
    // It can be modified to "quota_exceeded" in the attemptGenerate closure
    let providerErrorCode = "unknown" as LLMErrorCode

    const attemptGenerate = async (channel: "gateway" | "direct") => {
      const { model, modelId } = getLLMProvider(providerName, modelOverride, channel)
      lastProvider = providerName
      lastModelId = modelId

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
          const durationMs = Date.now() - providerStart

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
            durationMs: Date.now() - requestStart,
          }
        } catch (error) {
          providerError = error
          lastError = error

          if (isQuotaError(error)) {
            providerErrorCode = "quota_exceeded"
            break
          }

          if (attempt < maxRetries) {
            await sleep(getBackoffDelay(attempt))
          }
        }
      }

      recordLLMRequest("enrich", false, {
        provider: providerName,
        model: modelId,
        durationMs: Date.now() - providerStart,
      })

      return null
    }

    const gatewayResult = await attemptGenerate("gateway")
    if (gatewayResult) return gatewayResult

    if (providerErrorCode === "quota_exceeded" && canUseDirectProvider(providerName)) {
      recordLLMFallback("enrich", {
        reason: "gateway_quota",
        originalProvider: primaryProvider,
        fallbackProvider: providerName,
      })

      const directResult = await attemptGenerate("direct")
      if (directResult) return directResult
    }

    lastErrorCode = providerErrorCode

    if (providerIndex < providersToTry.length - 1) {
      recordLLMFallback("enrich", {
        reason: providerErrorCode === "quota_exceeded" ? "quota_exceeded" : "provider_error",
        originalProvider: primaryProvider,
        fallbackProvider: providersToTry[providerIndex + 1],
      })
      continue
    }

    lastError = providerError
  }

  throw createLLMError(
    lastErrorCode === "quota_exceeded"
      ? "Quota exceeded"
      : "LLM request failed across providers",
    lastProvider,
    lastModelId,
    lastErrorCode,
    lastError
  )
}

/**
 * Generate structured object with schema validation
 */
export async function generateObject<T extends z.ZodTypeAny>(
  options: GenerateObjectOptions<T>
): Promise<LLMResponse<z.infer<T>>> {
  const requestStart = Date.now()
  const maxRetries = options.maxRetries ?? 2
  const primaryProvider = options.provider ?? "anthropic"
  const providersToTry = [primaryProvider, ...getFallbackProviders(primaryProvider)]

  let lastError: unknown
  let lastErrorCode: LLMErrorCode = "unknown"
  let lastProvider = primaryProvider
  let lastModelId = ""

  for (let providerIndex = 0; providerIndex < providersToTry.length; providerIndex++) {
    const providerName = providersToTry[providerIndex]
    const modelOverride = resolveModelForProvider(providerName, options.model)
    const providerStart = Date.now()
    let providerError: unknown
    // Using explicit type cast to prevent TypeScript from narrowing this variable
    // It can be modified to "quota_exceeded" in the attemptGenerate closure
    let providerErrorCode = "unknown" as LLMErrorCode
    let usedSafeMode = false

    const attemptGenerate = async (channel: "gateway" | "direct"): Promise<LLMResponse<z.infer<T>> | null> => {
      const { model, modelId } = getLLMProvider(providerName, modelOverride, channel)
      lastProvider = providerName
      lastModelId = modelId

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const prepared = ensureJsonInstruction(providerName, options.prompt, options.systemPrompt)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await aiGenerateObject({
            model: model as any,
            schema: options.schema,
            system: prepared.systemPrompt,
            prompt: prepared.prompt,
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens,
            tools: options.tools,
            maxSteps: options.maxSteps,
          })

          const durationMs = Date.now() - providerStart
          recordLLMRequest("enrich", true, {
            provider: providerName,
            model: modelId,
            durationMs,
            usedSafeMode: false,
          })

          return {
            data: result.object as z.infer<T>,
            provider: providerName,
            model: modelId,
            usage: result.usage
              ? {
                  promptTokens: result.usage.inputTokens ?? 0,
                  completionTokens: result.usage.outputTokens ?? 0,
                  totalTokens: result.usage.totalTokens ?? 0,
                }
              : undefined,
            durationMs: Date.now() - requestStart,
          }
        } catch (error) {
          providerError = error
          lastError = error

          if (isQuotaError(error)) {
            providerErrorCode = "quota_exceeded"
            break
          }

          // On validation failure, try safe mode schema if provided
          if (
            attempt === maxRetries &&
            options.safeModeSchema &&
            error instanceof Error &&
            error.message.includes("validation")
          ) {
            try {
              const prepared = ensureJsonInstruction(providerName, options.prompt, options.systemPrompt)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const safeResult = await aiGenerateObject({
                model: model as any,
                schema: options.safeModeSchema,
                system: prepared.systemPrompt,
                prompt: prepared.prompt,
                temperature: options.temperature,
                maxOutputTokens: options.maxTokens,
              })

              usedSafeMode = true
              console.warn(`[LLM] Used safe mode fallback for ${modelId}`)

              const fallbackDurationMs = Date.now() - providerStart
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
                durationMs: Date.now() - requestStart,
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
        durationMs: Date.now() - providerStart,
        usedSafeMode,
      })

      return null
    }

    const gatewayResult = await attemptGenerate("gateway")
    if (gatewayResult) return gatewayResult

    if (providerErrorCode === "quota_exceeded" && canUseDirectProvider(providerName)) {
      recordLLMFallback("enrich", {
        reason: "gateway_quota",
        originalProvider: primaryProvider,
        fallbackProvider: providerName,
      })

      const directResult = await attemptGenerate("direct")
      if (directResult) return directResult
    }

    lastErrorCode = providerErrorCode

    if (providerIndex < providersToTry.length - 1) {
      recordLLMFallback("enrich", {
        reason: providerErrorCode === "quota_exceeded" ? "quota_exceeded" : "provider_error",
        originalProvider: primaryProvider,
        fallbackProvider: providersToTry[providerIndex + 1],
      })
      continue
    }

    lastError = providerError
  }

  throw createLLMError(
    lastErrorCode === "quota_exceeded"
      ? "Quota exceeded"
      : "LLM request failed across providers",
    lastProvider,
    lastModelId,
    lastErrorCode,
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
  const attemptStream = (channel: "gateway" | "direct") => {
    const { model } = getLLMProvider(providerName, options.model, channel)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return aiStreamText({
      model: model as any,
      system: options.systemPrompt,
      prompt: options.prompt,
      temperature: options.temperature,
      maxOutputTokens: options.maxTokens,
      tools: options.tools,
    })
  }

  let result: ReturnType<typeof aiStreamText>

  try {
    result = attemptStream("gateway")
  } catch (error) {
    if (isQuotaError(error) && canUseDirectProvider(providerName)) {
      result = attemptStream("direct")
    } else {
      throw error
    }
  }

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
