import type { ToolSet } from "ai"
import { getFirecrawlClient } from "@/platform/firecrawl/service"
import { CompanyProfileResultSchema, COMPANY_PROFILE_EXTRACTION_SCHEMA } from "../schemas"
import { generateObjectWithFallback } from "@/ai/tools/llm.tool"
import type { Agent, DiscoveryResult, EnrichmentContext, CompanyProfileResult } from "../types"
import { extractTool, mapTool, scrapeTool } from "@/platform/firecrawl/ai-tools"
import { z } from "zod"

// Cast firecrawl tools to ToolSet type for AI SDK compatibility
const firecrawlTools = {
  map: mapTool as ToolSet[string],
  scrape: scrapeTool as ToolSet[string],
  extract: extractTool as ToolSet[string],
}

function classifySegment( employeeCount: number | null ): "SMB" | "Mid-Market" | "Enterprise" | "Unknown" {
  if ( !employeeCount ) return "Unknown"
  if ( employeeCount < 50 ) return "SMB"
  if ( employeeCount < 500 ) return "Mid-Market"
  return "Enterprise"
}

function parseEmployeeCount( value: unknown ): number | null {
  if ( typeof value === "number" ) return value
  if ( typeof value === "string" ) {
    // Handle ranges like "50-200" or "500+"
    const match = value.match( /(\d+)/ )
    if ( match ) return parseInt( match[1], 10 )
  }
  return null
}

export const companyProfileAgent: Agent<DiscoveryResult, CompanyProfileResult> = {
  name: "company_profile",
  timeout: 15000,

  async execute( discovery: DiscoveryResult ): Promise<CompanyProfileResult> {
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
      `You are extracting key company information for B2B sales intelligence. Look for:

INDUSTRY: What sector/vertical is this company in? (e.g., "Financial Services", "SaaS", "E-commerce", "Healthcare Technology")
HEADQUARTERS: Where is the company based? (City, State/Country)
EMPLOYEES: How many people work here? Look for "About Us", company pages, or footer mentions. If range like "50-200", use the lower number.
FOUNDED: What year was the company established?
BUSINESS MODEL: Who are their customers? (B2B = businesses, B2C = consumers, B2B2C = both)
DESCRIPTION: What does this company do? Brief 1-2 sentence summary.

Extract from any visible text including headers, footers, About pages, and metadata. Be thorough.`
    )

    if ( mainResult.success && mainResult.data ) {
      extractedData = mainResult.data.extract || mainResult.data
      Object.keys( extractedData ).forEach( ( key ) => {
        if ( extractedData[key] ) {
          sources[key] = [discovery.website]
        }
      } )
    }

    // Try About page if we're missing key data
    if ( !extractedData.industry || !extractedData.employee_count ) {
      for ( const aboutUrl of aboutUrls ) {
        try {
          const aboutResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
            aboutUrl,
            COMPANY_PROFILE_EXTRACTION_SCHEMA,
            "Extract company information from this About page."
          )

          if ( aboutResult.success && aboutResult.data ) {
            const aboutData = aboutResult.data.extract || aboutResult.data
            // Merge with existing data, preferring non-null values
            Object.keys( aboutData ).forEach( ( key ) => {
              if ( aboutData[key] && !extractedData[key] ) {
                extractedData[key] = aboutData[key]
                sources[key] = sources[key] || []
                sources[key].push( aboutUrl )
              }
            } )
            break // Stop after first successful About page
          }
        } catch {
          // About page doesn't exist, continue
        }
      }
    }

    // Tool-use fallback (Firecrawl AI SDK) when structured extraction is empty/unreliable
    const hasAnyCoreField = Boolean(
      extractedData.industry ||
      extractedData.headquarters ||
      extractedData.employee_count ||
      extractedData.year_founded ||
      extractedData.description
    )

    if ( !hasAnyCoreField ) {
      try {
        const FallbackSchema = z.object( {
          industry: z.string().nullable(),
          headquarters: z.string().nullable(),
          employee_count: z.union( [z.number(), z.string()] ).nullable(),
          employee_range: z.string().nullable(),
          year_founded: z.number().nullable(),
          business_type: z.string().nullable(),
          description: z.string().nullable(),
          sources: z.array( z.string() ).default( [] ),
        } )

        const { object } = await generateObjectWithFallback( {
          schema: FallbackSchema,
          tools: firecrawlTools,
          maxSteps: 8,
          temperature: 0.2,
          maxTokens: 900,
          prompt: `Extract firmographic data for this company.

Website: ${discovery.website}

Use Firecrawl tools to gather evidence:
- Use map to find the best "about", "company", "team", "careers", or "press" pages.
- Use scrape on the homepage + 1-2 relevant internal pages.

Return:
- industry (string | null)
- headquarters (string | null)
- employee_count (number | string | null)
- employee_range (string | null)
- year_founded (number | null)
- business_type (string | null)
- description (string | null)
- sources (array of URLs you relied on)

If you cannot find a field, return null for it.`,
        } )

        const fallbackSources = object.sources.length ? object.sources : [discovery.website]
        for ( const [key, value] of Object.entries( object ) ) {
          if ( key === "sources" ) continue
          if ( value != null && value !== "" && !extractedData[key] ) {
            extractedData[key] = value
            sources[key] = fallbackSources
          }
        }
      } catch {
        // optional fallback
      }
    }

    const employeeCount = parseEmployeeCount( extractedData.employee_count )

    const result = CompanyProfileResultSchema.parse( {
      industry: extractedData.industry || null,
      segment: classifySegment( employeeCount ),
      headquarters: extractedData.headquarters || null,
      employee_count: employeeCount,
      employee_range: typeof extractedData.employee_range === "string" ? extractedData.employee_range : null,
      year_founded: typeof extractedData.year_founded === "number" ? extractedData.year_founded : null,
      business_type: extractedData.business_type || null,
      description: extractedData.description || null,
      sources,
    } )

    return result
  },
}

export async function runCompanyProfileAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<CompanyProfileResult> {
  return companyProfileAgent.execute( discovery, context )
}
