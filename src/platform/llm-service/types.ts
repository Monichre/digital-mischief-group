/**
 * Type definitions for the Unified LLM Provider Service
 */

export type LLMProvider = "anthropic" | "openai" | "groq" | "perplexity"

export interface LLMModel {
  provider: LLMProvider
  modelId: string
  displayName: string
  maxTokens: number
  supportsStreaming: boolean
  supportsTools: boolean
}

export const SUPPORTED_MODELS: Record<string, LLMModel> = {
  // Anthropic
  "anthropic/claude-sonnet-4.5": {
    provider: "anthropic",
    modelId: "claude-sonnet-4-5-20250514",
    displayName: "Claude Sonnet 4.5",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  "anthropic/claude-3-5-sonnet": {
    provider: "anthropic",
    modelId: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  // OpenAI
  "openai/gpt-5.2": {
    provider: "openai",
    modelId: "gpt-5.2",
    displayName: "GPT-5.2",
    maxTokens: 16384,
    supportsStreaming: true,
    supportsTools: true,
  },
  "openai/gpt-4.1": {
    provider: "openai",
    modelId: "gpt-4.1",
    displayName: "GPT-4.1",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  "openai/gpt-4.1-mini": {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    displayName: "GPT-4.1 Mini",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  // Google
  "google/gemini-3-pro": {
    provider: "openai", // via OpenAI-compatible API
    modelId: "gemini-3-pro",
    displayName: "Gemini 3 Pro",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  // Groq
  "groq/llama-3.3-70b": {
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    displayName: "Llama 3.3 70B",
    maxTokens: 8192,
    supportsStreaming: true,
    supportsTools: true,
  },
  "groq/mixtral-8x7b": {
    provider: "groq",
    modelId: "mixtral-8x7b-32768",
    displayName: "Mixtral 8x7B",
    maxTokens: 32768,
    supportsStreaming: true,
    supportsTools: false,
  },
  // Perplexity
  "perplexity/sonar-pro": {
    provider: "perplexity",
    modelId: "sonar-pro",
    displayName: "Sonar Pro",
    maxTokens: 4096,
    supportsStreaming: true,
    supportsTools: false,
  },
} as const

export interface LLMResponse<T = string> {
  data: T
  provider: LLMProvider
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  durationMs: number
}

export interface LLMError extends Error {
  provider: LLMProvider
  model: string
  code: LLMErrorCode
  retryable: boolean
  originalError?: unknown
}

export type LLMErrorCode =
  | "rate_limit"
  | "quota_exceeded"
  | "invalid_request"
  | "authentication_error"
  | "model_not_found"
  | "context_length_exceeded"
  | "validation_failed"
  | "unknown"

export function isLLMError(error: unknown): error is LLMError {
  return error instanceof Error && "code" in error && "provider" in error
}

export function createLLMError(
  message: string,
  provider: LLMProvider,
  model: string,
  code: LLMErrorCode,
  originalError?: unknown
): LLMError {
  const error = new Error(message) as LLMError
  error.name = "LLMError"
  error.provider = provider
  error.model = model
  error.code = code
  error.retryable = code === "rate_limit"
  error.originalError = originalError
  return error
}
