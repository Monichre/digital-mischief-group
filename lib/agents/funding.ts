import { getFirecrawlClient } from "@/lib/firecrawl/client"
import { FundingResultSchema, FUNDING_EXTRACTION_SCHEMA } from "./schemas"
import type { Agent, DiscoveryResult, EnrichmentContext, FundingResult } from "./types"

export const fundingAgent: Agent<DiscoveryResult, FundingResult> = {
  name: "funding",
  timeout: 10000,

  async execute(discovery: DiscoveryResult): Promise<FundingResult> {
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
      "Extract any funding information, investment rounds, or investor details mentioned on this page."
    )

    if (mainResult.success && mainResult.data) {
      extractedData = mainResult.data.extract || mainResult.data
      Object.keys(extractedData).forEach((key) => {
        if (extractedData[key]) {
          sources[key] = [discovery.website]
        }
      })
    }

    // Strategy 2: Try Crunchbase if we have limited data
    if (!extractedData.funding_stage && !extractedData.total_funding) {
      const crunchbaseUrl = `https://www.crunchbase.com/organization/${discovery.domain.replace(/\.[^.]+$/, "")}`

      try {
        const crunchbaseResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
          crunchbaseUrl,
          FUNDING_EXTRACTION_SCHEMA,
          "Extract funding stage, total funding raised, investors, and last round details."
        )

        if (crunchbaseResult.success && crunchbaseResult.data) {
          const cbData = crunchbaseResult.data.extract || crunchbaseResult.data
          Object.keys(cbData).forEach((key) => {
            if (cbData[key] && !extractedData[key]) {
              extractedData[key] = cbData[key]
              sources[key] = sources[key] || []
              sources[key].push(crunchbaseUrl)
            }
          })
        }
      } catch {
        // Crunchbase page doesn't exist or blocked
      }
    }

    // Strategy 3: Try press/news pages
    if (!extractedData.total_funding) {
      for (const pressUrl of pressUrls) {
        try {
          const pressResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
            pressUrl,
            FUNDING_EXTRACTION_SCHEMA,
            "Extract funding announcements, investment rounds, and investor information."
          )

          if (pressResult.success && pressResult.data) {
            const pressData = pressResult.data.extract || pressResult.data
            Object.keys(pressData).forEach((key) => {
              if (pressData[key] && !extractedData[key]) {
                extractedData[key] = pressData[key]
                sources[key] = sources[key] || []
                sources[key].push(pressUrl)
              }
            })
            break
          }
        } catch {
          // Press page doesn't exist
        }
      }
    }

    // Parse investors array
    let investors: string[] = []
    if (Array.isArray(extractedData.investors)) {
      investors = extractedData.investors.filter((i): i is string => typeof i === "string")
    }

    const result = FundingResultSchema.parse({
      funding_stage: extractedData.funding_stage || null,
      total_funding: extractedData.total_funding || null,
      last_round_date: extractedData.last_round_date || null,
      last_round_amount: extractedData.last_round_amount || null,
      investors,
      valuation: extractedData.valuation || null,
      is_public: extractedData.is_public === true,
      sources,
    })

    return result
  },
}

export async function runFundingAgent(
  discovery: DiscoveryResult,
  context: EnrichmentContext
): Promise<FundingResult> {
  return fundingAgent.execute(discovery, context)
}
