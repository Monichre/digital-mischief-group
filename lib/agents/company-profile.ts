import { getFirecrawlClient } from "@/lib/firecrawl/client"
import { CompanyProfileResultSchema, COMPANY_PROFILE_EXTRACTION_SCHEMA } from "./schemas"
import type { Agent, DiscoveryResult, EnrichmentContext, CompanyProfileResult } from "./types"

function classifySegment(employeeCount: number | null): "SMB" | "Mid-Market" | "Enterprise" | "Unknown" {
  if (!employeeCount) return "Unknown"
  if (employeeCount < 50) return "SMB"
  if (employeeCount < 500) return "Mid-Market"
  return "Enterprise"
}

function parseEmployeeCount(value: unknown): number | null {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    // Handle ranges like "50-200" or "500+"
    const match = value.match(/(\d+)/)
    if (match) return parseInt(match[1], 10)
  }
  return null
}

export const companyProfileAgent: Agent<DiscoveryResult, CompanyProfileResult> = {
  name: "company_profile",
  timeout: 15000,

  async execute(discovery: DiscoveryResult): Promise<CompanyProfileResult> {
    const firecrawl = getFirecrawlClient()
    const sources: Record<string, string[]> = {}

    // Try to find and scrape About page
    const aboutUrls = [
      `${discovery.website}/about`,
      `${discovery.website}/about-us`,
      `${discovery.website}/company`,
    ]

    let extractedData: Record<string, unknown> = {}

    // First, try the main website
    const mainResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
      discovery.website,
      COMPANY_PROFILE_EXTRACTION_SCHEMA,
      "Extract company firmographic information including industry, headquarters location, employee count, founding year, and business model (B2B/B2C)."
    )

    if (mainResult.success && mainResult.data) {
      extractedData = mainResult.data.extract || mainResult.data
      Object.keys(extractedData).forEach((key) => {
        if (extractedData[key]) {
          sources[key] = [discovery.website]
        }
      })
    }

    // Try About page if we're missing key data
    if (!extractedData.industry || !extractedData.employee_count) {
      for (const aboutUrl of aboutUrls) {
        try {
          const aboutResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
            aboutUrl,
            COMPANY_PROFILE_EXTRACTION_SCHEMA,
            "Extract company information from this About page."
          )

          if (aboutResult.success && aboutResult.data) {
            const aboutData = aboutResult.data.extract || aboutResult.data
            // Merge with existing data, preferring non-null values
            Object.keys(aboutData).forEach((key) => {
              if (aboutData[key] && !extractedData[key]) {
                extractedData[key] = aboutData[key]
                sources[key] = sources[key] || []
                sources[key].push(aboutUrl)
              }
            })
            break // Stop after first successful About page
          }
        } catch {
          // About page doesn't exist, continue
        }
      }
    }

    const employeeCount = parseEmployeeCount(extractedData.employee_count)

    const result = CompanyProfileResultSchema.parse({
      industry: extractedData.industry || null,
      segment: classifySegment(employeeCount),
      headquarters: extractedData.headquarters || null,
      employee_count: employeeCount,
      employee_range: typeof extractedData.employee_range === "string" ? extractedData.employee_range : null,
      year_founded: typeof extractedData.year_founded === "number" ? extractedData.year_founded : null,
      business_type: extractedData.business_type || null,
      description: extractedData.description || null,
      sources,
    })

    return result
  },
}

export async function runCompanyProfileAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<CompanyProfileResult> {
  return companyProfileAgent.execute(discovery, context)
}
