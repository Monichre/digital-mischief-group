import Anthropic from "@anthropic-ai/sdk"
import { getFirecrawlClient } from "@/lib/firecrawl/client"

// ============================================================================
// Types
// ============================================================================

export interface CompetitiveInput {
  company_name: string
  domain: string
  industry: string | null
  description: string | null
  segment: string | null
}

export interface Competitor {
  name: string
  domain: string
  website: string
  positioning: string
  value_props: string[]
  price_tier: "budget" | "mid-market" | "premium" | "enterprise"
  segment: string
  confidence: number
}

export interface CompetitiveDiscoveryResult {
  success: boolean
  data?: {
    competitors: Competitor[]
    positioning_statement: string
    value_propositions: string[]
    target_segments: string[]
    differentiation_points: string[]
    price_tier: "budget" | "mid-market" | "premium" | "enterprise"
    pricing_model: string
    sources: string[]
  }
  error?: string
}

// ============================================================================
// Main Discovery Agent
// ============================================================================

export async function discoverCompetitors(
  input: CompetitiveInput
): Promise<CompetitiveDiscoveryResult> {
  try {
    const anthropic = new Anthropic()
    const firecrawl = getFirecrawlClient()

    // Step 1: Use Claude to generate search queries for competitors
    const searchQueries = await generateCompetitorSearchQueries(input, anthropic)

    // Step 2: Search for competitors using Firecrawl
    const competitorUrls = await searchCompetitors(searchQueries, firecrawl)

    // Step 3: Extract competitor info from their websites
    const competitors = await extractCompetitorInfo(competitorUrls, firecrawl, anthropic)

    // Step 4: Analyze source company positioning
    const positioning = await analyzePositioning(input, competitors, anthropic)

    return {
      success: true,
      data: {
        competitors: competitors.slice(0, 15), // Max 15 competitors
        ...positioning,
      },
    }
  } catch (error) {
    console.error("[Competitive Discovery] Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

async function generateCompetitorSearchQueries(
  input: CompetitiveInput,
  anthropic: Anthropic
): Promise<string[]> {
  const prompt = `You are a market research analyst. Generate 3-5 search queries to find direct competitors of this company.

Company: ${input.company_name}
Industry: ${input.industry || "Unknown"}
Description: ${input.description || "No description"}
Segment: ${input.segment || "Unknown"}

Generate search queries that would find:
1. Direct competitors (same industry, same segment)
2. Alternative solutions (different approach, same problem)
3. Market leaders in this space

Return ONLY a JSON array of search query strings, no explanation.
Example: ["enterprise CRM software competitors", "best alternatives to Salesforce", "B2B sales automation tools"]`

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude")
  }

  try {
    const queries = JSON.parse(content.text)
    return Array.isArray(queries) ? queries : []
  } catch {
    // Fallback: extract queries from text
    return [
      `${input.industry} competitors`,
      `alternatives to ${input.company_name}`,
      `best ${input.segment} ${input.industry} companies`,
    ]
  }
}

async function searchCompetitors(
  queries: string[],
  firecrawl: any
): Promise<string[]> {
  const urls: Set<string> = new Set()

  for (const query of queries.slice(0, 3)) {
    try {
      const result = await firecrawl.search(query, { limit: 10 })
      if (result.success && result.data) {
        for (const item of result.data) {
          if (item.url) {
            urls.add(item.url)
          }
        }
      }
    } catch (error) {
      console.error(`[Search] Error for query "${query}":`, error)
    }
  }

  return Array.from(urls).slice(0, 20) // Max 20 URLs to analyze
}

async function extractCompetitorInfo(
  urls: string[],
  firecrawl: any,
  anthropic: Anthropic
): Promise<Competitor[]> {
  const competitors: Competitor[] = []

  for (const url of urls) {
    try {
      // Scrape competitor website
      const scrapeResult = await firecrawl.scrapeUrl(url, {
        formats: ["markdown"],
        onlyMainContent: true,
      })

      if (!scrapeResult.success || !scrapeResult.data?.markdown) {
        continue
      }

      const markdown = scrapeResult.data.markdown.slice(0, 8000) // Limit content

      // Use Claude to extract competitive info
      const prompt = `Extract competitive intelligence from this company website:

${markdown}

Extract and return ONLY a JSON object with:
{
  "name": "Company name",
  "positioning": "One-sentence positioning statement",
  "value_props": ["Value prop 1", "Value prop 2", "Value prop 3"],
  "price_tier": "budget|mid-market|premium|enterprise",
  "segment": "Target customer segment (SMB, mid-market, enterprise, etc.)"
}

If you cannot extract confident information, return null for that field.`

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      })

      const content = response.content[0]
      if (content.type !== "text") continue

      try {
        const data = JSON.parse(content.text)
        if (data.name && data.positioning) {
          const domain = new URL(url).hostname.replace("www.", "")
          competitors.push({
            name: data.name,
            domain,
            website: url,
            positioning: data.positioning,
            value_props: data.value_props || [],
            price_tier: data.price_tier || "mid-market",
            segment: data.segment || "Unknown",
            confidence: 0.8,
          })
        }
      } catch (error) {
        console.error(`[Extract] JSON parse error for ${url}:`, error)
      }

      // Limit rate: 2 seconds between scrapes
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Stop if we have enough competitors
      if (competitors.length >= 15) break
    } catch (error) {
      console.error(`[Extract] Error for ${url}:`, error)
    }
  }

  return competitors
}

async function analyzePositioning(
  input: CompetitiveInput,
  competitors: Competitor[],
  anthropic: Anthropic
): Promise<{
  positioning_statement: string
  value_propositions: string[]
  target_segments: string[]
  differentiation_points: string[]
  price_tier: "budget" | "mid-market" | "premium" | "enterprise"
  pricing_model: string
  sources: string[]
}> {
  const competitorSummary = competitors
    .map((c) => `- ${c.name}: ${c.positioning} (${c.price_tier})`)
    .join("\n")

  const prompt = `You are a market positioning analyst. Analyze this company against its competitors.

COMPANY:
Name: ${input.company_name}
Industry: ${input.industry}
Description: ${input.description}
Segment: ${input.segment}

COMPETITORS:
${competitorSummary}

Generate a comprehensive market positioning analysis. Return ONLY a JSON object:
{
  "positioning_statement": "One clear sentence describing unique market position",
  "value_propositions": ["Value prop 1", "Value prop 2", "Value prop 3"],
  "target_segments": ["Segment 1", "Segment 2"],
  "differentiation_points": ["Diff 1", "Diff 2", "Diff 3"],
  "price_tier": "budget|mid-market|premium|enterprise",
  "pricing_model": "freemium|subscription|usage-based|enterprise|custom"
}`

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  })

  const content = response.content[0]
  if (content.type !== "text") {
    throw new Error("Unexpected response from Claude")
  }

  const data = JSON.parse(content.text)

  return {
    positioning_statement: data.positioning_statement,
    value_propositions: data.value_propositions || [],
    target_segments: data.target_segments || [],
    differentiation_points: data.differentiation_points || [],
    price_tier: data.price_tier || "mid-market",
    pricing_model: data.pricing_model || "subscription",
    sources: competitors.map((c) => c.website),
  }
}
