import type { z } from "zod"
import type {
  DiscoveryResultSchema,
  CompanyProfileResultSchema,
  FundingResultSchema,
  TechStackResultSchema,
  CustomFieldsResultSchema,
} from "./schemas"

// Agent input/output types
export type DiscoveryResult = z.infer<typeof DiscoveryResultSchema>
export type CompanyProfileResult = z.infer<typeof CompanyProfileResultSchema>
export type FundingResult = z.infer<typeof FundingResultSchema>
export type TechStackResult = z.infer<typeof TechStackResultSchema>
export type CustomFieldsResult = z.infer<typeof CustomFieldsResultSchema>

// Enrichment input - what the user provides
export interface EnrichmentInput {
  email?: string
  domain?: string
  company_name?: string
  url?: string
}

// Context passed between agents
export interface EnrichmentContext {
  input: EnrichmentInput
  discovery?: DiscoveryResult
  profile?: CompanyProfileResult
  funding?: FundingResult
  techStack?: TechStackResult
  customFields?: CustomFieldsResult
}

// Final assembled result
export interface EnrichmentResult {
  success: boolean
  data: {
    discovery: DiscoveryResult
    profile: CompanyProfileResult
    funding: FundingResult
    techStack: TechStackResult
    customFields: CustomFieldsResult
    sources: string[]
  }
  errors?: AgentError[]
  duration_ms: number
}

// Agent phase tracking
export type AgentPhase =
  | "discovery"
  | "company_profile"
  | "funding"
  | "tech_stack"
  | "custom_fields"

export type AgentStatus = "pending" | "running" | "completed" | "failed" | "skipped"

export interface AgentProgress {
  phase: AgentPhase
  status: AgentStatus
  progress: number // 0-100
  message: string
  startedAt?: number
  completedAt?: number
  error?: string
}

export interface AgentError {
  phase: AgentPhase
  error: string
  recoverable: boolean
}

// Base agent interface - all agents implement this
export interface Agent<TInput, TOutput> {
  name: AgentPhase
  timeout: number // ms
  execute(input: TInput, context: EnrichmentContext): Promise<TOutput>
}

// Agent configuration
export interface AgentConfig {
  enabled: boolean
  timeout: number
  retries: number
  required: boolean // If true, failure stops pipeline
}

export const DEFAULT_AGENT_CONFIG: Record<AgentPhase, AgentConfig> = {
  discovery: { enabled: true, timeout: 15000, retries: 2, required: true },
  company_profile: { enabled: true, timeout: 15000, retries: 1, required: false },
  funding: { enabled: true, timeout: 10000, retries: 1, required: false },
  tech_stack: { enabled: true, timeout: 10000, retries: 1, required: false },
  custom_fields: { enabled: true, timeout: 10000, retries: 0, required: false },
}

// Orchestrator options
export interface OrchestratorOptions {
  config?: Partial<Record<AgentPhase, Partial<AgentConfig>>>
  onProgress?: (progress: AgentProgress) => void
  abortSignal?: AbortSignal
}
