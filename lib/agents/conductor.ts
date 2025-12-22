import Anthropic from "@anthropic-ai/sdk"
import { runDiscoveryAgent } from "./discovery"
import { runCompanyProfileAgent } from "./company-profile"
import { runFundingAgent } from "./funding"
import { runTechStackAgent } from "./tech-stack"
import { runCustomFieldsAgent } from "./custom-fields"
import type {
  EnrichmentInput,
  EnrichmentContext,
  EnrichmentResult,
  AgentPhase,
  AgentError,
} from "./types"

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

const anthropic = new Anthropic()

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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0]
    if (text.type !== "text") {
      throw new Error("Unexpected response type")
    }

    // Parse JSON from response
    const jsonMatch = text.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in response")
    }

    const result = JSON.parse(jsonMatch[0])

    // Emit analysis as thought
    onThought({
      type: "observation",
      content: result.analysis,
      timestamp: Date.now(),
    })

    // Convert to ConductorDecisions
    return result.decisions.map((d: { phase: AgentPhase; action: string; reason: string }) => ({
      phase: d.phase,
      action: d.action as "run" | "skip" | "modify",
      reason: d.reason,
    }))
  } catch (error) {
    console.error("[Conductor] Analysis failed:", error)
    // Default: run all agents
    return [
      { phase: "company_profile", action: "run" as const, reason: "Default behavior" },
      { phase: "funding", action: "run" as const, reason: "Default behavior" },
      { phase: "tech_stack", action: "run" as const, reason: "Default behavior" },
      { phase: "custom_fields", action: "run" as const, reason: "Default behavior" },
    ]
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0]
    if (text.type === "text" && text.text.trim()) {
      onThought({
        type: "insight",
        content: text.text.trim(),
        timestamp: Date.now(),
      })
      return text.text.trim()
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0]
    if (text.type === "text") {
      return text.text.trim()
    }
  } catch (error) {
    console.error("[Conductor] Synthesis failed:", error)
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
