import { runDiscoveryAgent } from "./discovery"
import { runCompanyProfileAgent } from "./company-profile"
import { runFundingAgent } from "./funding"
import { runTechStackAgent } from "./tech-stack"
import { runCustomFieldsAgent } from "./custom-fields"
import { logAgentExecution } from "./utils"
import type {
  EnrichmentInput,
  EnrichmentContext,
  EnrichmentResult,
  AgentProgress,
  AgentPhase,
  AgentError,
  OrchestratorOptions,
  DEFAULT_AGENT_CONFIG,
} from "./types"

function mergeConfig(
  defaults: typeof DEFAULT_AGENT_CONFIG,
  overrides?: OrchestratorOptions["config"]
): typeof DEFAULT_AGENT_CONFIG {
  if (!overrides) return defaults
  const merged = { ...defaults }
  for (const phase of Object.keys(overrides) as AgentPhase[]) {
    if (overrides[phase]) {
      merged[phase] = { ...merged[phase], ...overrides[phase] }
    }
  }
  return merged
}

async function withTimeout<T>(promise: Promise<T>, ms: number, phase: AgentPhase): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${phase} agent timed out after ${ms}ms`))
    }, ms)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    clearTimeout(timeoutId!)
    return result
  } catch (error) {
    clearTimeout(timeoutId!)
    throw error
  }
}

async function runWithRetry<T>(
  fn: () => Promise<T>,
  retries: number,
  phase: AgentPhase
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (attempt < retries) {
        // Exponential backoff: 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError || new Error(`${phase} failed after ${retries + 1} attempts`)
}

export async function orchestrateEnrichment(
  input: EnrichmentInput,
  options: OrchestratorOptions = {}
): Promise<EnrichmentResult> {
  const startTime = Date.now()
  const { onProgress, abortSignal } = options
  const config = mergeConfig(
    {
      discovery: { enabled: true, timeout: 15000, retries: 2, required: true },
      company_profile: { enabled: true, timeout: 15000, retries: 1, required: false },
      funding: { enabled: true, timeout: 10000, retries: 1, required: false },
      tech_stack: { enabled: true, timeout: 10000, retries: 1, required: false },
      custom_fields: { enabled: true, timeout: 10000, retries: 0, required: false },
    },
    options.config
  )

  const errors: AgentError[] = []
  const context: EnrichmentContext = { input }

  const emitProgress = (progress: AgentProgress) => {
    if (onProgress) {
      try {
        onProgress(progress)
      } catch {
        // Ignore progress callback errors
      }
    }
  }

  // Check for abort
  const checkAbort = () => {
    if (abortSignal?.aborted) {
      throw new Error("Enrichment aborted")
    }
  }

  // Phase 1: Discovery (required)
  const discoveryStarted = Date.now()
  emitProgress({
    phase: "discovery",
    status: "running",
    progress: 0,
    message: "Identifying company...",
    startedAt: discoveryStarted,
  })

  try {
    checkAbort()
    const discoveryConfig = config.discovery
    context.discovery = await withTimeout(
      runWithRetry(() => runDiscoveryAgent(input, context), discoveryConfig.retries, "discovery"),
      discoveryConfig.timeout,
      "discovery"
    )

    const discoveryCompleted = Date.now()
    emitProgress({
      phase: "discovery",
      status: "completed",
      progress: 20,
      message: `Identified: ${context.discovery.company_name}`,
      completedAt: discoveryCompleted,
    })

    // Log successful execution
    logAgentExecution({
      agentName: "discovery",
      status: "completed",
      startedAt: discoveryStarted,
      completedAt: discoveryCompleted,
      durationMs: discoveryCompleted - discoveryStarted,
      inputData: input,
      outputData: context.discovery,
      sourcesAccessed: context.discovery.sources,
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Discovery failed"
    errors.push({ phase: "discovery", error: errorMsg, recoverable: false })

    emitProgress({
      phase: "discovery",
      status: "failed",
      progress: 0,
      message: errorMsg,
      error: errorMsg,
    })

    // Log failed execution
    logAgentExecution({
      agentName: "discovery",
      status: "failed",
      startedAt: discoveryStarted,
      completedAt: Date.now(),
      durationMs: Date.now() - discoveryStarted,
      inputData: input,
      errorMessage: errorMsg,
    })

    // Discovery is required - fail fast
    throw new Error(`Discovery failed: ${errorMsg}`)
  }

  // Phase 2: Company Profile
  if (config.company_profile.enabled) {
    const profileStarted = Date.now()
    emitProgress({
      phase: "company_profile",
      status: "running",
      progress: 20,
      message: "Gathering firmographics...",
      startedAt: profileStarted,
    })

    try {
      checkAbort()
      const profileConfig = config.company_profile
      context.profile = await withTimeout(
        runWithRetry(
          () => runCompanyProfileAgent(context.discovery!, context),
          profileConfig.retries,
          "company_profile"
        ),
        profileConfig.timeout,
        "company_profile"
      )

      const profileCompleted = Date.now()
      emitProgress({
        phase: "company_profile",
        status: "completed",
        progress: 40,
        message: `Industry: ${context.profile.industry || "Unknown"}`,
        completedAt: profileCompleted,
      })

      logAgentExecution({
        agentName: "company_profile",
        status: "completed",
        startedAt: profileStarted,
        completedAt: profileCompleted,
        durationMs: profileCompleted - profileStarted,
        outputData: context.profile,
        sourcesAccessed: Object.values(context.profile.sources).flat(),
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Company profile failed"
      errors.push({ phase: "company_profile", error: errorMsg, recoverable: true })

      emitProgress({
        phase: "company_profile",
        status: "failed",
        progress: 40,
        message: errorMsg,
        error: errorMsg,
      })

      logAgentExecution({
        agentName: "company_profile",
        status: "failed",
        startedAt: profileStarted,
        completedAt: Date.now(),
        durationMs: Date.now() - profileStarted,
        errorMessage: errorMsg,
      })
    }
  }

  // Phase 3 & 4: Funding and Tech Stack (parallel)
  emitProgress({
    phase: "funding",
    status: "running",
    progress: 40,
    message: "Researching funding data...",
    startedAt: Date.now(),
  })

  emitProgress({
    phase: "tech_stack",
    status: "running",
    progress: 40,
    message: "Detecting technology stack...",
    startedAt: Date.now(),
  })

  const parallelPromises: Promise<void>[] = []

  if (config.funding.enabled) {
    parallelPromises.push(
      (async () => {
        const fundingStarted = Date.now()
        try {
          checkAbort()
          const fundingConfig = config.funding
          context.funding = await withTimeout(
            runWithRetry(
              () => runFundingAgent(context.discovery!, context),
              fundingConfig.retries,
              "funding"
            ),
            fundingConfig.timeout,
            "funding"
          )

          const fundingCompleted = Date.now()
          emitProgress({
            phase: "funding",
            status: "completed",
            progress: 60,
            message: context.funding.funding_stage
              ? `Stage: ${context.funding.funding_stage}`
              : "Funding data gathered",
            completedAt: fundingCompleted,
          })

          logAgentExecution({
            agentName: "funding",
            status: "completed",
            startedAt: fundingStarted,
            completedAt: fundingCompleted,
            durationMs: fundingCompleted - fundingStarted,
            outputData: context.funding,
            sourcesAccessed: Object.values(context.funding.sources).flat(),
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Funding research failed"
          errors.push({ phase: "funding", error: errorMsg, recoverable: true })

          emitProgress({
            phase: "funding",
            status: "failed",
            progress: 60,
            message: errorMsg,
            error: errorMsg,
          })

          logAgentExecution({
            agentName: "funding",
            status: "failed",
            startedAt: fundingStarted,
            completedAt: Date.now(),
            durationMs: Date.now() - fundingStarted,
            errorMessage: errorMsg,
          })
        }
      })()
    )
  }

  if (config.tech_stack.enabled) {
    parallelPromises.push(
      (async () => {
        const techStarted = Date.now()
        try {
          checkAbort()
          const techConfig = config.tech_stack
          context.techStack = await withTimeout(
            runWithRetry(
              () => runTechStackAgent(context.discovery!, context),
              techConfig.retries,
              "tech_stack"
            ),
            techConfig.timeout,
            "tech_stack"
          )

          const techCompleted = Date.now()
          const techCount =
            (context.techStack.languages.length || 0) +
            (context.techStack.frameworks.length || 0)

          emitProgress({
            phase: "tech_stack",
            status: "completed",
            progress: 60,
            message: `Detected ${techCount} technologies`,
            completedAt: techCompleted,
          })

          logAgentExecution({
            agentName: "tech_stack",
            status: "completed",
            startedAt: techStarted,
            completedAt: techCompleted,
            durationMs: techCompleted - techStarted,
            outputData: context.techStack,
            sourcesAccessed: context.techStack.sources,
          })
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : "Tech detection failed"
          errors.push({ phase: "tech_stack", error: errorMsg, recoverable: true })

          emitProgress({
            phase: "tech_stack",
            status: "failed",
            progress: 60,
            message: errorMsg,
            error: errorMsg,
          })

          logAgentExecution({
            agentName: "tech_stack",
            status: "failed",
            startedAt: techStarted,
            completedAt: Date.now(),
            durationMs: Date.now() - techStarted,
            errorMessage: errorMsg,
          })
        }
      })()
    )
  }

  await Promise.all(parallelPromises)

  // Phase 5: Custom Fields
  if (config.custom_fields.enabled) {
    const customStarted = Date.now()
    emitProgress({
      phase: "custom_fields",
      status: "running",
      progress: 70,
      message: "Calculating ICP fit & extracting leadership...",
      startedAt: customStarted,
    })

    try {
      checkAbort()
      const customConfig = config.custom_fields
      context.customFields = await withTimeout(
        runWithRetry(() => runCustomFieldsAgent(context), customConfig.retries, "custom_fields"),
        customConfig.timeout,
        "custom_fields"
      )

      const customCompleted = Date.now()
      emitProgress({
        phase: "custom_fields",
        status: "completed",
        progress: 100,
        message: `ICP Score: ${context.customFields.icp_fit_score}/100`,
        completedAt: customCompleted,
      })

      logAgentExecution({
        agentName: "custom_fields",
        status: "completed",
        startedAt: customStarted,
        completedAt: customCompleted,
        durationMs: customCompleted - customStarted,
        outputData: context.customFields,
        sourcesAccessed: Object.values(context.customFields.sources).flat(),
      })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Custom fields failed"
      errors.push({ phase: "custom_fields", error: errorMsg, recoverable: true })

      emitProgress({
        phase: "custom_fields",
        status: "failed",
        progress: 100,
        message: errorMsg,
        error: errorMsg,
      })

      logAgentExecution({
        agentName: "custom_fields",
        status: "failed",
        startedAt: customStarted,
        completedAt: Date.now(),
        durationMs: Date.now() - customStarted,
        errorMessage: errorMsg,
      })
    }
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

  // Build result with defaults for failed agents
  const result: EnrichmentResult = {
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
  }

  return result
}

// Export for direct agent access
export { runDiscoveryAgent } from "./discovery"
export { runCompanyProfileAgent } from "./company-profile"
export { runFundingAgent } from "./funding"
export { runTechStackAgent } from "./tech-stack"
export { runCustomFieldsAgent } from "./custom-fields"
