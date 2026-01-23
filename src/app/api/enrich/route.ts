import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { getFirecrawlClient } from "@/platform/firecrawl/service"
import { type EnrichmentJob } from "@/platform/firecrawl/types"
import { runEnrichment, type EnrichmentInput } from "@/daedalus/enrich/api"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { 
  validateEnrichmentResult,
  EnrichInputSchema,
} from "@/daedalus/enrich/schemas"
import { sanitizeEnrichmentData, detectEnrichmentType } from "@/daedalus/enrich/guardrails"

export async function POST( request: NextRequest ) {
  try {
    // Require authentication
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { success: false, error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const body = await request.json()
    const { input, useAgents = true, includeCompetitive = false } = body

    if ( !input || typeof input !== "string" ) {
      return NextResponse.json(
        { success: false, error: "Invalid input: URL, email, or company name required" },
        { status: 400 },
      )
    }

    const inputTrimmed = input.trim()

    // Determine input type and build enrichment input
    const enrichmentInput: EnrichmentInput = {}
    if ( inputTrimmed.includes( "@" ) ) {
      enrichmentInput.email = inputTrimmed
    } else if ( inputTrimmed.includes( "://" ) ) {
      enrichmentInput.url = inputTrimmed
    } else if ( inputTrimmed.includes( "." ) && !inputTrimmed.includes( " " ) ) {
      enrichmentInput.domain = inputTrimmed
    } else {
      enrichmentInput.company_name = inputTrimmed
    }

    // Validate enrichment input via schema
    const inputValidation = EnrichInputSchema.safeParse( enrichmentInput )
    if ( !inputValidation.success ) {
      return NextResponse.json(
        { 
          success: false, 
          error: inputValidation.error.issues.map( i => i.message ).join( ", " ) 
        },
        { status: 400 },
      )
    }

    const enrichmentType = detectEnrichmentType( enrichmentInput )

    if ( includeCompetitive && enrichmentType === "profile" ) {
      return NextResponse.json(
        { success: false, error: "Competitive analysis is only available for company enrichment." },
        { status: 400 },
      )
    }

    const competitiveEnabled = includeCompetitive === true && enrichmentType === "company"

    // Run multi-agent orchestration
    // Note: competitive analysis is OFF by default per T-003 guardrails
    const result = await runEnrichment( enrichmentInput, {
      competitive: competitiveEnabled, // Must be explicitly true for company enrichment
      onProgress: ( progress ) => {
        console.log( `[Enrich] ${progress.phase}: ${progress.status} - ${progress.message}` )
      },
    } )

    if ( !result.success ) {
      // Save failed job
      try {
        await sql`
          INSERT INTO enrichment_jobs (
            input_type, input_value, domain, status, error_message, user_id
          ) VALUES (
            ${Object.keys( enrichmentInput )[0]}, 
            ${inputTrimmed}, 
            ${result.data?.discovery?.domain || null}, 
            'failed', 
            ${result.errors?.[0]?.error || "Enrichment failed"}, 
            ${userId}
          )
        `
      } catch ( dbError ) {
        console.error( "[Enrich] DB error saving failed job:", dbError )
      }

      return NextResponse.json(
        { success: false, error: result.errors?.[0]?.error || "Enrichment failed" },
        { status: 422 },
      )
    }

    const { discovery, profile, funding, techStack, customFields, sources } = result.data

    // Validate result data before DB write (T-003 guardrail)
    const resultValidation = validateEnrichmentResult( result.data )
    if ( !resultValidation.success ) {
      console.warn( "[Enrich] Result validation warnings:", resultValidation.error )
      // Continue with sanitized data - don't fail the request
    }

    // Sanitize data before DB write
    const sanitizedProfile = sanitizeEnrichmentData( profile )
    const sanitizedFunding = sanitizeEnrichmentData( funding )
    const sanitizedTechStack = sanitizeEnrichmentData( techStack )
    const sanitizedCustomFields = sanitizeEnrichmentData( customFields )

    // Also get branding/screenshot using modern extract endpoint
    const firecrawl = getFirecrawlClient()
    const brandResult = await firecrawl.extractBrand( discovery.website )
    const screenshot = brandResult.success ? brandResult.data?.screenshot : null
    const logo = brandResult.success ? brandResult.data?.images?.logo : null

    // Save to database with full agent phase data (using sanitized data per T-003)
    let savedJob: EnrichmentJob | null = null
    try {
      const dbResult = await sql`
        INSERT INTO enrichment_jobs (
          input_type, input_value, normalized_url, domain,
          company_name, company_description, industry,
          employee_count, founded_year, headquarters, website,
          funding_total, technologies, leadership,
          discovery_data, profile_data, funding_data,
          tech_stack_data, custom_fields_data, sources,
          icp_fit_score, icp_fit_reasons, buying_signals,
          completed_phases, raw_data, status, user_id
        ) VALUES (
          ${Object.keys( enrichmentInput )[0]}, 
          ${inputTrimmed}, 
          ${discovery.website}, 
          ${discovery.domain},
          ${discovery.company_name}, 
          ${sanitizedProfile.description}, 
          ${sanitizedProfile.industry},
          ${sanitizedProfile.employee_count}, 
          ${sanitizedProfile.year_founded}, 
          ${sanitizedProfile.headquarters}, 
          ${discovery.website},
          ${sanitizedFunding.total_funding},
          ${JSON.stringify( [...sanitizedTechStack.languages, ...sanitizedTechStack.frameworks, ...sanitizedTechStack.tools] )}, 
          ${JSON.stringify( sanitizedCustomFields.key_executives )},
          ${JSON.stringify( discovery )},
          ${JSON.stringify( sanitizedProfile )},
          ${JSON.stringify( sanitizedFunding )},
          ${JSON.stringify( sanitizedTechStack )},
          ${JSON.stringify( sanitizedCustomFields )},
          ${JSON.stringify( sources )},
          ${sanitizedCustomFields.icp_fit_score},
          ${sanitizedCustomFields.icp_fit_reasons},
          ${JSON.stringify( sanitizedCustomFields.buying_signals )},
          ${['discovery', 'company_profile', 'funding', 'tech_stack', 'custom_fields']},
          ${JSON.stringify( result.data )}, 
          'completed', 
          ${userId}
        )
        RETURNING *
      `
      savedJob = dbResult[0] as EnrichmentJob
    } catch ( dbError ) {
      console.error( "[Enrich] DB error saving job:", dbError )
    }

    // Log usage event
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, metadata, user_id)
        VALUES (
          'enrichment', 
          'enrich', 
          ${inputTrimmed}, 
          'success', 
          ${JSON.stringify( {
        domain: discovery.domain,
        duration_ms: result.duration_ms,
        icp_score: customFields.icp_fit_score,
        errors: result.errors?.length || 0
      } )}, 
          ${userId}
        )
      `
    } catch ( usageError ) {
      console.error( "[Enrich] Usage logging error:", usageError )
    }

    // Return enriched data in a compatible format
    return NextResponse.json( {
      success: true,
      enrichmentType,
      competitiveRun: competitiveEnabled,
      data: {
        id: savedJob?.id,
        input_type: Object.keys( enrichmentInput )[0],
        input_value: inputTrimmed,
        normalized_url: discovery.website,
        domain: discovery.domain,
        company_name: discovery.company_name,
        company_description: profile.description,
        company_logo: logo as string | undefined,
        company_industry: profile.industry,
        company_size: profile.employee_range,
        company_founded: profile.year_founded?.toString(),
        company_headquarters: profile.headquarters,
        company_website: discovery.website,
        tech_stack: [...techStack.languages, ...techStack.frameworks, ...techStack.tools],
        funding_total: funding.total_funding,
        funding_stage: funding.funding_stage,
        investors: funding.investors,
        key_people: customFields.key_executives,
        ceo_name: customFields.ceo_name,
        icp_fit_score: customFields.icp_fit_score,
        icp_fit_reasons: customFields.icp_fit_reasons,
        buying_signals: customFields.buying_signals,
        tech_signals: techStack.signals,
        screenshot,
        sources,
        duration_ms: result.duration_ms,
        errors: result.errors,
        // Full agent results
        agents: {
          discovery,
          profile,
          funding,
          techStack,
          customFields,
        },
      },
    } )
  } catch ( error ) {
    console.error( "[Enrich] Error:", error )
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// GET - Fetch enrichment history
export async function GET( request: NextRequest ) {
  try {
    // Require authentication
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { success: false, error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { searchParams } = new URL( request.url )
    const limit = Number.parseInt( searchParams.get( "limit" ) || "20" )
    const offset = Number.parseInt( searchParams.get( "offset" ) || "0" )
    const domain = searchParams.get( "domain" )

    let jobs
    if ( domain ) {
      jobs = await sql`
        SELECT * FROM enrichment_jobs 
        WHERE domain = ${domain} AND user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      jobs = await sql`
        SELECT * FROM enrichment_jobs 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json( { success: true, data: jobs } )
  } catch ( error ) {
    console.error( "[Enrich] GET error:", error )
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
