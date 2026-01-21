/**
 * LLM Provider Factory
 *
 * Creates and configures LLM providers with consistent interface
 */

import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import { perplexity } from "@ai-sdk/perplexity"
import { type LLMProvider, SUPPORTED_MODELS } from "./types"

// Use string type for model since AI SDK uses opaque model refs
type LanguageModel = ReturnType<typeof anthropic> | ReturnType<typeof openai> | ReturnType<typeof perplexity>

export interface LLMProviderConfig {
  provider: LLMProvider
  model?: string
  apiKey?: string
  baseUrl?: string
  maxRetries?: number
  timeout?: number
}

interface ProviderInstance {
  provider: LLMProvider
  model: LanguageModel
  modelId: string
}

const defaultModels: Record<LLMProvider, string> = {
  anthropic: "anthropic/claude-sonnet-4.5",
  openai: "openai/gpt-5.2",
  groq: "groq/llama-3.3-70b",
  perplexity: "perplexity/sonar-pro",
}

/**
 * Create an LLM provider instance
 */
export function createLLMProvider(config: LLMProviderConfig): ProviderInstance {
  const modelKey = config.model ?? defaultModels[config.provider]
  const modelConfig = SUPPORTED_MODELS[modelKey]

  if (!modelConfig) {
    throw new Error(`Unsupported model: ${modelKey}`)
  }

  let model: LanguageModel

  switch (config.provider) {
    case "anthropic":
      model = anthropic(modelConfig.modelId)
      break
    case "openai":
      model = openai(modelConfig.modelId)
      break
    case "groq":
      // Groq uses OpenAI-compatible API
      model = openai(modelConfig.modelId)
      break
    case "perplexity":
      model = perplexity(modelConfig.modelId)
      break
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }

  return {
    provider: config.provider,
    model,
    modelId: modelKey,
  }
}

// Singleton provider cache
const providerCache = new Map<string, ProviderInstance>()

/**
 * Get or create a cached LLM provider instance
 */
export function getLLMProvider(
  provider: LLMProvider = "anthropic",
  model?: string
): ProviderInstance {
  const cacheKey = `${provider}:${model ?? "default"}`

  if (!providerCache.has(cacheKey)) {
    providerCache.set(cacheKey, createLLMProvider({ provider, model }))
  }

  return providerCache.get(cacheKey)!
}

/**
 * Get the default model string for a provider (for backward compat)
 */
export function getDefaultModelString(provider: LLMProvider = "anthropic"): string {
  return defaultModels[provider]
}
