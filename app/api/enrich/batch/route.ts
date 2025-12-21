import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { getFirecrawlClient, normalizeUrl, extractDomain } from "@/lib/firecrawl/client"
import { COMPANY_ENRICHMENT_SCHEMA, type CompanyEnrichmentData } from "@/lib/firecrawl/types"

export const maxDuration = 60

interface BatchRow {
  id: string
  domain?: string
  email?: string
  company_name?: string
  first_name?: string
  last_name?: string
  title?: string
}

export async function POST(request: NextRequest) {
  try {
    const { rows, mapping } = (await request.json()) as {
      rows: Record<string, string>[]
      mapping: Record<string, string | null>
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: "No rows provided" }, { status: 400 })
    }

    if (rows.length > 500) {
      return NextResponse.json({ success: false, error: "Maximum 500 rows per batch" }, { status: 400 })
    }

    // Create batch job in DB
    const batchResult = await sql`
      INSERT INTO enrichment_batches (total_rows, status)
      VALUES (${rows.length}, 'processing')
      RETURNING id
    `
    const batchId = batchResult[0].id

    // Map rows to standardized format
    const mappedRows: BatchRow[] = rows.map((row, idx) => ({
      id: `${batchId}-${idx}`,
      domain: mapping.domain ? row[mapping.domain] : undefined,
      email: mapping.email ? row[mapping.email] : undefined,
      company_name: mapping.company_name ? row[mapping.company_name] : undefined,
      first_name: mapping.first_name ? row[mapping.first_name] : undefined,
      last_name: mapping.last_name ? row[mapping.last_name] : undefined,
      title: mapping.title ? row[mapping.title] : undefined,
    }))

    // Return batch ID for polling
    return NextResponse.json({
      success: true,
      data: {
        batchId,
        totalRows: rows.length,
        rows: mappedRows.map((r) => ({ id: r.id, status: "pending" })),
      },
    })
  } catch (error) {
    console.error("[Enrich Batch] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Process a single row from the batch
export async function PUT(request: NextRequest) {
  try {
    const { rowId, batchId, domain, email, company_name } = await request.json()

    // Determine input to enrich
    let inputValue = domain || email
    if (!inputValue && email) {
      // Extract domain from email
      const emailParts = email.split("@")
      if (emailParts.length === 2) {
        inputValue = emailParts[1]
      }
    }

    if (!inputValue) {
      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: "No domain or email provided",
        },
      })
    }

    // Normalize URL
    let normalizedUrl: string
    let domainName: string
    try {
      normalizedUrl = normalizeUrl(inputValue)
      domainName = extractDomain(normalizedUrl)
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: "Invalid domain or email",
        },
      })
    }

    // Check cache first
    const cached = await sql`
      SELECT * FROM enrichment_jobs 
      WHERE domain = ${domainName} 
      AND status = 'completed'
      AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (cached.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "completed",
          enriched: {
            company_name: cached[0].company_name,
            company_description: cached[0].company_description,
            company_industry: cached[0].company_industry,
            company_size: cached[0].company_size,
            company_website: cached[0].company_website,
            company_logo: cached[0].company_logo,
            linkedin_url: cached[0].linkedin_url,
            twitter_url: cached[0].twitter_url,
            contact_emails: cached[0].contact_emails,
            contact_phones: cached[0].contact_phones,
            tech_stack: cached[0].tech_stack,
            funding_total: cached[0].funding_total,
            key_people: cached[0].key_people,
          },
          cached: true,
        },
      })
    }

    // Call Firecrawl
    const firecrawl = getFirecrawlClient()

    const extractResult = await firecrawl.extract<{ extract: CompanyEnrichmentData }>(
      normalizedUrl,
      COMPANY_ENRICHMENT_SCHEMA,
      "Extract comprehensive company information.",
    )

    if (!extractResult.success || !extractResult.data) {
      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: extractResult.error || "Extraction failed",
        },
      })
    }

    const enrichmentData = extractResult.data.extract || extractResult.data

    // Save to DB for caching
    try {
      await sql`
        INSERT INTO enrichment_jobs (
          input_type, input_value, normalized_url, domain,
          company_name, company_description, company_industry,
          company_size, company_website, linkedin_url, twitter_url,
          contact_emails, contact_phones, tech_stack, funding_total, key_people,
          status, batch_id
        ) VALUES (
          'domain', ${inputValue}, ${normalizedUrl}, ${domainName},
          ${enrichmentData.company?.name}, ${enrichmentData.company?.description},
          ${enrichmentData.company?.industry}, ${enrichmentData.company?.size},
          ${enrichmentData.company?.website}, ${enrichmentData.social?.linkedin},
          ${enrichmentData.social?.twitter}, ${JSON.stringify(enrichmentData.contact?.emails)},
          ${JSON.stringify(enrichmentData.contact?.phones)}, ${JSON.stringify(enrichmentData.technology)},
          ${enrichmentData.funding?.total}, ${JSON.stringify(enrichmentData.leadership)},
          'completed', ${batchId}
        )
      `
    } catch (dbError) {
      console.error("[Enrich Batch] DB cache error:", dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: rowId,
        status: "completed",
        enriched: {
          company_name: enrichmentData.company?.name,
          company_description: enrichmentData.company?.description,
          company_industry: enrichmentData.company?.industry,
          company_size: enrichmentData.company?.size,
          company_website: enrichmentData.company?.website,
          linkedin_url: enrichmentData.social?.linkedin,
          twitter_url: enrichmentData.social?.twitter,
          contact_emails: enrichmentData.contact?.emails,
          contact_phones: enrichmentData.contact?.phones,
          tech_stack: enrichmentData.technology,
          funding_total: enrichmentData.funding?.total,
          key_people: enrichmentData.leadership,
        },
      },
    })
  } catch (error) {
    console.error("[Enrich Batch Row] Error:", error)
    return NextResponse.json({
      success: true,
      data: {
        id: request.headers.get("x-row-id") || "unknown",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    })
  }
}
