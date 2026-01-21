import { type NextRequest } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { runEnrichment, type EnrichmentInput } from "@/daedalus/enrich/api"
import { generateWithFallback } from "@/ai/tools/llm.tool"
import { z } from "zod"

export const maxDuration = 300

interface BatchStreamInput {
  rows: Array<{
    id: string
    input?: string
    domain?: string
    email?: string
    company_name?: string
    first_name?: string
    last_name?: string
    title?: string
  }>
  generateSynthesis?: boolean
}

// Robust Zod Schema for Enriched Result
const EnrichedResultSchema = z.object( {
  company_name: z.string().nullable(),
  company_description: z.string().nullable(),
  industry: z.string().nullable(),
  segment: z.string().nullable(),
  employee_count: z.string().nullable().or( z.number().nullable().transform( String ) ),
  headquarters: z.string().nullable(),
  website: z.string().nullable(),
  funding_stage: z.string().nullable(),
  funding_total: z.string().nullable(),
  investors: z.array( z.string() ),
  technologies: z.array( z.string() ),
  tech_signals: z.object( {
    ai_adoption: z.boolean(),
    modern_stack: z.boolean(),
    cloud_native: z.boolean(),
  } ),
  leadership: z.array( z.object( {
    name: z.string(),
    title: z.string(),
    linkedin: z.string().nullable(),
  } ) ),
  ceo_name: z.string().nullable(),
  icp_fit_score: z.number(),
  icp_fit_reasons: z.array( z.string() ),
  buying_signals: z.array( z.object( {
    signal: z.string(),
    confidence: z.number(),
  } ) ),
  sources: z.array( z.string() ),
  synthesis: z.string().optional(),
  contact: z.object( {
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    full_name: z.string().nullable(),
    title: z.string().nullable(),
    email: z.string().nullable(),
  } ).nullable().optional(),
} )

type EnrichedResult = z.infer<typeof EnrichedResultSchema>

type RowInputType = "email" | "domain" | "company_name" | "unknown"

type ContactRecord = {
  first_name: string | null
  last_name: string | null
  full_name: string | null
  title: string | null
  email: string | null
} | null

type RowInputDetails = {
  inputType: RowInputType
  inputValue: string
  domain: string | null
  companyName: string | null
}

function resolveInputDetails( row: BatchStreamInput['rows'][number] ): RowInputDetails {
  const email = row.email?.trim() || null
  const domain = row.domain?.trim() || null
  const companyName = row.company_name?.trim() || null
  const inputType: RowInputType = email
    ? "email"
    : domain
    ? "domain"
    : companyName
    ? "company_name"
    : "unknown"
  const fallbackInput = row.input?.trim() || row.id
  const inputValue = email || domain || companyName || fallbackInput
  const resolvedDomain = domain || ( email ? email.split( "@" )[1] || null : null )

  return {
    inputType,
    inputValue,
    domain: resolvedDomain,
    companyName,
  }
}

async function persistFailedRow( {
  row,
  contact,
  batchId,
  userId,
  errorMessage,
}: {
  row: BatchStreamInput['rows'][number]
  contact: ContactRecord
  batchId: string
  userId: string
  errorMessage: string
} ) {
  const inputDetails = resolveInputDetails( row )
  const contactPayload = contact ? { contact } : null

  try {
    await sql`
      INSERT INTO enrichment_jobs (
        input_type, input_value, domain, company_name,
        custom_fields_data, status, error_message,
        batch_id, user_id
      ) VALUES (
        ${inputDetails.inputType},
        ${inputDetails.inputValue},
        ${inputDetails.domain},
        ${inputDetails.companyName},
        ${contactPayload ? JSON.stringify( contactPayload ) : null},
        'failed',
        ${errorMessage},
        ${batchId},
        ${userId}
      )
    `
  } catch ( persistError ) {
    console.error( "[Batch Stream] Failed to persist row error:", persistError )
  }
}

// Helper to safely map raw/cached data to EnrichedResult
function mapToEnrichedResult( source: any, source_type: 'cache' | 'fresh' ): EnrichedResult {
  // Normalize source structure based on type
  const discovery = source_type === 'cache' ? source.discovery_data : source.discovery
  const profile = source_type === 'cache' ? source.profile_data : source.profile
  const funding = source_type === 'cache' ? source.funding_data : source.funding
  const techStack = source_type === 'cache' ? source.tech_stack_data : source.techStack
  const customFields = source_type === 'cache' ? source.custom_fields_data : source.customFields
  const contactData = source_type === 'cache'
    ? source.custom_fields_data?.contact
    : source.contact || source.customFields?.contact

  // Safe extraction with explicit nulls
  const result = {
    company_name: discovery?.company_name || source.company_name || null,
    company_description: profile?.description || source.company_description || null,
    industry: profile?.industry || source.industry || null,
    segment: profile?.segment || null,
    employee_count: profile?.employee_count || source.employee_count || null,
    headquarters: profile?.headquarters || source.headquarters || null,
    website: discovery?.website || source.website || null,

    funding_stage: funding?.funding_stage || null,
    funding_total: funding?.total_funding || source.funding_total || null,
    investors: Array.isArray( funding?.investors ) ? funding.investors : [],

    technologies: Array.isArray( source.technologies ) ? source.technologies :
      ( Array.isArray( techStack?.languages ) ? [
        ...techStack.languages,
        ...techStack.frameworks,
        ...techStack.tools
      ] : [] ),

    tech_signals: {
      ai_adoption: Boolean( techStack?.signals?.ai_adoption ),
      modern_stack: Boolean( techStack?.signals?.modern_stack ),
      cloud_native: Boolean( techStack?.signals?.cloud_native ),
    },

    leadership: Array.isArray( customFields?.key_executives ) ? customFields.key_executives :
      ( Array.isArray( source.leadership ) ? source.leadership : [] ),

    ceo_name: customFields?.ceo_name || null,

    icp_fit_score: Number( customFields?.icp_fit_score || source.icp_fit_score || 0 ),
    icp_fit_reasons: Array.isArray( customFields?.icp_fit_reasons ) ? customFields.icp_fit_reasons : [],

    buying_signals: Array.isArray( customFields?.buying_signals ) ? customFields.buying_signals : [],

    sources: Array.isArray( source.sources ) ? source.sources : [],

    contact: contactData ? {
      first_name: contactData.first_name ?? null,
      last_name: contactData.last_name ?? null,
      full_name: contactData.full_name ?? null,
      title: contactData.title ?? null,
      email: contactData.email ?? null,
    } : null,
  }

  // Validate and return (strips unknown fields, coerces types where specified)
  return EnrichedResultSchema.parse( result )
}

function buildContactFromRow( row: BatchStreamInput['rows'][number] ): ContactRecord {
  const first_name = row.first_name?.trim() || null
  const last_name = row.last_name?.trim() || null
  const title = row.title?.trim() || null
  const email = row.email?.trim() || null
  const full_name = [first_name, last_name].filter( Boolean ).join( " " ) || null

  if ( !first_name && !last_name && !title && !email ) return null

  return { first_name, last_name, full_name, title, email }
}

function mergeContact( source?: EnrichedResult['contact'], fallback?: ReturnType<typeof buildContactFromRow> ) {
  if ( !source && !fallback ) return null

  const candidate = source || fallback || null
  if ( !candidate ) return null

  return {
    first_name: candidate.first_name ?? fallback?.first_name ?? null,
    last_name: candidate.last_name ?? fallback?.last_name ?? null,
    full_name: candidate.full_name ?? fallback?.full_name ?? null,
    title: candidate.title ?? fallback?.title ?? null,
    email: candidate.email ?? fallback?.email ?? null,
  }
}

async function generateSynthesis( result: EnrichedResult ): Promise<string | null> {
  try {
    const prompt = `You are an intelligence analyst at a strategic sales consultancy. Based on the enrichment data below, write a concise 2-3 sentence "Why This Company Matters" brief for a sales team.

Company: ${result.company_name}
Industry: ${result.industry || 'Unknown'}
Segment: ${result.segment || 'Unknown'}
Employees: ${result.employee_count || 'Unknown'}
Funding: ${result.funding_total || 'Unknown'} (${result.funding_stage || 'Unknown stage'})
ICP Fit Score: ${result.icp_fit_score}/100

Key Signals:
- AI Adoption: ${result.tech_signals?.ai_adoption ? 'Yes' : 'No'}
- Modern Stack: ${result.tech_signals?.modern_stack ? 'Yes' : 'No'}
- Buying Signals: ${result.buying_signals?.map( s => s.signal ).join( ', ' ) || 'None detected'}

ICP Fit Reasons: ${result.icp_fit_reasons?.join( '; ' ) || 'None'}

Write a brief that:
1. Summarizes why this company is worth pursuing
2. Highlights the most compelling buying signal or timing factor
3. Suggests an angle for outreach

Keep it under 100 words. Be direct and actionable.`

    const response = await generateWithFallback( {
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    } )

    return response.text
  } catch ( error ) {
    console.error( "[Synthesis] Error:", error )
    // Return a simple data-based fallback instead of null
    return `${result.company_name} - ${result.industry || 'Company'} with ICP fit score ${result.icp_fit_score}/100. ${result.employee_count ? `${result.employee_count} employees.` : ''} ${result.funding_total ? `Raised ${result.funding_total}.` : ''}`
  }
}

export async function POST( request: NextRequest ) {
  const session = await auth.api.getSession( { headers: await headers() } )
  if ( !session?.user?.id ) {
    return new Response( JSON.stringify( { error: "Unauthorized" } ), { status: 401 } )
  }
  const userId = session.user.id

  const body = ( await request.json() ) as BatchStreamInput
  const { rows, generateSynthesis: shouldGenerateSynthesis = false } = body

  if ( !rows || !Array.isArray( rows ) || rows.length === 0 ) {
    return new Response( JSON.stringify( { error: "No rows provided" } ), { status: 400 } )
  }

  if ( rows.length > 100 ) {
    return new Response( JSON.stringify( { error: "Maximum 100 rows per streaming batch" } ), { status: 400 } )
  }

  // Create batch record
  let batchId: string
  try {
    const batchResult = await sql`
      INSERT INTO enrichment_batches (total_rows, status, user_id)
      VALUES (${rows.length}, 'processing', ${userId})
      RETURNING id
    `
    batchId = batchResult[0].id
  } catch ( error ) {
    console.error( "[Batch Stream] Failed to create batch:", error )
    return new Response( JSON.stringify( { error: "Failed to create batch" } ), { status: 500 } )
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream( {
    async start( controller ) {
      const send = ( event: string, data: unknown ) => {
        controller.enqueue( encoder.encode( `event: ${event}\ndata: ${JSON.stringify( data )}\n\n` ) )
      }

      // Send batch started event
      send( "batch_started", { batchId, totalRows: rows.length } )

      let completedCount = 0
      let failedCount = 0

      const markRowFailed = async ( {
        row,
        rowIndex,
        errorMessage,
        contact,
      }: {
        row: BatchStreamInput['rows'][number]
        rowIndex: number
        errorMessage: string
        contact: ContactRecord
      } ) => {
        failedCount++

        try {
          await sql`
            UPDATE enrichment_batches 
            SET failed_rows = failed_rows + 1, updated_at = NOW()
            WHERE id = ${batchId}
          `
        } catch ( updateError ) {
          console.error( "[Batch Stream] Failed to update batch failure count:", updateError )
        }

        await persistFailedRow( {
          row,
          contact,
          batchId,
          userId,
          errorMessage,
        } )

        send( "row_failed", {
          rowId: row.id,
          rowIndex,
          error: errorMessage,
        } )
      }

      for ( let i = 0; i < rows.length; i++ ) {
        const row = rows[i]
        const contactFromRow = buildContactFromRow( row )
        const inputDetails = resolveInputDetails( row )

        // Send row_started event with optimistic placeholder
        send( "row_started", {
          rowId: row.id,
          rowIndex: i,
          input: inputDetails.inputValue,
        } )

        try {
          // Build enrichment input
          const enrichmentInput: EnrichmentInput = {}
          const email = row.email?.trim()
          const domain = row.domain?.trim()
          const companyName = row.company_name?.trim()

          if ( email ) enrichmentInput.email = email
          else if ( domain ) enrichmentInput.domain = domain
          else if ( companyName ) enrichmentInput.company_name = companyName

          if ( !enrichmentInput.email && !enrichmentInput.domain && !enrichmentInput.company_name ) {
            await markRowFailed( {
              row,
              rowIndex: i,
              errorMessage: "No domain, email, or company name provided",
              contact: contactFromRow,
            } )
            continue
          }

          // Check cache
          const cacheKey = inputDetails.domain
          let result: EnrichedResult | null = null

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
              const cachedRow = cached[0]
              result = mapToEnrichedResult( cachedRow, 'cache' )
              result = { ...result, contact: mergeContact( result.contact, contactFromRow ) }

              send( "row_progress", {
                rowId: row.id,
                rowIndex: i,
                phase: "cache_hit",
                message: "Found in cache",
              } )

              if ( shouldGenerateSynthesis && result ) {
                send( "row_progress", {
                  rowId: row.id,
                  rowIndex: i,
                  phase: "synthesis",
                  status: "running",
                  message: "Generating intelligence brief...",
                } )

                const synthesis = await generateSynthesis( result )
                if ( synthesis ) {
                  result.synthesis = synthesis
                }
              }

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
                    ${cachedRow.input_type || Object.keys( enrichmentInput )[0] || "domain"},
                    ${inputDetails.inputValue},
                    ${cachedRow.normalized_url || cachedRow.discovery_data?.website || null},
                    ${cachedRow.domain || cacheKey},
                    ${cachedRow.company_name || result.company_name},
                    ${cachedRow.company_description || result.company_description},
                    ${cachedRow.industry || result.industry},
                    ${cachedRow.employee_count || result.employee_count || null},
                    ${cachedRow.founded_year || cachedRow.profile_data?.year_founded || null},
                    ${cachedRow.headquarters || result.headquarters},
                    ${cachedRow.website || result.website},
                    ${cachedRow.funding_total || result.funding_total},
                    ${JSON.stringify( result.technologies )},
                    ${JSON.stringify( result.leadership )},
                    ${JSON.stringify( cachedRow.discovery_data )},
                    ${JSON.stringify( cachedRow.profile_data )},
                    ${JSON.stringify( cachedRow.funding_data )},
                    ${JSON.stringify( cachedRow.tech_stack_data )},
                    ${JSON.stringify( { ...( cachedRow.custom_fields_data || {} ), contact: result.contact } )},
                    ${JSON.stringify( cachedRow.sources || result.sources )},
                    ${cachedRow.icp_fit_score || result.icp_fit_score},
                    ${cachedRow.icp_fit_reasons || result.icp_fit_reasons},
                    ${JSON.stringify( cachedRow.buying_signals || result.buying_signals )},
                    ${result.synthesis || cachedRow.synthesis || null},
                    ${cachedRow.completed_phases || ['discovery', 'company_profile', 'funding', 'tech_stack', 'custom_fields']},
                    'completed',
                    ${batchId},
                    ${userId}
                  )
                `

                await sql`
                  UPDATE enrichment_batches 
                  SET completed_rows = completed_rows + 1, updated_at = NOW()
                  WHERE id = ${batchId}
                `
              } catch ( cacheInsertError ) {
                console.error( "[Batch Stream] Cache persistence error:", cacheInsertError )
                await markRowFailed( {
                  row,
                  rowIndex: i,
                  errorMessage: "Failed to save cached enrichment results",
                  contact: contactFromRow,
                } )
                continue
              }

              completedCount++
              send( "row_completed", {
                rowId: row.id,
                rowIndex: i,
                enriched: result,
                contact: result?.contact,
              } )

              continue
            }
          }

          // Run enrichment if not cached
          if ( !result ) {
            // Send phase updates
            const phaseHandler = ( progress: { phase: string; status: string; message?: string } ) => {
              send( "row_progress", {
                rowId: row.id,
                rowIndex: i,
                phase: progress.phase,
                status: progress.status,
                message: progress.message,
              } )
            }

            const enrichResult = await runEnrichment( enrichmentInput, {
              onProgress: phaseHandler,
            } )

            if ( !enrichResult.success ) {
              await markRowFailed( {
                row,
                rowIndex: i,
                errorMessage: enrichResult.errors?.[0]?.error || "Enrichment failed",
                contact: contactFromRow,
              } )
              continue
            }

            // Map using safe helper
            result = mapToEnrichedResult( enrichResult.data, 'fresh' )
            result = { ...result, contact: mergeContact( result.contact, contactFromRow ) }

            // Destructure for DB save (still needed for separate columns)
            const { discovery, profile, funding, techStack, customFields, sources } = enrichResult.data
            const customFieldsWithContact = { ...customFields, contact: result.contact }

            if ( shouldGenerateSynthesis && result ) {
              send( "row_progress", {
                rowId: row.id,
                rowIndex: i,
                phase: "synthesis",
                status: "running",
                message: "Generating intelligence brief...",
              } )

              const synthesis = await generateSynthesis( result )
              if ( synthesis ) {
                result.synthesis = synthesis
              }
            }

            // Save to DB
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
                  ${inputDetails.inputValue},
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
                  ${JSON.stringify( result.technologies )},
                  ${JSON.stringify( customFields.key_executives )},
                  ${JSON.stringify( discovery )},
                  ${JSON.stringify( profile )},
                  ${JSON.stringify( funding )},
                  ${JSON.stringify( techStack )},
                  ${JSON.stringify( customFieldsWithContact )},
                  ${JSON.stringify( sources )},
                  ${customFields.icp_fit_score},
                  ${customFields.icp_fit_reasons},
                  ${JSON.stringify( customFields.buying_signals )},
                  ${result.synthesis || null},
                  ${['discovery', 'company_profile', 'funding', 'tech_stack', 'custom_fields']},
                  'completed',
                  ${batchId},
                  ${userId}
                )
              `
            } catch ( dbError ) {
              console.error( "[Batch Stream] DB save error:", dbError )
              await markRowFailed( {
                row,
                rowIndex: i,
                errorMessage: "Failed to save enrichment results",
                contact: contactFromRow,
              } )
              continue
            }
          }

          // Send completed event
          completedCount++
          await sql`
            UPDATE enrichment_batches 
            SET completed_rows = completed_rows + 1, updated_at = NOW()
            WHERE id = ${batchId}
          `

          send( "row_completed", {
            rowId: row.id,
            rowIndex: i,
            enriched: result,
            contact: result?.contact,
          } )

        } catch ( error ) {
          await markRowFailed( {
            row,
            rowIndex: i,
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            contact: contactFromRow,
          } )
        }
      }

      // Update batch status
      await sql`
        UPDATE enrichment_batches 
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${batchId}
      `

      // Send batch complete event
      send( "batch_completed", {
        batchId,
        completedCount,
        failedCount,
        totalRows: rows.length,
      } )

      controller.close()
    },
  } )

  return new Response( stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  } )
}
