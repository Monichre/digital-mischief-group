import { type NextRequest } from "next/server"
import { sql } from "@/lib/db/neon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { orchestrateEnrichment, type EnrichmentInput } from "@/lib/agents"
import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 300

interface BatchStreamInput {
  rows: Array<{
    id: string
    domain?: string
    email?: string
    company_name?: string
  }>
  generateSynthesis?: boolean
}

interface EnrichedResult {
  company_name: string | null
  company_description: string | null
  industry: string | null
  segment: string | null
  employee_count: number | null
  headquarters: string | null
  website: string | null
  funding_stage: string | null
  funding_total: string | null
  investors: string[]
  technologies: string[]
  tech_signals: { ai_adoption: boolean; modern_stack: boolean; cloud_native: boolean }
  leadership: Array<{ name: string; title: string; linkedin: string | null }>
  ceo_name: string | null
  icp_fit_score: number
  icp_fit_reasons: string[]
  buying_signals: Array<{ signal: string; confidence: number }>
  sources: string[]
  synthesis?: string
}

async function generateSynthesis(result: EnrichedResult): Promise<string | null> {
  try {
    const anthropic = new Anthropic()
    
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
- Buying Signals: ${result.buying_signals?.map(s => s.signal).join(', ') || 'None detected'}

ICP Fit Reasons: ${result.icp_fit_reasons?.join('; ') || 'None'}

Write a brief that:
1. Summarizes why this company is worth pursuing
2. Highlights the most compelling buying signal or timing factor
3. Suggests an angle for outreach

Keep it under 100 words. Be direct and actionable.`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0]
    if (text.type === "text") {
      return text.text
    }
    return null
  } catch (error) {
    console.error("[Synthesis] Error:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }
  const userId = session.user.id

  const body = (await request.json()) as BatchStreamInput
  const { rows, generateSynthesis: shouldGenerateSynthesis = false } = body

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return new Response(JSON.stringify({ error: "No rows provided" }), { status: 400 })
  }

  if (rows.length > 100) {
    return new Response(JSON.stringify({ error: "Maximum 100 rows per streaming batch" }), { status: 400 })
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
  } catch (error) {
    console.error("[Batch Stream] Failed to create batch:", error)
    return new Response(JSON.stringify({ error: "Failed to create batch" }), { status: 500 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      // Send batch started event
      send("batch_started", { batchId, totalRows: rows.length })

      let completedCount = 0
      let failedCount = 0

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]

        // Send row_started event with optimistic placeholder
        send("row_started", {
          rowId: row.id,
          rowIndex: i,
          input: row.domain || row.email || row.company_name,
        })

        try {
          // Build enrichment input
          const enrichmentInput: EnrichmentInput = {}
          if (row.email) enrichmentInput.email = row.email
          else if (row.domain) enrichmentInput.domain = row.domain
          else if (row.company_name) enrichmentInput.company_name = row.company_name

          if (!enrichmentInput.email && !enrichmentInput.domain && !enrichmentInput.company_name) {
            failedCount++
            send("row_failed", {
              rowId: row.id,
              rowIndex: i,
              error: "No domain, email, or company name provided",
            })
            continue
          }

          // Check cache
          const cacheKey = row.domain || (row.email ? row.email.split("@")[1] : null)
          let result: EnrichedResult | null = null

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
              result = {
                company_name: cached[0].company_name,
                company_description: cached[0].company_description,
                industry: cached[0].industry,
                segment: cached[0].profile_data?.segment || null,
                employee_count: cached[0].employee_count,
                headquarters: cached[0].headquarters,
                website: cached[0].website,
                funding_stage: cached[0].funding_data?.funding_stage || null,
                funding_total: cached[0].funding_total,
                investors: cached[0].funding_data?.investors || [],
                technologies: cached[0].technologies || [],
                tech_signals: cached[0].tech_stack_data?.signals || { ai_adoption: false, modern_stack: false, cloud_native: false },
                leadership: cached[0].leadership || [],
                ceo_name: cached[0].custom_fields_data?.ceo_name || null,
                icp_fit_score: cached[0].icp_fit_score || 0,
                icp_fit_reasons: cached[0].icp_fit_reasons || [],
                buying_signals: cached[0].buying_signals || [],
                sources: cached[0].sources || [],
              }

              send("row_progress", {
                rowId: row.id,
                rowIndex: i,
                phase: "cache_hit",
                message: "Found in cache",
              })
            }
          }

          // Run enrichment if not cached
          if (!result) {
            // Send phase updates
            const phaseHandler = (progress: { phase: string; status: string; message?: string }) => {
              send("row_progress", {
                rowId: row.id,
                rowIndex: i,
                phase: progress.phase,
                status: progress.status,
                message: progress.message,
              })
            }

            const enrichResult = await orchestrateEnrichment(enrichmentInput, {
              onProgress: phaseHandler,
            })

            if (!enrichResult.success) {
              failedCount++
              await sql`
                UPDATE enrichment_batches 
                SET failed_rows = failed_rows + 1, updated_at = NOW()
                WHERE id = ${batchId}
              `
              send("row_failed", {
                rowId: row.id,
                rowIndex: i,
                error: enrichResult.errors?.[0]?.error || "Enrichment failed",
              })
              continue
            }

            const { discovery, profile, funding, techStack, customFields, sources } = enrichResult.data

            result = {
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
                  completed_phases, status, batch_id, user_id
                ) VALUES (
                  ${Object.keys(enrichmentInput)[0]},
                  ${row.email || row.domain || row.company_name},
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
                  ${JSON.stringify(result.technologies)},
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
            } catch (dbError) {
              console.error("[Batch Stream] DB save error:", dbError)
            }
          }

          // Generate synthesis if requested
          if (shouldGenerateSynthesis && result) {
            send("row_progress", {
              rowId: row.id,
              rowIndex: i,
              phase: "synthesis",
              status: "running",
              message: "Generating intelligence brief...",
            })

            const synthesis = await generateSynthesis(result)
            if (synthesis) {
              result.synthesis = synthesis
            }
          }

          // Send completed event
          completedCount++
          await sql`
            UPDATE enrichment_batches 
            SET completed_rows = completed_rows + 1, updated_at = NOW()
            WHERE id = ${batchId}
          `

          send("row_completed", {
            rowId: row.id,
            rowIndex: i,
            enriched: result,
          })

        } catch (error) {
          failedCount++
          send("row_failed", {
            rowId: row.id,
            rowIndex: i,
            error: error instanceof Error ? error.message : "Unknown error",
          })
        }
      }

      // Update batch status
      await sql`
        UPDATE enrichment_batches 
        SET status = 'completed', updated_at = NOW()
        WHERE id = ${batchId}
      `

      // Send batch complete event
      send("batch_completed", {
        batchId,
        completedCount,
        failedCount,
        totalRows: rows.length,
      })

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
