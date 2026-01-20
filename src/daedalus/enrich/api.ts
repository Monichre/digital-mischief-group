import {
  orchestrateEnrichment,
  conductEnrichment,
} from "@/ai/orchestrators/enrich.orchestrator"
import type {
  EnrichmentInput,
  EnrichmentResult,
  AgentProgress,
} from "@/ai/types"
import { discoverCompetitors, type CompetitiveDiscoveryResult } from "@/ai/agents/competitive.agent"

export interface EnrichmentOptions {
  competitive?: boolean
  onProgress?: (progress: AgentProgress) => void
}

// Thin adapter to keep current API shape while routing through the service layer.
export async function runEnrichment(
  input: EnrichmentInput,
  options: EnrichmentOptions = {}
): Promise<EnrichmentResult & { competitive?: CompetitiveDiscoveryResult }> {
  const baseResult = await orchestrateEnrichment(input, { onProgress: options.onProgress })

  if (options.competitive && baseResult.success) {
    const { discovery, profile } = baseResult.data
    const hasCompany = discovery?.company_name || input.company_name
    const hasDomain = discovery?.domain || input.domain

    if (hasCompany && hasDomain) {
      const compInput = {
        company_name: (discovery?.company_name || input.company_name) as string,
        domain: (discovery?.domain || input.domain) as string,
        industry: profile?.industry || null,
        description: profile?.description || null,
        segment: profile?.segment || null,
      }

      try {
        const competitive = await discoverCompetitors(compInput)
        return { ...baseResult, competitive }
      } catch (error) {
        console.error("[Enrich] Competitive analysis failed", error)
        return baseResult
      }
    }
  }

  return baseResult
}

// Streaming-compatible entry point (SSE) — reuses conductor for now.
export const runEnrichmentStream = conductEnrichment

export type { EnrichmentInput, EnrichmentResult, AgentProgress }
