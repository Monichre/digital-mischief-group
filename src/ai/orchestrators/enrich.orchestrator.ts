import { generateObjectWithFallback, generateWithFallback, isLLMCreditError } from "@/ai/tools/llm.tool"
import { runDiscoveryAgent } from "../agents/discovery.agent"
import { runCompanyProfileAgent } from "../agents/company-profile.agent"
import { runFundingAgent } from "../agents/funding.agent"
import { runTechStackAgent } from "../agents/tech-stack.agent"
import { runCustomFieldsAgent } from "../agents/custom-fields.agent"
import { z } from "zod"
import type {
  EnrichmentInput,
  EnrichmentContext,
  EnrichmentResult,
  AgentPhase,
  AgentError,
} from "../types"

// Conductor thinking event types
export interface ConductorThought {
  type: "observation" | "reasoning" | "decision" | "action" | "insight"
  content: string
  timestamp: number
  relatedPhase?: AgentPhase
}

export interface ConductorDecision {
  phase: AgentPhase
  action: "run" | "skip" | "modify"
  reason: string
  modifications?: {
    timeout?: number
    priority?: "high" | "normal" | "low"
    customPrompt?: string
  }
}

export interface ConductorOptions {
  onThought?: (thought: ConductorThought) => void
  onDecision?: (decision: ConductorDecision) => void
  onProgress?: (phase: AgentPhase, status: string, message: string) => void
  abortSignal?: AbortSignal
}

const ConductorPlanSchema = z.object({
  analysis: z.string(),
  decisions: z.array(
    z.object({
      phase: z.enum(["company_profile", "funding", "tech_stack", "custom_fields"]),
      action: z.enum(["run", "skip", "modify"]),
      reason: z.string(),
    })
  ),
})

function isLikelyPersonalSite(discovery: NonNullable<EnrichmentContext["discovery"]>): boolean {
  const domain = discovery.domain.toLowerCase()
  const companyName = discovery.company_name.toLowerCase()
  const personalDomains = [
    "github.io",
    "notion.site",
    "substack.com",
    "medium.com",
    "read.cv",
    "carrd.co",
  ]

  if (domain.endsWith(".me")) return true
  if (personalDomains.some((d) => domain.endsWith(d))) return true
  if (companyName.includes("portfolio") || companyName.includes("personal")) return true

  return false
}

function defaultPlan(
  discovery: EnrichmentContext["discovery"],
  _input: EnrichmentInput
): ConductorDecision[] {
  if (!discovery) {
    return [
      { phase: "company_profile", action: "run", reason: "Default behavior" },
      { phase: "funding", action: "run", reason: "Default behavior" },
      { phase: "tech_stack", action: "run", reason: "Default behavior" },
      { phase: "custom_fields", action: "run", reason: "Default behavior" },
    ]
  }

  const lowConfidence = discovery.confidence < 0.6
  const likelyPersonal = isLikelyPersonalSite(discovery)

  if (lowConfidence || likelyPersonal) {
    return [
      { phase: "company_profile", action: "run", reason: "Need basic firmographics" },
      { phase: "funding", action: "skip", reason: "Low-confidence or likely personal site" },
      { phase: "tech_stack", action: "skip", reason: "Low-confidence or likely personal site" },
      { phase: "custom_fields", action: "run", reason: "Confirm entity type + compute ICP fit" },
    ]
  }

  return [
    { phase: "company_profile", action: "run", reason: "Standard enrichment" },
    { phase: "funding", action: "run", reason: "Standard enrichment" },
    { phase: "tech_stack", action: "run", reason: "Standard enrichment" },
    { phase: "custom_fields", action: "run", reason: "Standard enrichment" },
  ]
}

// Conductor analyzes discovery results and decides next steps
async function analyzeDiscoveryAndPlan(
  discovery: EnrichmentContext["discovery"],
  input: EnrichmentInput,
  onThought: (thought: ConductorThought) => void
): Promise<ConductorDecision[]> {
  const prompt = `You are an intelligent orchestrator for a B2B lead enrichment system. Analyze this discovery result and decide which agents to run next.

INPUT PROVIDED:
${JSON.stringify(input, null, 2)}

DISCOVERY RESULT:
${JSON.stringify(discovery, null, 2)}

AVAILABLE AGENTS:
1. company_profile - Extracts firmographics (industry, employee count, HQ, etc.)
2. funding - Researches funding rounds, investors, valuation
3. tech_stack - Detects technologies, frameworks, infrastructure
4. custom_fields - Extracts leadership, calculates ICP fit score

IMPORTANT PATTERNS TO DETECT:
- Personal/portfolio sites (single person, no company indicators)
- Consulting/freelance businesses (individual service providers)
- Startups vs enterprises
- B2B vs B2C companies
- Non-profit organizations

Based on the discovery, decide for EACH agent:
- "run" - Execute normally
- "skip" - Don't run (waste of resources for this target)
- "modify" - Run with adjusted parameters

Respond in JSON format:
{
  "analysis": "Your 1-2 sentence analysis of what type of entity this is",
  "decisions": [
    {
      "phase": "company_profile",
      "action": "run|skip|modify",
      "reason": "Brief reason"
    },
    {
      "phase": "funding", 
      "action": "run|skip|modify",
      "reason": "Brief reason"
    },
    {
      "phase": "tech_stack",
      "action": "run|skip|modify", 
      "reason": "Brief reason"
    },
    {
      "phase": "custom_fields",
      "action": "run|skip|modify",
      "reason": "Brief reason"
    }
  ]
}`

  try {
    const { object } = await generateObjectWithFallback({
      schema: ConductorPlanSchema,
      prompt,
      maxTokens: 800,
      temperature: 0.5,
    })

    onThought({
      type: "observation",
      content: object.analysis,
      timestamp: Date.now(),
    })

    return object.decisions.map((d) => ({
      phase: d.phase,
      action: d.action,
      reason: d.reason,
    }))
  } catch (error) {
    console.error("[Conductor] Analysis failed:", error)

    if (isLLMCreditError(error)) {
      onThought({
        type: "reasoning",
        content: "⚠️ AI planning unavailable (provider error / credits). Using heuristic planning.",
        timestamp: Date.now(),
      })
    }

    return defaultPlan(discovery, input)
  }
}

// Conductor reflects on intermediate results
async function reflectOnProgress(
  context: EnrichmentContext,
  completedPhases: AgentPhase[],
  onThought: (thought: ConductorThought) => void
): Promise<string | null> {
  // Only reflect after profile is done and before custom_fields
  if (!completedPhases.includes("company_profile") || completedPhases.includes("custom_fields")) {
    return null
  }

  const dataPoints = []
  if (context.profile?.industry) dataPoints.push(`Industry: ${context.profile.industry}`)
  if (context.profile?.employee_count) dataPoints.push(`Employees: ${context.profile.employee_count}`)
  if (context.profile?.segment) dataPoints.push(`Segment: ${context.profile.segment}`)
  if (context.funding?.funding_stage) dataPoints.push(`Funding: ${context.funding.funding_stage}`)
  if (context.techStack?.signals?.ai_adoption) dataPoints.push("AI adoption detected")

  if (dataPoints.length < 2) return null

  const prompt = `Based on enrichment data so far, provide a brief (1 sentence) insight about this company's profile and potential:

Data collected:
${dataPoints.join("\n")}

Company: ${context.discovery?.company_name}
Website: ${context.discovery?.website}

Respond with just the insight sentence, no explanation.`

  try {
    const response = await generateWithFallback({
      prompt,
      maxTokens: 100,
      temperature: 0.7,
    })

    if (response.text.trim()) {
      onThought({
        type: "insight",
        content: response.text.trim(),
        timestamp: Date.now(),
      })
      return response.text.trim()
    }
  } catch {
    // Reflection is optional, don't fail
  }

  return null
}

// Generate final synthesis
async function generateFinalSynthesis(
  context: EnrichmentContext,
  onThought: (thought: ConductorThought) => void
): Promise<string | null> {
  const prompt = `You are an intelligence analyst. Based on all enrichment data, write a 2-3 sentence executive brief about this company/entity.

Company: ${context.discovery?.company_name}
Website: ${context.discovery?.website}
Industry: ${context.profile?.industry || "Unknown"}
Segment: ${context.profile?.segment || "Unknown"}
Employees: ${context.profile?.employee_count || "Unknown"}
Funding: ${context.funding?.total_funding || "None found"} (${context.funding?.funding_stage || "Unknown stage"})
Tech Signals: AI=${context.techStack?.signals?.ai_adoption}, Modern=${context.techStack?.signals?.modern_stack}
ICP Score: ${context.customFields?.icp_fit_score}/100
Is Personal Site: ${context.customFields?.is_personal_site || false}

Write a brief that:
1. Identifies what type of entity this is
2. Highlights the most notable characteristic
3. Suggests relevance for B2B outreach (or lack thereof)

Keep it under 75 words. Be direct.`

  try {
    const response = await generateWithFallback({
      prompt,
      maxTokens: 150,
      temperature: 0.7,
    })

    return response.text.trim()
  } catch (error) {
    console.error("[Conductor] Synthesis failed:", error)

    if (isLLMCreditError(error)) {
      // Emit a thought about the issue
      onThought({
        type: "reasoning",
        content: "⚠️ AI synthesis unavailable (API credits low). Using data-based summary.",
        timestamp: Date.now(),
      })

      // Generate a simple fallback synthesis from the data
      const parts: string[] = []

      if (context.discovery?.company_name) {
        parts.push(context.discovery.company_name)
      }

      if (context.profile?.industry) {
        parts.push(`is a ${context.profile.industry.toLowerCase()} company`)
      } else if (context.customFields?.is_personal_site) {
        parts.push("appears to be a personal website")
      }

      if (context.profile?.employee_count) {
        parts.push(`with ${context.profile.employee_count} employees`)
      }

      if (context.funding?.total_funding && context.funding.total_funding !== "None found") {
        parts.push(`and ${context.funding.total_funding} in funding`)
      }

      if (context.customFields?.icp_fit_score && context.customFields.icp_fit_score > 70) {
        parts.push("— strong ICP fit for B2B outreach")
      } else if (context.customFields?.icp_fit_score && context.customFields.icp_fit_score < 40) {
        parts.push("— limited B2B relevance")
      }

      return parts.length > 0
        ? parts.join(" ") + "."
        : "Intelligence gathered. Detailed analysis available in data fields."
    }
  }

  return null
}

// Main conductor-orchestrated enrichment
export async function conductEnrichment(
  input: EnrichmentInput,
  options: ConductorOptions = {}
): Promise<EnrichmentResult & { synthesis?: string; thoughts: ConductorThought[] }> {
  const startTime = Date.now()
  const { onThought, onDecision, onProgress, abortSignal } = options

  const thoughts: ConductorThought[] = []
  const errors: AgentError[] = []
  const context: EnrichmentContext = { input }
  const completedPhases: AgentPhase[] = []

  const emitThought = (thought: ConductorThought) => {
    thoughts.push(thought)
    onThought?.(thought)
  }

  const emitDecision = (decision: ConductorDecision) => {
    emitThought({
      type: "decision",
      content: `${decision.action.toUpperCase()} ${decision.phase}: ${decision.reason}`,
      timestamp: Date.now(),
      relatedPhase: decision.phase,
    })
    onDecision?.(decision)
  }

  const checkAbort = () => {
    if (abortSignal?.aborted) {
      throw new Error("Enrichment aborted")
    }
  }

  // Initial thought
  emitThought({
    type: "observation",
    content: `Analyzing input: ${input.email || input.domain || input.company_name || input.url}`,
    timestamp: Date.now(),
  })

  // Phase 1: Discovery (always required)
  emitThought({
    type: "action",
    content: "Starting discovery to identify the target entity...",
    timestamp: Date.now(),
    relatedPhase: "discovery",
  })

  onProgress?.("discovery", "running", "Identifying company...")

  try {
    checkAbort()
    context.discovery = await runDiscoveryAgent(input, context)
    completedPhases.push("discovery")

    emitThought({
      type: "observation",
      content: `Identified: ${context.discovery.company_name} (${context.discovery.domain}) with ${Math.round(context.discovery.confidence * 100)}% confidence`,
      timestamp: Date.now(),
      relatedPhase: "discovery",
    })

    onProgress?.("discovery", "completed", `Found: ${context.discovery.company_name}`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Discovery failed"
    errors.push({ phase: "discovery", error: errorMsg, recoverable: false })
    onProgress?.("discovery", "failed", errorMsg)
    throw new Error(`Discovery failed: ${errorMsg}`)
  }

  // Conductor analyzes discovery and plans next steps
  emitThought({
    type: "reasoning",
    content: "Analyzing discovery results to determine optimal enrichment strategy...",
    timestamp: Date.now(),
  })

  const decisions = await analyzeDiscoveryAndPlan(context.discovery, input, emitThought)

  // Emit all decisions
  for (const decision of decisions) {
    emitDecision(decision)
  }

  // Phase 2: Company Profile
  const profileDecision = decisions.find((d) => d.phase === "company_profile")
  if (profileDecision?.action !== "skip") {
    emitThought({
      type: "action",
      content: "Gathering firmographic data...",
      timestamp: Date.now(),
      relatedPhase: "company_profile",
    })

    onProgress?.("company_profile", "running", "Extracting company profile...")

    try {
      checkAbort()
      context.profile = await runCompanyProfileAgent(context.discovery!, context)
      completedPhases.push("company_profile")

      const profileSummary = [
        context.profile.industry,
        context.profile.segment !== "Unknown" ? context.profile.segment : null,
        context.profile.employee_range,
      ]
        .filter(Boolean)
        .join(" | ")

      emitThought({
        type: "observation",
        content: `Profile: ${profileSummary || "Limited data found"}`,
        timestamp: Date.now(),
        relatedPhase: "company_profile",
      })

      onProgress?.("company_profile", "completed", profileSummary || "Profile gathered")
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Profile failed"
      errors.push({ phase: "company_profile", error: errorMsg, recoverable: true })
      onProgress?.("company_profile", "failed", errorMsg)
    }
  } else {
    onProgress?.("company_profile", "skipped", profileDecision.reason)
  }

  // Phase 3 & 4: Funding and Tech Stack (parallel based on decisions)
  const fundingDecision = decisions.find((d) => d.phase === "funding")
  const techDecision = decisions.find((d) => d.phase === "tech_stack")

  const parallelTasks: Promise<void>[] = []

  if (fundingDecision?.action !== "skip") {
    parallelTasks.push(
      (async () => {
        emitThought({
          type: "action",
          content: "Researching funding history...",
          timestamp: Date.now(),
          relatedPhase: "funding",
        })

        onProgress?.("funding", "running", "Searching funding data...")

        try {
          checkAbort()
          context.funding = await runFundingAgent(context.discovery!, context)
          completedPhases.push("funding")

          const fundingSummary = context.funding.funding_stage
            ? `${context.funding.funding_stage}${context.funding.total_funding ? ` - ${context.funding.total_funding}` : ""}`
            : "No funding data found"

          emitThought({
            type: "observation",
            content: `Funding: ${fundingSummary}`,
            timestamp: Date.now(),
            relatedPhase: "funding",
          })

          onProgress?.("funding", "completed", fundingSummary)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Funding search failed"
          errors.push({ phase: "funding", error: errorMsg, recoverable: true })
          onProgress?.("funding", "failed", errorMsg)
        }
      })()
    )
  } else {
    onProgress?.("funding", "skipped", fundingDecision.reason)
  }

  if (techDecision?.action !== "skip") {
    parallelTasks.push(
      (async () => {
        emitThought({
          type: "action",
          content: "Detecting technology stack...",
          timestamp: Date.now(),
          relatedPhase: "tech_stack",
        })

        onProgress?.("tech_stack", "running", "Analyzing technologies...")

        try {
          checkAbort()
          context.techStack = await runTechStackAgent(context.discovery!, context)
          completedPhases.push("tech_stack")

          const techCount =
            context.techStack.languages.length +
            context.techStack.frameworks.length +
            context.techStack.tools.length

          const signals = []
          if (context.techStack.signals.ai_adoption) signals.push("AI")
          if (context.techStack.signals.modern_stack) signals.push("Modern")
          if (context.techStack.signals.cloud_native) signals.push("Cloud")

          emitThought({
            type: "observation",
            content: `Tech: ${techCount} technologies detected${signals.length ? ` (${signals.join(", ")})` : ""}`,
            timestamp: Date.now(),
            relatedPhase: "tech_stack",
          })

          onProgress?.("tech_stack", "completed", `${techCount} technologies found`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Tech detection failed"
          errors.push({ phase: "tech_stack", error: errorMsg, recoverable: true })
          onProgress?.("tech_stack", "failed", errorMsg)
        }
      })()
    )
  } else {
    onProgress?.("tech_stack", "skipped", techDecision.reason)
  }

  await Promise.all(parallelTasks)

  // Mid-enrichment reflection
  await reflectOnProgress(context, completedPhases, emitThought)

  // Phase 5: Custom Fields
  const customDecision = decisions.find((d) => d.phase === "custom_fields")
  if (customDecision?.action !== "skip") {
    emitThought({
      type: "action",
      content: "Calculating ICP fit and extracting leadership...",
      timestamp: Date.now(),
      relatedPhase: "custom_fields",
    })

    onProgress?.("custom_fields", "running", "Analyzing fit & leadership...")

    try {
      checkAbort()
      context.customFields = await runCustomFieldsAgent(context)
      completedPhases.push("custom_fields")

      const fitMessage = context.customFields.is_personal_site
        ? "Personal/portfolio site detected"
        : `ICP Score: ${context.customFields.icp_fit_score}/100`

      emitThought({
        type: "observation",
        content: fitMessage,
        timestamp: Date.now(),
        relatedPhase: "custom_fields",
      })

      onProgress?.("custom_fields", "completed", fitMessage)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Custom fields failed"
      errors.push({ phase: "custom_fields", error: errorMsg, recoverable: true })
      onProgress?.("custom_fields", "failed", errorMsg)
    }
  } else {
    onProgress?.("custom_fields", "skipped", customDecision.reason)
  }

  // Final synthesis
  emitThought({
    type: "reasoning",
    content: "Synthesizing all findings into executive brief...",
    timestamp: Date.now(),
  })

  const synthesis = await generateFinalSynthesis(context, emitThought)

  if (synthesis) {
    emitThought({
      type: "insight",
      content: synthesis,
      timestamp: Date.now(),
    })
  }

  // Collect all sources
  const allSources = new Set<string>()
  if (context.discovery?.sources) {
    context.discovery.sources.forEach((s) => allSources.add(s))
  }
  if (context.profile?.sources) {
    Object.values(context.profile.sources).flat().forEach((s) => allSources.add(s))
  }
  if (context.funding?.sources) {
    Object.values(context.funding.sources).flat().forEach((s) => allSources.add(s))
  }
  if (context.techStack?.sources) {
    context.techStack.sources.forEach((s) => allSources.add(s))
  }
  if (context.customFields?.sources) {
    Object.values(context.customFields.sources).flat().forEach((s) => allSources.add(s))
  }

  const duration = Date.now() - startTime

  emitThought({
    type: "observation",
    content: `Enrichment complete in ${(duration / 1000).toFixed(1)}s`,
    timestamp: Date.now(),
  })

  return {
    success: errors.filter((e) => !e.recoverable).length === 0,
    data: {
      discovery: context.discovery!,
      profile: context.profile || {
        industry: null,
        segment: "Unknown",
        headquarters: null,
        employee_count: null,
        employee_range: null,
        year_founded: null,
        business_type: null,
        description: null,
        sources: {},
      },
      funding: context.funding || {
        funding_stage: null,
        total_funding: null,
        last_round_date: null,
        last_round_amount: null,
        investors: [],
        valuation: null,
        is_public: false,
        sources: {},
      },
      techStack: context.techStack || {
        languages: [],
        frameworks: [],
        infrastructure: [],
        tools: [],
        signals: { ai_adoption: false, modern_stack: false, cloud_native: false },
        sources: [],
      },
      customFields: context.customFields || {
        ceo_name: null,
        key_executives: [],
        icp_fit_score: 0,
        icp_fit_reasons: [],
        is_personal_site: false,
        pain_points: [],
        buying_signals: [],
        competitive_landscape: [],
        sources: {},
      },
      sources: Array.from(allSources),
    },
    errors: errors.length > 0 ? errors : undefined,
    duration_ms: duration,
    synthesis: synthesis || undefined,
    thoughts,
  }
}

// Alias for backward compatibility
export const orchestrateEnrichment = conductEnrichment
