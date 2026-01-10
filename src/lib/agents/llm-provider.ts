import { generateObject, generateText, stepCountIs } from "ai"
import type { ToolSet } from "ai"
import { z } from "zod"
import { DEFAULT_JSON_MODEL, DEFAULT_TEXT_MODEL } from "@/lib/ai/models"

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

export function isLLMCreditError( error: unknown ): boolean {
  if ( !error ) return false

  const errorMessage = error instanceof Error ? error.message : String( error )
  const creditIndicators = [
    "credit balance",
    "insufficient_quota",
    "quota exceeded",
    "billing",
    "payment required",
  ]

  const hasCreditsMessage = creditIndicators.some( ( indicator ) =>
    errorMessage.toLowerCase().includes( indicator )
  )

  const hasQuotaStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    ( error.status === 400 || error.status === 402 || error.status === 429 )

  return hasCreditsMessage || hasQuotaStatus
}

export async function generateWithFallback( options: LLMRequestOptions ): Promise<LLMResponse> {
  const model = options.model ?? DEFAULT_TEXT_MODEL

  const result = await generateText( {
    model,
    system: options.systemPrompt,
    prompt: options.prompt,
    temperature: options.temperature,
    maxOutputTokens: options.maxTokens,
    tools: options.tools,
    stopWhen: options.maxSteps != null ? stepCountIs( options.maxSteps ) : undefined,
  } )

  return {
    text: result.text,
    provider: "ai-gateway",
    model,
  }
}

export async function generateObjectWithFallback<TSchema extends z.ZodTypeAny>( options: {
  schema: TSchema
  prompt: string
  systemPrompt?: string
  model?: string
  maxTokens?: number
  temperature?: number
  tools?: ToolSet
  maxSteps?: number
} ): Promise<{ object: z.infer<TSchema>; provider: LLMProvider; model: string }> {
  const model = options.model ?? DEFAULT_JSON_MODEL

  const result = await generateObject( {
    model,
    schema: options.schema,
    system: options.systemPrompt,
    prompt: options.prompt,
    temperature: options.temperature,
    maxOutputTokens: options.maxTokens,
    tools: options.tools,
    stopWhen: options.maxSteps != null ? stepCountIs( options.maxSteps ) : undefined,
  } )

  return {
    object: result.object,
    provider: "ai-gateway",
    model,
  }
}
