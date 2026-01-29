/**
 * LLM Provider Factory
 *
 * Creates and configures LLM providers with consistent interface
 */

import { gateway } from "@ai-sdk/gateway"
import { openai } from "@ai-sdk/openai"
import { anthropic } from "@ai-sdk/anthropic"
import { perplexity } from "@ai-sdk/perplexity"
import { type LLMProvider, SUPPORTED_MODELS } from "./types"

type ProviderChannel = "gateway" | "direct"

// Use union type for model since AI SDK uses opaque model refs
type LanguageModel =
  | ReturnType<typeof gateway>
  | ReturnType<typeof openai>
  | ReturnType<typeof anthropic>
  | ReturnType<typeof perplexity>

export interface LLMProviderConfig {
  provider: LLMProvider
  model?: string
  apiKey?: string
  baseUrl?: string
  maxRetries?: number
  timeout?: number
  channel?: ProviderChannel
}

interface ProviderInstance {
  provider: LLMProvider
  model: LanguageModel
  modelId: string
  channel: ProviderChannel
}

const defaultModels: Record<LLMProvider, string> = {
  anthropic: "anthropic/claude-sonnet-4.5",
  openai: "openai/gpt-5.2",
  groq: "groq/llama-3.3-70b",
  perplexity: "perplexity/sonar-pro",
}

function isDirectProviderAvailable(provider: LLMProvider): boolean {
  switch (provider) {
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY)
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY)
    case "perplexity":
      return Boolean(process.env.PERPLEXITY_API_KEY)
    case "groq":
      return false
    default:
      return false
  }
}

function createDirectModel(provider: LLMProvider, modelKey: string): LanguageModel {
  const modelConfig = SUPPORTED_MODELS[modelKey]

  if (!modelConfig) {
    throw new Error(`Unsupported model: ${modelKey}`)
  }

  if (modelConfig.provider !== provider) {
    throw new Error(`Model ${modelKey} does not match provider ${provider}`)
  }

  if (!isDirectProviderAvailable(provider)) {
    throw new Error(`Direct provider unavailable for ${provider} (missing API key or SDK)`)
  }

  switch (provider) {
    case "openai":
      return openai(modelConfig.modelId)
    case "anthropic":
      return anthropic(modelConfig.modelId)
    case "perplexity":
      return perplexity(modelConfig.modelId)
    default:
      throw new Error(`Direct provider not supported for ${provider}`)
  }
}

/**
 * Create an LLM provider instance
 */
export function createLLMProvider(config: LLMProviderConfig): ProviderInstance {
  const modelKey = config.model ?? defaultModels[config.provider]
  const modelConfig = SUPPORTED_MODELS[modelKey]
  const channel = config.channel ?? "gateway"

  if (!modelConfig) {
    throw new Error(`Unsupported model: ${modelKey}`)
  }

  const model = channel === "gateway" ? gateway(modelKey) : createDirectModel(config.provider, modelKey)

  return {
    provider: config.provider,
    model,
    modelId: modelKey,
    channel,
  }
}

// Singleton provider cache
const providerCache = new Map<string, ProviderInstance>()

/**
 * Get or create a cached LLM provider instance
 */
export function getLLMProvider(
  provider: LLMProvider = "anthropic",
  model?: string,
  channel: ProviderChannel = "gateway"
): ProviderInstance {
  const cacheKey = `${provider}:${channel}:${model ?? "default"}`

  if (!providerCache.has(cacheKey)) {
    providerCache.set(cacheKey, createLLMProvider({ provider, model, channel }))
  }

  return providerCache.get(cacheKey)!
}

/**
 * Get the default model string for a provider (for backward compat)
 */
export function getDefaultModelString(provider: LLMProvider = "anthropic"): string {
  return defaultModels[provider]
}

export function canUseDirectProvider(provider: LLMProvider): boolean {
  return isDirectProviderAvailable(provider)
}
