import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { orchestrateEnrichment, type EnrichmentInput } from "@/lib/agents"

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
    // Require authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

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
      INSERT INTO enrichment_batches (total_rows, status, user_id)
      VALUES (${rows.length}, 'processing', ${userId})
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

// Process a single row from the batch using multi-agent orchestrator
export async function PUT(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { rowId, batchId, domain, email, company_name } = await request.json()

    // Build enrichment input
    const enrichmentInput: EnrichmentInput = {}
    if (email) enrichmentInput.email = email
    else if (domain) enrichmentInput.domain = domain
    else if (company_name) enrichmentInput.company_name = company_name

    if (!enrichmentInput.email && !enrichmentInput.domain && !enrichmentInput.company_name) {
      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: "No domain, email, or company name provided",
        },
      })
    }

    // Check cache first (by domain if available)
    const cacheKey = domain || (email ? email.split("@")[1] : null)
    if (cacheKey) {
      const cached = await sql`
        SELECT * FROM enrichment_jobs 
        WHERE domain = ${cacheKey} 
        AND status = 'completed'
        AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 1
      `

      if (cached.length > 0 && cached[0].discovery_data) {
        // Return cached multi-agent results
        return NextResponse.json({
          success: true,
          data: {
            id: rowId,
            status: "completed",
            enriched: {
              company_name: cached[0].company_name,
              company_description: cached[0].company_description,
              industry: cached[0].industry,
              employee_count: cached[0].employee_count,
              headquarters: cached[0].headquarters,
              website: cached[0].website,
              funding_total: cached[0].funding_total,
              technologies: cached[0].technologies,
              leadership: cached[0].leadership,
              icp_fit_score: cached[0].icp_fit_score,
              icp_fit_reasons: cached[0].icp_fit_reasons,
              buying_signals: cached[0].buying_signals,
            },
            cached: true,
          },
        })
      }
    }

    // Run multi-agent orchestration
    const result = await orchestrateEnrichment(enrichmentInput, {
      onProgress: (progress) => {
        console.log(`[Batch ${batchId}] Row ${rowId}: ${progress.phase} - ${progress.status}`)
      },
    })

    if (!result.success) {
      // Update batch failed count
      await sql`
        UPDATE enrichment_batches 
        SET failed_rows = failed_rows + 1, updated_at = NOW()
        WHERE id = ${batchId}
      `

      return NextResponse.json({
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: result.errors?.[0]?.error || "Enrichment failed",
        },
      })
    }

    const { discovery, profile, funding, techStack, customFields, sources } = result.data

    // Save to DB with full agent phase data
    try {
      await sql`
        INSERT INTO enrichment_jobs (
          input_type, input_value, normalized_url, domain,
          company_name, company_description, industry,
          employee_count, founded_year, headquarters, website,
          funding_total, technologies, leadership,
          discovery_data, profile_data, funding_data, 
          tech_stack_data, custom_fields_data, sources,
          icp_fit_score, icp_fit_reasons, buying_signals,
          completed_phases, status, batch_id, user_id
        ) VALUES (
          ${Object.keys(enrichmentInput)[0]},
          ${email || domain || company_name},
          ${discovery.website},
          ${discovery.domain},
          ${discovery.company_name},
          ${profile.description},
          ${profile.industry},
          ${profile.employee_count},
          ${profile.year_founded},
          ${profile.headquarters},
          ${discovery.website},
          ${funding.total_funding},
          ${JSON.stringify([...techStack.languages, ...techStack.frameworks, ...techStack.tools])},
          ${JSON.stringify(customFields.key_executives)},
          ${JSON.stringify(discovery)},
          ${JSON.stringify(profile)},
          ${JSON.stringify(funding)},
          ${JSON.stringify(techStack)},
          ${JSON.stringify(customFields)},
          ${JSON.stringify(sources)},
          ${customFields.icp_fit_score},
          ${customFields.icp_fit_reasons},
          ${JSON.stringify(customFields.buying_signals)},
          ${['discovery', 'company_profile', 'funding', 'tech_stack', 'custom_fields']},
          'completed',
          ${batchId},
          ${userId}
        )
      `

      // Update batch completed count
      await sql`
        UPDATE enrichment_batches 
        SET completed_rows = completed_rows + 1, updated_at = NOW()
        WHERE id = ${batchId}
      `
    } catch (dbError) {
      console.error("[Enrich Batch] DB error:", dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: rowId,
        status: "completed",
        enriched: {
          company_name: discovery.company_name,
          company_description: profile.description,
          industry: profile.industry,
          segment: profile.segment,
          employee_count: profile.employee_count,
          headquarters: profile.headquarters,
          website: discovery.website,
          funding_stage: funding.funding_stage,
          funding_total: funding.total_funding,
          investors: funding.investors,
          technologies: [...techStack.languages, ...techStack.frameworks, ...techStack.tools],
          tech_signals: techStack.signals,
          leadership: customFields.key_executives,
          ceo_name: customFields.ceo_name,
          icp_fit_score: customFields.icp_fit_score,
          icp_fit_reasons: customFields.icp_fit_reasons,
          buying_signals: customFields.buying_signals,
          sources,
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
