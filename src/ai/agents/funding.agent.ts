import { getFirecrawlClient } from "@/platform/firecrawl/service"
import { FundingResultSchema, FUNDING_EXTRACTION_SCHEMA } from "../schemas"
import { generateObjectWithFallback } from "@/ai/tools/llm.tool"
import type { Agent, DiscoveryResult, EnrichmentContext, FundingResult } from "../types"
import { scrapeTool, searchTool } from "@/platform/firecrawl/ai-tools"
import { z } from "zod"

export const fundingAgent: Agent<DiscoveryResult, FundingResult> = {
  name: "funding",
  timeout: 10000,

  async execute( discovery: DiscoveryResult ): Promise<FundingResult> {
    const firecrawl = getFirecrawlClient()
    const sources: Record<string, string[]> = {}

    let extractedData: Record<string, unknown> = {}

    // Strategy 1: Check company website for funding/press info
    const pressUrls = [
      `${discovery.website}/press`,
      `${discovery.website}/news`,
      `${discovery.website}/newsroom`,
    ]

    // Try main website first
    const mainResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
      discovery.website,
      FUNDING_EXTRACTION_SCHEMA,
      `You are analyzing company funding and investment history. Extract:

FUNDING_STAGE: Current funding stage (Pre-Seed, Seed, Series A, Series B, Series C, etc., IPO, or "Public" if publicly traded)
TOTAL_FUNDING: Total amount raised across all rounds (e.g., "$50M", "$1.2B")
LAST_ROUND_DATE: Date of most recent funding round (month/year)
LAST_ROUND_AMOUNT: Amount raised in most recent round
INVESTORS: List of investor names (VCs, angel investors, firms)
VALUATION: Company valuation if mentioned (e.g., "$500M")
IS_PUBLIC: true if this is a publicly traded company (look for stock ticker symbols)

Look for funding info in:
- About/Company pages
- Press releases and news sections
- Investor relations pages
- Footer mentions of investors or "Backed by X"
- Homepage hero sections often mention recent funding

If no funding information is found, leave fields null. For private companies with no disclosed funding, that's normal.`
    )

    if ( mainResult.success && mainResult.data ) {
      extractedData = mainResult.data.extract || mainResult.data
      Object.keys( extractedData ).forEach( ( key ) => {
        if ( extractedData[key] ) {
          sources[key] = [discovery.website]
        }
      } )
    }

    // Strategy 2: Try Crunchbase if we have limited data
    if ( !extractedData.funding_stage && !extractedData.total_funding ) {
      const crunchbaseUrl = `https://www.crunchbase.com/organization/${discovery.domain.replace( /\.[^.]+$/, "" )}`

      try {
        const crunchbaseResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
          crunchbaseUrl,
          FUNDING_EXTRACTION_SCHEMA,
          "Extract funding stage, total funding raised, investors, and last round details."
        )

        if ( crunchbaseResult.success && crunchbaseResult.data ) {
          const cbData = crunchbaseResult.data.extract || crunchbaseResult.data
          Object.keys( cbData ).forEach( ( key ) => {
            if ( cbData[key] && !extractedData[key] ) {
              extractedData[key] = cbData[key]
              sources[key] = sources[key] || []
              sources[key].push( crunchbaseUrl )
            }
          } )
        }
      } catch {
        // Crunchbase page doesn't exist or blocked
      }
    }

    // Strategy 3: Try press/news pages
    if ( !extractedData.total_funding ) {
      for ( const pressUrl of pressUrls ) {
        try {
          const pressResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
            pressUrl,
            FUNDING_EXTRACTION_SCHEMA,
            "Extract funding announcements, investment rounds, and investor information."
          )

          if ( pressResult.success && pressResult.data ) {
            const pressData = pressResult.data.extract || pressResult.data
            Object.keys( pressData ).forEach( ( key ) => {
              if ( pressData[key] && !extractedData[key] ) {
                extractedData[key] = pressData[key]
                sources[key] = sources[key] || []
                sources[key].push( pressUrl )
              }
            } )
            break
          }
        } catch {
          // Press page doesn't exist
        }
      }
    }

    // Tool-use fallback when structured extraction yields nothing
    const hasFundingSignals = Boolean(
      extractedData.funding_stage ||
      extractedData.total_funding ||
      extractedData.last_round_amount ||
      ( Array.isArray( extractedData.investors ) && extractedData.investors.length > 0 ) ||
      extractedData.is_public === true
    )

    if ( !hasFundingSignals ) {
      try {
        const FundingFallbackSchema = z.object( {
          funding_stage: z.string().nullable(),
          total_funding: z.string().nullable(),
          last_round_date: z.string().nullable(),
          last_round_amount: z.string().nullable(),
          investors: z.array( z.string() ).default( [] ),
          valuation: z.string().nullable(),
          is_public: z.boolean().default( false ),
          sources: z.array( z.string() ).default( [] ),
        } )

        const { object } = await generateObjectWithFallback( {
          schema: FundingFallbackSchema,
          tools: { search: searchTool, scrape: scrapeTool },
          maxSteps: 8,
          temperature: 0.2,
          maxTokens: 900,
          prompt: `Find funding/investment information for this company.

Company: ${discovery.company_name}
Website: ${discovery.website}
Domain: ${discovery.domain}

Use Firecrawl tools:
- Search for funding announcements, Crunchbase-like summaries, investor pages, press releases.
- Scrape 1-3 high-confidence results.

Return:
- funding_stage (string | null)
- total_funding (string | null)
- last_round_date (string | null)
- last_round_amount (string | null)
- investors (string[])
- valuation (string | null)
- is_public (boolean)
- sources (array of URLs you relied on)

If nothing is found, return null/empty fields.`,
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

    // Parse investors array
    let investors: string[] = []
    if ( Array.isArray( extractedData.investors ) ) {
      investors = extractedData.investors.filter( ( i ): i is string => typeof i === "string" )
    }

    const result = FundingResultSchema.parse( {
      funding_stage: extractedData.funding_stage || null,
      total_funding: extractedData.total_funding || null,
      last_round_date: extractedData.last_round_date || null,
      last_round_amount: extractedData.last_round_amount || null,
      investors,
      valuation: extractedData.valuation || null,
      is_public: extractedData.is_public === true,
      sources,
    } )

    return result
  },
}

export async function runFundingAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<FundingResult> {
  return fundingAgent.execute( discovery, context )
}
