import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { runEnrichment, type EnrichmentInput } from "@/daedalus/enrich/api"

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

export async function POST( request: NextRequest ) {
  try {
    // Require authentication
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { success: false, error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { rows, mapping } = ( await request.json() ) as {
      rows: Record<string, string>[]
      mapping: Record<string, string | null>
    }

    if ( !rows || !Array.isArray( rows ) || rows.length === 0 ) {
      return NextResponse.json( { success: false, error: "No rows provided" }, { status: 400 } )
    }

    if ( rows.length > 500 ) {
      return NextResponse.json( { success: false, error: "Maximum 500 rows per batch" }, { status: 400 } )
    }

    // Create batch job in DB
    const batchResult = await sql`
      INSERT INTO enrichment_batches (total_rows, status, user_id)
      VALUES (${rows.length}, 'processing', ${userId})
      RETURNING id
    `
    const batchId = batchResult[0].id

    // Map rows to standardized format
    const mappedRows: BatchRow[] = rows.map( ( row, idx ) => ( {
      id: `${batchId}-${idx}`,
      domain: mapping.domain ? row[mapping.domain] : undefined,
      email: mapping.email ? row[mapping.email] : undefined,
      company_name: mapping.company_name ? row[mapping.company_name] : undefined,
      first_name: mapping.first_name ? row[mapping.first_name] : undefined,
      last_name: mapping.last_name ? row[mapping.last_name] : undefined,
      title: mapping.title ? row[mapping.title] : undefined,
    } ) )

    // Return batch ID for polling
    return NextResponse.json( {
      success: true,
      data: {
        batchId,
        totalRows: rows.length,
        rows: mappedRows.map( ( r ) => ( { id: r.id, status: "pending" } ) ),
      },
    } )
  } catch ( error ) {
    console.error( "[Enrich Batch] Error:", error )
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

// Process a single row from the batch using multi-agent orchestrator
export async function PUT( request: NextRequest ) {
  try {
    // Require authentication
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { success: false, error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { rowId, batchId, domain, email, company_name } = await request.json()

    // Build enrichment input
    const enrichmentInput: EnrichmentInput = {}
    if ( email ) enrichmentInput.email = email
    else if ( domain ) enrichmentInput.domain = domain
    else if ( company_name ) enrichmentInput.company_name = company_name

    if ( !enrichmentInput.email && !enrichmentInput.domain && !enrichmentInput.company_name ) {
      return NextResponse.json( {
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: "No domain, email, or company name provided",
        },
      } )
    }

    // Check cache first (by domain if available)
    const cacheKey = domain || ( email ? email.split( "@" )[1] : null )
    if ( cacheKey ) {
      const cached = await sql`
        SELECT * FROM enrichment_jobs 
        WHERE domain = ${cacheKey} 
        AND status = 'completed'
        AND created_at > NOW() - INTERVAL '7 days'
        ORDER BY created_at DESC
        LIMIT 1
      `

      if ( cached.length > 0 && cached[0].discovery_data ) {
        // Return cached multi-agent results
        return NextResponse.json( {
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
        } )
      }
    }

    // Run multi-agent orchestration
    const result = await runEnrichment( enrichmentInput, {
      onProgress: ( progress ) => {
        console.log( `[Batch ${batchId}] Row ${rowId}: ${progress.phase} - ${progress.status}` )
      },
    } )

    if ( !result.success ) {
      // Update batch failed count
      await sql`
        UPDATE enrichment_batches 
        SET failed_rows = failed_rows + 1, updated_at = NOW()
        WHERE id = ${batchId}
      `

      return NextResponse.json( {
        success: true,
        data: {
          id: rowId,
          status: "failed",
          error: result.errors?.[0]?.error || "Enrichment failed",
        },
      } )
    }

    const { discovery, profile, funding, techStack, customFields, sources } = result.data
    const synthesis = ( result as any ).synthesis || null

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
          synthesis, completed_phases, status, batch_id, user_id
        ) VALUES (
          ${Object.keys( enrichmentInput )[0]},
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
          ${JSON.stringify( [...techStack.languages, ...techStack.frameworks, ...techStack.tools] )},
          ${JSON.stringify( customFields.key_executives )},
          ${JSON.stringify( discovery )},
          ${JSON.stringify( profile )},
          ${JSON.stringify( funding )},
          ${JSON.stringify( techStack )},
          ${JSON.stringify( customFields )},
          ${JSON.stringify( sources )},
          ${customFields.icp_fit_score},
          ${customFields.icp_fit_reasons},
          ${JSON.stringify( customFields.buying_signals )},
          ${synthesis},
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
    } catch ( dbError ) {
      console.error( "[Enrich Batch] DB error:", dbError )
    }

    return NextResponse.json( {
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
          synthesis,
        },
      },
    } )
  } catch ( error ) {
    console.error( "[Enrich Batch Row] Error:", error )
    return NextResponse.json( {
      success: true,
      data: {
        id: request.headers.get( "x-row-id" ) || "unknown",
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    } )
  }
}

// ========================================
// CSV Export Helpers
// ========================================

interface EnrichmentJobRow {
  id: string
  input_type: string
  input_value: string
  domain: string
  company_name: string
  company_description: string | null
  industry: string | null
  employee_count: number | null
  founded_year: number | null
  headquarters: string | null
  website: string
  funding_total: string | null
  technologies: string[] | null
  leadership: Array<{ name: string; title: string; linkedin?: string }> | null
  icp_fit_score: number | null
  icp_fit_reasons: string[] | null
  buying_signals: Array<{ signal: string; confidence: number }> | null
  discovery_data: any
  profile_data: any
  funding_data: any
  tech_stack_data: any
  custom_fields_data: any
  sources: string[] | null
  synthesis: string | null
  status: string
  created_at: string
  error_message: string | null
}

function escapeCSV( value: any ): string {
  if ( value === null || value === undefined ) return ""
  const str = String( value )
  if ( str.includes( "," ) || str.includes( '"' ) || str.includes( "\n" ) ) {
    return `"${str.replace( /"/g, '""' )}"`
  }
  return str
}

function formatArray( arr: any[] | null | undefined ): string {
  if ( !arr || !Array.isArray( arr ) || arr.length === 0 ) return ""
  return arr.map( item => typeof item === "object" ? JSON.stringify( item ) : String( item ) ).join( "; " )
}

function transformToCSVRow( job: EnrichmentJobRow ): Record<string, any> {
  return {
    // Input data
    "Input Type": job.input_type,
    "Input Value": job.input_value,

    // Discovery data
    "Company Name": job.company_name,
    "Domain": job.domain,
    "Website": job.website,
    "Discovery Confidence": job.discovery_data?.confidence ? `${Math.round( job.discovery_data.confidence * 100 )}%` : "",

    // Company profile
    "Industry": job.industry,
    "Segment": job.profile_data?.segment || "",
    "Employee Count": job.employee_count,
    "Employee Range": job.profile_data?.employee_range || "",
    "Founded Year": job.founded_year,
    "Headquarters": job.headquarters,
    "Business Type": job.profile_data?.business_type || "",
    "Description": job.company_description,

    // Funding data
    "Funding Stage": job.funding_data?.funding_stage || "",
    "Total Funding": job.funding_total,
    "Last Round Date": job.funding_data?.last_round_date || "",
    "Last Round Amount": job.funding_data?.last_round_amount || "",
    "Investors": formatArray( job.funding_data?.investors ),
    "Valuation": job.funding_data?.valuation || "",
    "Is Public": job.funding_data?.is_public ? "Yes" : "No",

    // Tech stack
    "Languages": formatArray( job.tech_stack_data?.languages ),
    "Frameworks": formatArray( job.tech_stack_data?.frameworks ),
    "Infrastructure": formatArray( job.tech_stack_data?.infrastructure ),
    "Tools": formatArray( job.tech_stack_data?.tools ),
    "AI Adoption": job.tech_stack_data?.signals?.ai_adoption ? "Yes" : "No",
    "Modern Stack": job.tech_stack_data?.signals?.modern_stack ? "Yes" : "No",
    "Cloud Native": job.tech_stack_data?.signals?.cloud_native ? "Yes" : "No",

    // Custom fields / Intelligence
    "CEO Name": job.custom_fields_data?.ceo_name || "",
    "Key Executives": formatArray( job.leadership ),
    "ICP Fit Score": job.icp_fit_score,
    "ICP Fit Reasons": formatArray( job.icp_fit_reasons ),
    "Is Personal Site": job.custom_fields_data?.is_personal_site ? "Yes" : "No",
    "Pain Points": formatArray( job.custom_fields_data?.pain_points ),
    "Buying Signals": formatArray( job.buying_signals ),
    "Competitive Landscape": formatArray( job.custom_fields_data?.competitive_landscape ),

    // Metadata
    "Sources": formatArray( job.sources ),
    "Synthesis": job.synthesis || "",
    "Status": job.status,
    "Error": job.error_message || "",
    "Enriched At": new Date( job.created_at ).toISOString(),
  }
}

function generateCSV( jobs: EnrichmentJobRow[] ): string {
  if ( jobs.length === 0 ) return ""

  const csvRows = jobs.map( transformToCSVRow )
  const headers = Object.keys( csvRows[0] )
  const csvLines: string[] = []

  // Header row
  csvLines.push( headers.map( escapeCSV ).join( "," ) )

  // Data rows
  for ( const row of csvRows ) {
    const values = headers.map( header => escapeCSV( row[header] ) )
    csvLines.push( values.join( "," ) )
  }

  return csvLines.join( "\n" )
}

// ========================================
// GET - Fetch or Export Batch Results
// ========================================

export async function GET( request: NextRequest ) {
  try {
    // Require authentication
    const session = await auth.api.getSession( { headers: await headers() } )
    if ( !session?.user?.id ) {
      return NextResponse.json( { success: false, error: "Unauthorized" }, { status: 401 } )
    }
    const userId = session.user.id

    const { searchParams } = new URL( request.url )
    const batchId = searchParams.get( "batchId" )
    const format = searchParams.get( "format" ) || "json" // "json" or "csv"

    if ( !batchId ) {
      return NextResponse.json(
        { success: false, error: "Missing batchId parameter" },
        { status: 400 }
      )
    }

    // Verify batch belongs to user
    const batchCheck = await sql`
      SELECT id, user_id, total_rows, completed_rows, failed_rows, status
      FROM enrichment_batches
      WHERE id = ${batchId}
    `

    if ( batchCheck.length === 0 ) {
      return NextResponse.json(
        { success: false, error: "Batch not found" },
        { status: 404 }
      )
    }

    if ( batchCheck[0].user_id !== userId ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to batch" },
        { status: 403 }
      )
    }

    const batch = batchCheck[0]

    // Fetch all enrichment jobs for this batch
    const jobs = await sql`
      SELECT
        id, input_type, input_value, domain, company_name,
        company_description, industry, employee_count, founded_year,
        headquarters, website, funding_total, technologies, leadership,
        icp_fit_score, icp_fit_reasons, buying_signals,
        discovery_data, profile_data, funding_data, tech_stack_data,
        custom_fields_data, sources, synthesis, status, error_message, created_at
      FROM enrichment_jobs
      WHERE batch_id = ${batchId}
      ORDER BY created_at ASC
    ` as unknown as EnrichmentJobRow[]

    // CSV export
    if ( format === "csv" ) {
      if ( jobs.length === 0 ) {
        return NextResponse.json(
          { success: false, error: "No enrichment results to export" },
          { status: 404 }
        )
      }

      const csvContent = generateCSV( jobs )
      const timestamp = new Date().toISOString().split( "T" )[0]
      const filename = `enrichment_export_${batchId}_${timestamp}.csv`

      return new NextResponse( csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache",
        },
      } )
    }

    // JSON response (default)
    return NextResponse.json( {
      success: true,
      data: {
        batch: {
          id: batch.id,
          totalRows: batch.total_rows,
          completedRows: batch.completed_rows,
          failedRows: batch.failed_rows,
          status: batch.status,
        },
        jobs: jobs.map( job => ( {
          id: job.id,
          status: job.status,
          input: {
            type: job.input_type,
            value: job.input_value,
          },
          enriched: job.status === "completed" ? {
            company_name: job.company_name,
            domain: job.domain,
            website: job.website,
            industry: job.industry,
            segment: job.profile_data?.segment,
            employee_count: job.employee_count,
            headquarters: job.headquarters,
            funding_total: job.funding_total,
            funding_stage: job.funding_data?.funding_stage,
            technologies: job.technologies,
            leadership: job.leadership,
            icp_fit_score: job.icp_fit_score,
            sources: job.sources,
          } : null,
          error: job.error_message,
          enrichedAt: job.created_at,
        } ) ),
      },
    } )
  } catch ( error ) {
    console.error( "[Enrich Batch GET] Error:", error )
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch batch results",
      },
      { status: 500 }
    )
  }
}
