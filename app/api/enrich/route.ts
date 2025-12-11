import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { getFirecrawlClient, normalizeUrl, extractDomain } from "@/lib/firecrawl/client"
import { COMPANY_ENRICHMENT_SCHEMA, type CompanyEnrichmentData, type EnrichmentJob } from "@/lib/firecrawl/types"

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { input } = await request.json()

    if (!input || typeof input !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid input: URL, email, or company name required" },
        { status: 400 },
      )
    }

    const inputTrimmed = input.trim()

    // Determine input type
    let inputType: "url" | "email" | "domain" | "company_name" = "company_name"
    if (inputTrimmed.includes("@")) {
      inputType = "email"
    } else if (inputTrimmed.includes(".") && !inputTrimmed.includes(" ")) {
      inputType = inputTrimmed.includes("://") ? "url" : "domain"
    }

    // Normalize to URL
    let normalizedUrl: string
    let domain: string

    try {
      normalizedUrl = normalizeUrl(inputTrimmed)
      domain = extractDomain(normalizedUrl)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Could not parse input as valid URL or email" },
        { status: 400 },
      )
    }

    // Get Firecrawl client
    const firecrawl = getFirecrawlClient()

    // Extract company data using Firecrawl's extract feature
    const extractResult = await firecrawl.extract<{ extract: CompanyEnrichmentData }>(
      normalizedUrl,
      COMPANY_ENRICHMENT_SCHEMA,
      "Extract comprehensive company information including name, description, industry, social links, contact info, leadership team, technology stack, and funding details.",
    )

    if (!extractResult.success || !extractResult.data) {
      // Try to save failed job
      try {
        await sql`
          INSERT INTO enrichment_jobs (input_type, input_value, normalized_url, domain, status, error_message)
          VALUES (${inputType}, ${inputTrimmed}, ${normalizedUrl}, ${domain}, 'failed', ${extractResult.error || "Extraction failed"})
        `
      } catch (dbError) {
        console.error("[Enrich] DB error saving failed job:", dbError)
      }

      return NextResponse.json(
        { success: false, error: extractResult.error || "Failed to extract company data" },
        { status: 422 },
      )
    }

    const enrichmentData = extractResult.data.extract || extractResult.data

    // Also get branding/screenshot
    const brandResult = await firecrawl.extractBrand(normalizedUrl)
    const screenshot = brandResult.success ? brandResult.data?.screenshot : null
    const logo = brandResult.success ? brandResult.data?.branding?.logo : null

    // Prepare job data
    const jobData: Partial<EnrichmentJob> = {
      input_type: inputType,
      input_value: inputTrimmed,
      normalized_url: normalizedUrl,
      domain,
      company_name: enrichmentData.company?.name,
      company_description: enrichmentData.company?.description,
      company_logo: (logo as string) || undefined,
      company_industry: enrichmentData.company?.industry,
      company_size: enrichmentData.company?.size,
      company_founded: enrichmentData.company?.founded,
      company_headquarters: enrichmentData.company?.headquarters,
      company_website: enrichmentData.company?.website,
      linkedin_url: enrichmentData.social?.linkedin,
      twitter_url: enrichmentData.social?.twitter,
      facebook_url: enrichmentData.social?.facebook,
      crunchbase_url: enrichmentData.social?.crunchbase,
      contact_emails: enrichmentData.contact?.emails,
      contact_phones: enrichmentData.contact?.phones,
      tech_stack: enrichmentData.technology,
      funding_total: enrichmentData.funding?.total,
      investors: enrichmentData.funding?.investors,
      key_people: enrichmentData.leadership,
      status: "completed",
    }

    // Save to database
    let savedJob: EnrichmentJob | null = null
    try {
      const result = await sql`
        INSERT INTO enrichment_jobs (
          input_type, input_value, normalized_url, domain,
          company_name, company_description, company_logo, company_industry,
          company_size, company_founded, company_headquarters, company_website,
          linkedin_url, twitter_url, facebook_url, crunchbase_url,
          contact_emails, contact_phones, tech_stack, funding_total, investors, key_people,
          raw_response, status
        ) VALUES (
          ${jobData.input_type}, ${jobData.input_value}, ${jobData.normalized_url}, ${jobData.domain},
          ${jobData.company_name}, ${jobData.company_description}, ${jobData.company_logo}, ${jobData.company_industry},
          ${jobData.company_size}, ${jobData.company_founded}, ${jobData.company_headquarters}, ${jobData.company_website},
          ${jobData.linkedin_url}, ${jobData.twitter_url}, ${jobData.facebook_url}, ${jobData.crunchbase_url},
          ${JSON.stringify(jobData.contact_emails)}, ${JSON.stringify(jobData.contact_phones)}, 
          ${JSON.stringify(jobData.tech_stack)}, ${jobData.funding_total}, 
          ${JSON.stringify(jobData.investors)}, ${JSON.stringify(jobData.key_people)},
          ${JSON.stringify(enrichmentData)}, 'completed'
        )
        RETURNING *
      `
      savedJob = result[0] as EnrichmentJob
    } catch (dbError) {
      console.error("[Enrich] DB error saving job:", dbError)
      // Continue without saving - still return data to user
    }

    // Log usage event
    const duration = Date.now() - startTime
    try {
      await sql`
        INSERT INTO usage_events (event_type, module, input_value, status, duration_ms, metadata)
        VALUES ('enrichment', 'enrich', ${inputTrimmed}, 'success', ${duration}, ${JSON.stringify({ domain })})
      `
    } catch (usageError) {
      console.error("[Enrich] Usage logging error:", usageError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: savedJob?.id,
        ...jobData,
        screenshot,
        raw: enrichmentData,
      },
    })
  } catch (error) {
    console.error("[Enrich] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// GET - Fetch enrichment history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const domain = searchParams.get("domain")

    let jobs
    if (domain) {
      jobs = await sql`
        SELECT * FROM enrichment_jobs 
        WHERE domain = ${domain}
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      jobs = await sql`
        SELECT * FROM enrichment_jobs 
        ORDER BY created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    return NextResponse.json({ success: true, data: jobs })
  } catch (error) {
    console.error("[Enrich] GET error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
