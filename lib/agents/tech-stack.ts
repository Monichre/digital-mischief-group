import { getFirecrawlClient } from "@/lib/firecrawl/client"
import { TechStackResultSchema, TECH_STACK_EXTRACTION_SCHEMA } from "./schemas"
import type { Agent, DiscoveryResult, EnrichmentContext, TechStackResult } from "./types"

// Known technology patterns for classification
const TECH_PATTERNS = {
  languages: ["javascript", "typescript", "python", "go", "golang", "rust", "java", "ruby", "php", "c#", "c++", "swift", "kotlin"],
  frameworks: ["react", "next.js", "nextjs", "vue", "angular", "svelte", "django", "fastapi", "flask", "rails", "express", "nest.js", "spring"],
  infrastructure: ["aws", "amazon web services", "gcp", "google cloud", "azure", "vercel", "netlify", "cloudflare", "heroku", "digitalocean", "kubernetes", "docker"],
  tools: ["stripe", "intercom", "segment", "mixpanel", "datadog", "sentry", "hubspot", "salesforce", "slack", "zendesk", "twilio"],
}

function classifyTechnology(tech: string): "languages" | "frameworks" | "infrastructure" | "tools" | null {
  const lower = tech.toLowerCase()
  for (const [category, patterns] of Object.entries(TECH_PATTERNS)) {
    if (patterns.some((p) => lower.includes(p))) {
      return category as keyof typeof TECH_PATTERNS
    }
  }
  return null
}

function detectSignals(allTech: string[]): { ai_adoption: boolean; modern_stack: boolean; cloud_native: boolean } {
  const techLower = allTech.map((t) => t.toLowerCase())

  const aiKeywords = ["openai", "gpt", "llm", "machine learning", "ml", "ai", "tensorflow", "pytorch", "langchain"]
  const modernKeywords = ["react", "next.js", "typescript", "graphql", "tailwind", "vercel", "serverless"]
  const cloudKeywords = ["kubernetes", "k8s", "docker", "aws", "gcp", "azure", "terraform", "cloudflare"]

  return {
    ai_adoption: techLower.some((t) => aiKeywords.some((k) => t.includes(k))),
    modern_stack: techLower.filter((t) => modernKeywords.some((k) => t.includes(k))).length >= 2,
    cloud_native: techLower.filter((t) => cloudKeywords.some((k) => t.includes(k))).length >= 2,
  }
}

export const techStackAgent: Agent<DiscoveryResult, TechStackResult> = {
  name: "tech_stack",
  timeout: 10000,

  async execute(discovery: DiscoveryResult): Promise<TechStackResult> {
    const firecrawl = getFirecrawlClient()
    const sources: string[] = [discovery.website]

    const languages: Set<string> = new Set()
    const frameworks: Set<string> = new Set()
    const infrastructure: Set<string> = new Set()
    const tools: Set<string> = new Set()

    // Strategy 1: Scrape main website with tech detection
    const mainResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
      discovery.website,
      TECH_STACK_EXTRACTION_SCHEMA,
      "Identify all technologies, frameworks, programming languages, cloud services, and developer tools mentioned or detected on this website."
    )

    if (mainResult.success && mainResult.data) {
      const data = mainResult.data.extract || mainResult.data

      // Process technologies array
      const techs = Array.isArray(data.technologies) ? data.technologies : []
      for (const tech of techs) {
        if (typeof tech !== "string") continue
        const category = classifyTechnology(tech)
        if (category === "languages") languages.add(tech)
        else if (category === "frameworks") frameworks.add(tech)
        else if (category === "infrastructure") infrastructure.add(tech)
        else if (category === "tools") tools.add(tech)
        else frameworks.add(tech) // Default to frameworks
      }

      // Process infrastructure array
      const infra = Array.isArray(data.infrastructure) ? data.infrastructure : []
      for (const item of infra) {
        if (typeof item === "string") infrastructure.add(item)
      }
    }

    // Strategy 2: Check careers/jobs page for tech requirements
    const careersUrls = [
      `${discovery.website}/careers`,
      `${discovery.website}/jobs`,
    ]

    for (const careersUrl of careersUrls) {
      try {
        const careersResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
          careersUrl,
          TECH_STACK_EXTRACTION_SCHEMA,
          "Extract all programming languages, frameworks, and technologies mentioned in job requirements."
        )

        if (careersResult.success && careersResult.data) {
          sources.push(careersUrl)
          const data = careersResult.data.extract || careersResult.data
          const techs = Array.isArray(data.technologies) ? data.technologies : []

          for (const tech of techs) {
            if (typeof tech !== "string") continue
            const category = classifyTechnology(tech)
            if (category === "languages") languages.add(tech)
            else if (category === "frameworks") frameworks.add(tech)
            else if (category === "infrastructure") infrastructure.add(tech)
            else if (category === "tools") tools.add(tech)
          }
          break
        }
      } catch {
        // Careers page doesn't exist
      }
    }

    const allTech = [
      ...Array.from(languages),
      ...Array.from(frameworks),
      ...Array.from(infrastructure),
      ...Array.from(tools),
    ]

    const result = TechStackResultSchema.parse({
      languages: Array.from(languages),
      frameworks: Array.from(frameworks),
      infrastructure: Array.from(infrastructure),
      tools: Array.from(tools),
      signals: detectSignals(allTech),
      sources,
    })

    return result
  },
}

export async function runTechStackAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<TechStackResult> {
  return techStackAgent.execute(discovery, context)
}
