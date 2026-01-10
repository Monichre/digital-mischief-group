import { getFirecrawlClient } from "@/lib/firecrawl/client"
import { CustomFieldsResultSchema, LEADERSHIP_EXTRACTION_SCHEMA } from "./schemas"
import { generateObjectWithFallback } from "./llm-provider"
import type { Agent, EnrichmentContext, CustomFieldsResult } from "./types"
import { mapTool, scrapeTool } from "@/lib/firecrawl/ai-tools"
import { z } from "zod"

// ICP (Ideal Customer Profile) configuration - customize per business
const ICP_CONFIG = {
  preferred_industries: ["technology", "software", "saas", "fintech", "healthcare tech", "ai", "machine learning"],
  preferred_segments: ["Mid-Market", "Enterprise"],
  min_employees: 50,
  max_employees: 5000,
  preferred_funding_stages: ["Series A", "Series B", "Series C", "Series D"],
}

// Patterns that indicate personal/portfolio sites
const PERSONAL_SITE_INDICATORS = [
  "personal website", "personal site", "portfolio", "freelance", "freelancer", "consultant", "blog",
  "resume", "cv", "about me", "my work", "my projects", "individual", "hire me", "contact me",
  "software engineer", "developer", "designer", "writer", "author", "speaker"
]

function isPersonalSite(context: EnrichmentContext): boolean {
  const { profile, discovery } = context
  let score = 0

  // 1. Check metadata (title/description/industry)
  const textToCheck = [
    profile?.industry,
    profile?.description,
    profile?.segment,
    discovery?.company_name
  ].filter(Boolean).join(" ").toLowerCase()

  // Strong explicit indicators
  if (PERSONAL_SITE_INDICATORS.some(indicator => textToCheck.includes(indicator))) {
    score += 3
  }

  // 2. Employee Count Signal
  // If explicitly 1, it's a strong signal, but could be a solo founder company
  if (profile?.employee_count === 1) {
    score += 2
  } else if (profile?.employee_count && profile.employee_count > 10) {
    // Large team is strong negative signal
    score -= 5
  }

  // 3. Company Structure Evidence (Negative Signals)
  const hasFunding = !!(context.funding?.total_funding || context.funding?.funding_stage)
  const hasTechStack = !!(context.techStack?.languages && context.techStack.languages.length > 0)
  const hasCommercialIndustry = profile?.industry && !["blog", "personal", "portfolio"].includes(profile.industry.toLowerCase())

  if (hasFunding) score -= 5
  if (hasTechStack) score -= 1 // Tech stack is weak signal (devs have portfolios with stacks)
  if (hasCommercialIndustry) score -= 1

  // 4. URL/Domain Signals
  const domain = discovery?.domain?.toLowerCase() || ""
  if (domain.endsWith(".me") || domain.endsWith(".blog") || domain.includes("portfolio")) {
    score += 2
  }
  
  // 5. "Hire Me" / Resume language
  if (textToCheck.includes("download resume") || textToCheck.includes("view cv") || textToCheck.includes("hire me")) {
    score += 3
  }

  // Threshold for classification
  return score >= 3
}

function calculateICPFit(context: EnrichmentContext): { score: number; reasons: string[]; isPersonalSite?: boolean } {
  const reasons: string[] = []

  const { profile, funding, techStack } = context

  // Check for personal/portfolio site first
  if (isPersonalSite(context)) {
    return {
      score: -1, // Special score to indicate personal site
      reasons: ["Personal or portfolio website detected"],
      isPersonalSite: true
    }
  }

  let score = 0

  // Industry match (0-30 points)
  if (profile?.industry) {
    const industryLower = profile.industry.toLowerCase()
    if (ICP_CONFIG.preferred_industries.some((i) => industryLower.includes(i))) {
      score += 30
      reasons.push(`Target industry: ${profile.industry}`)
    }
  }

  // Company size (0-25 points)
  if (profile?.employee_count) {
    if (profile.employee_count >= ICP_CONFIG.min_employees && profile.employee_count <= ICP_CONFIG.max_employees) {
      score += 25
      reasons.push(`Growth stage company (${profile.employee_count} employees)`)
    } else if (profile.employee_count > ICP_CONFIG.max_employees) {
      score += 15
      reasons.push(`Enterprise company (${profile.employee_count} employees)`)
    }
  }

  // Segment match (0-10 points)
  if (profile?.segment && ICP_CONFIG.preferred_segments.includes(profile.segment)) {
    score += 10
    reasons.push(`${profile.segment} segment`)
  }

  // Tech stack signals (0-20 points)
  if (techStack?.signals) {
    if (techStack.signals.ai_adoption) {
      score += 10
      reasons.push("AI adoption detected")
    }
    if (techStack.signals.modern_stack) {
      score += 5
      reasons.push("Modern technology stack")
    }
    if (techStack.signals.cloud_native) {
      score += 5
      reasons.push("Cloud-native infrastructure")
    }
  }

  // Funding signals (0-15 points)
  if (funding?.funding_stage) {
    if (ICP_CONFIG.preferred_funding_stages.some((s) => funding.funding_stage?.includes(s))) {
      score += 15
      reasons.push(`Funded: ${funding.funding_stage}`)
    } else if (funding.funding_stage.toLowerCase().includes("seed")) {
      score += 5
      reasons.push("Early-stage funding")
    }
  }

  return { score: Math.min(score, 100), reasons, isPersonalSite: false }
}

function inferPainPoints(context: EnrichmentContext): string[] {
  const painPoints: string[] = []
  const { profile, techStack } = context

  // Industry-based pain points
  if (profile?.industry) {
    const industry = profile.industry.toLowerCase()
    if (industry.includes("saas") || industry.includes("software")) {
      painPoints.push("Customer acquisition cost optimization")
      painPoints.push("Churn reduction")
    }
    if (industry.includes("fintech") || industry.includes("finance")) {
      painPoints.push("Regulatory compliance")
      painPoints.push("Security and fraud prevention")
    }
    if (industry.includes("healthcare")) {
      painPoints.push("HIPAA compliance")
      painPoints.push("Data interoperability")
    }
  }

  // Growth-stage pain points
  if (profile?.segment === "Mid-Market") {
    painPoints.push("Scaling operations efficiently")
    painPoints.push("Process automation")
  }

  // Tech-based pain points
  if (techStack && !techStack.signals.modern_stack) {
    painPoints.push("Technical debt and modernization")
  }

  return painPoints.slice(0, 5) // Max 5 pain points
}

function detectBuyingSignals(context: EnrichmentContext): Array<{ signal: string; confidence: number }> {
  const signals: Array<{ signal: string; confidence: number }> = []
  const { funding, profile, techStack } = context

  // Recent funding = likely spending
  if (funding?.last_round_date) {
    const roundDate = new Date(funding.last_round_date)
    const monthsAgo = (Date.now() - roundDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    if (monthsAgo < 12) {
      signals.push({ signal: "Recent funding (likely investing in growth)", confidence: 0.8 })
    }
  }

  // Growing company
  if (profile?.segment === "Mid-Market" || profile?.segment === "Enterprise") {
    signals.push({ signal: "Growth-stage company with budget", confidence: 0.6 })
  }

  // Modern tech = likely to adopt new tools
  if (techStack?.signals.modern_stack) {
    signals.push({ signal: "Modern tech stack (early adopter profile)", confidence: 0.7 })
  }

  // AI adoption = innovation-focused
  if (techStack?.signals.ai_adoption) {
    signals.push({ signal: "AI investment (innovation-focused)", confidence: 0.75 })
  }

  return signals.slice(0, 5)
}

export const customFieldsAgent: Agent<EnrichmentContext, CustomFieldsResult> = {
  name: "custom_fields",
  timeout: 10000,

  async execute(_input: EnrichmentContext, context: EnrichmentContext): Promise<CustomFieldsResult> {
    const firecrawl = getFirecrawlClient()
    const sources: Record<string, string[]> = {}

    // Extract leadership from About/Team page
    let ceoName: string | null = null
    const keyExecutives: Array<{ name: string; title: string; linkedin: string | null }> = []

    const discovery = context.discovery
    if (discovery) {
      // Method 1: Try Firecrawl Agent for intelligent navigation to find executives
      try {
        const agentResult = await firecrawl.runAgent({
          url: discovery.website,
          prompt: `Find the leadership team or executive team for this company. Navigate to the About, Team, or Leadership page. Extract:
1. The CEO's name
2. Key executives (name, title, and LinkedIn URL if available)
Return structured data with ceo_name and an executives array.`,
          schema: {
            type: "object",
            properties: {
              ceo_name: { type: "string" },
              executives: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    title: { type: "string" },
                    linkedin: { type: "string" },
                  },
                },
              },
            },
          },
          enableWebSearch: false,
          maxWaitMs: 30000,
        })

        if (agentResult.success && agentResult.data) {
          const agentData = agentResult.data as { ceo_name?: string; executives?: Array<{ name: string; title: string; linkedin?: string }> }
          if (agentData.ceo_name) {
            ceoName = agentData.ceo_name
            sources["ceo_name"] = [discovery.website]
          }
          if (Array.isArray(agentData.executives)) {
            for (const exec of agentData.executives) {
              keyExecutives.push({
                name: exec.name,
                title: exec.title,
                linkedin: exec.linkedin || null,
              })
            }
            if (keyExecutives.length > 0) {
              sources["key_executives"] = [discovery.website]
            }
          }
        }
      } catch {
        // Agent not available or failed, fallback to URL-based extraction
      }

      // Method 2: Fallback - try common team page URLs
      if (!ceoName && keyExecutives.length === 0) {
        const teamUrls = [
          `${discovery.website}/about`,
          `${discovery.website}/team`,
          `${discovery.website}/about-us`,
          `${discovery.website}/leadership`,
        ]

        for (const teamUrl of teamUrls) {
          try {
            const teamResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
              teamUrl,
              LEADERSHIP_EXTRACTION_SCHEMA,
              "Extract the leadership team, including CEO name, executives with their titles and LinkedIn URLs."
            )

            if (teamResult.success && teamResult.data) {
              const data = teamResult.data.extract || teamResult.data

              if (data.ceo_name && typeof data.ceo_name === "string") {
                ceoName = data.ceo_name
                sources["ceo_name"] = [teamUrl]
              }

              if (Array.isArray(data.executives)) {
                for (const exec of data.executives) {
                  if (exec && typeof exec === "object" && "name" in exec && "title" in exec) {
                    keyExecutives.push({
                      name: String(exec.name),
                      title: String(exec.title),
                      linkedin: exec.linkedin ? String(exec.linkedin) : null,
                    })
                  }
                }
                if (keyExecutives.length > 0) {
                  sources["key_executives"] = [teamUrl]
                }
              }

              if (ceoName || keyExecutives.length > 0) break
            }
          } catch {
            // Team page doesn't exist
          }
        }
      }

      // Method 3: Tool-use fallback (Firecrawl AI SDK)
      if (!ceoName && keyExecutives.length === 0) {
        try {
          const LeadershipSchema = z.object({
            ceo_name: z.string().nullable(),
            executives: z
              .array(
                z.object({
                  name: z.string(),
                  title: z.string(),
                  linkedin: z.string().nullable().optional(),
                })
              )
              .default([]),
            sources: z.array(z.string()).default([]),
          })

          const { object } = await generateObjectWithFallback({
            schema: LeadershipSchema,
            tools: { map: mapTool, scrape: scrapeTool },
            maxSteps: 10,
            temperature: 0.2,
            maxTokens: 900,
            prompt: `Find the leadership/executive team for this entity.

Website: ${discovery.website}

Use Firecrawl tools:
- Map the site to find the best "about", "team", "leadership", "company" pages.
- Scrape the most relevant page(s).

Return:
- ceo_name (string | null)
- executives: array of { name, title, linkedin? }
- sources: array of URLs you relied on

If the site is personal/portfolio and no executives exist, return null/empty.`,
          })

          if (object.ceo_name) {
            ceoName = object.ceo_name
            sources["ceo_name"] = object.sources.length ? object.sources : [discovery.website]
          }

          if (object.executives.length > 0) {
            for (const exec of object.executives) {
              keyExecutives.push({
                name: exec.name,
                title: exec.title,
                linkedin: exec.linkedin ?? null,
              })
            }
            sources["key_executives"] = object.sources.length ? object.sources : [discovery.website]
          }
        } catch {
          // optional fallback
        }
      }
    }

    // Calculate ICP fit
    const { score: icpScore, reasons: icpReasons, isPersonalSite } = calculateICPFit(context)

    // Infer pain points (skip for personal sites)
    const painPoints = isPersonalSite ? [] : inferPainPoints(context)

    // Detect buying signals (skip for personal sites)
    const buyingSignals = isPersonalSite ? [] : detectBuyingSignals(context)

    // Competitive landscape - would need more sophisticated search
    const competitiveLandscape: string[] = []

    const result = CustomFieldsResultSchema.parse({
      ceo_name: ceoName,
      key_executives: keyExecutives.slice(0, 10), // Max 10 executives
      icp_fit_score: icpScore,
      icp_fit_reasons: icpReasons,
      is_personal_site: isPersonalSite,
      pain_points: painPoints,
      buying_signals: buyingSignals,
      competitive_landscape: competitiveLandscape,
      sources,
    })

    return result
  },
}

export async function runCustomFieldsAgent(context: EnrichmentContext): Promise<CustomFieldsResult> {
  return customFieldsAgent.execute(context, context)
}
