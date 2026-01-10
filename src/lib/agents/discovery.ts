import { getFirecrawlClient, normalizeUrl, extractDomain, extractDomainFromEmail } from "@/lib/firecrawl/client"
import { DiscoveryResultSchema, DISCOVERY_EXTRACTION_SCHEMA } from "./schemas"
import type { Agent, EnrichmentInput, EnrichmentContext, DiscoveryResult } from "./types"

export const discoveryAgent: Agent<EnrichmentInput, DiscoveryResult> = {
  name: "discovery",
  timeout: 15000,

  async execute( input: EnrichmentInput ): Promise<DiscoveryResult> {
    const firecrawl = getFirecrawlClient()
    const sources: string[] = []

    // Step 1: Normalize input to domain/URL
    let domain: string
    let url: string

    if ( input.email ) {
      const extracted = extractDomainFromEmail( input.email )
      if ( !extracted ) {
        throw new Error( `Could not extract domain from email: ${input.email}` )
      }
      domain = extracted
      url = `https://${domain}`
    } else if ( input.url ) {
      url = normalizeUrl( input.url )
      domain = extractDomain( url )
    } else if ( input.domain ) {
      domain = input.domain.replace( /^(https?:\/\/)?(www\.)?/, "" ).split( "/" )[0]
      url = `https://${domain}`
    } else if ( input.company_name ) {
      // For company name, search to find the correct domain
      const searchResult = await firecrawl.search( {
        query: `${input.company_name} official website company`,
        limit: 3,
      } )

      if ( searchResult.success && searchResult.data && searchResult.data.length > 0 ) {
        // Find the most likely official website from search results
        const officialSite = searchResult.data.find( ( r ) => {
          const resultDomain = extractDomain( r.url )
          const normalizedCompany = input.company_name!
            .toLowerCase()
            .replace( /[^a-z0-9]/g, "" )
          return (
            resultDomain.includes( normalizedCompany.slice( 0, 10 ) ) ||
            r.title?.toLowerCase().includes( input.company_name!.toLowerCase() )
          )
        } ) || searchResult.data[0]

        url = officialSite.url
        domain = extractDomain( url )
        sources.push( ...searchResult.data.map( ( r ) => r.url ) )
      } else {
        // Fallback: use a heuristic
        const guessedDomain = input.company_name
          .toLowerCase()
          .replace( /[^a-z0-9]/g, "" )
          .slice( 0, 20 )
        url = `https://${guessedDomain}.com`
        domain = `${guessedDomain}.com`
      }
    } else {
      throw new Error( "No valid input provided (email, domain, url, or company_name required)" )
    }

    if ( !sources.includes( url ) ) {
      sources.push( url )
    }

    // Step 2: Scrape the website to extract company info
    const extractResult = await firecrawl.extract<{ extract: Record<string, unknown> }>(
      url,
      DISCOVERY_EXTRACTION_SCHEMA,
      "Extract the official company name and verify this is the correct website. Look for the company name in the header, footer, about page, or meta tags."
    )

    let companyName = input.company_name || domain.split( "." )[0]
    let confidence = 0.5

    if ( extractResult.success && extractResult.data ) {
      const extracted = extractResult.data.extract || extractResult.data
      if ( extracted.company_name && typeof extracted.company_name === "string" ) {
        companyName = extracted.company_name
        confidence = 0.9
      }
      if ( extracted.website && typeof extracted.website === "string" ) {
        // Verify the website matches
        const extractedDomain = extractDomain( extracted.website )
        if ( extractedDomain === domain ) {
          confidence = Math.min( confidence + 0.1, 1 )
        }
      }
    }

    // Step 3: Validate result with schema
    const result = DiscoveryResultSchema.parse( {
      company_name: companyName,
      domain,
      website: url,
      confidence,
      sources,
    } )

    return result
  },
}

export async function runDiscoveryAgent( input: EnrichmentInput, context: EnrichmentContext ): Promise<DiscoveryResult> {
  return discoveryAgent.execute( input, context )
}
