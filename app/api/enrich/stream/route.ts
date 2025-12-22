import { type NextRequest } from 'next/server'
import { sql } from '@/lib/db/neon'
import { getFirecrawlClient } from '@/lib/firecrawl/client'
import { conductEnrichment } from '@/lib/agents/conductor'
import type { EnrichmentInput } from '@/lib/agents'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import type { EnrichStreamEvent } from '@/lib/enrich/stream-types'

function formatSSE(event: EnrichStreamEvent): string {
  return `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`
}

export async function POST(request: NextRequest) {
  // Check auth
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const userId = session.user.id

  const { input } = await request.json()

  if (!input || typeof input !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const inputTrimmed = input.trim()

  // Determine input type
  const enrichmentInput: EnrichmentInput = {}
  if (inputTrimmed.includes('@')) {
    enrichmentInput.email = inputTrimmed
  } else if (inputTrimmed.includes('://')) {
    enrichmentInput.url = inputTrimmed
  } else if (inputTrimmed.includes('.') && !inputTrimmed.includes(' ')) {
    enrichmentInput.domain = inputTrimmed
  } else {
    enrichmentInput.company_name = inputTrimmed
  }

  const encoder = new TextEncoder()
  const startTime = Date.now()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: EnrichStreamEvent) => {
        controller.enqueue(encoder.encode(formatSSE(event)))
      }

      try {
        // Run conductor-orchestrated enrichment with thought streaming
        const result = await conductEnrichment(enrichmentInput, {
          onThought: (thought) => {
            send({
              type: 'conductor_thought',
              data: {
                thoughtType: thought.type,
                content: thought.content,
                relatedPhase: thought.relatedPhase,
              },
            })
          },
          onDecision: (decision) => {
            send({
              type: 'conductor_decision',
              data: {
                phase: decision.phase,
                action: decision.action,
                reason: decision.reason,
              },
            })
          },
          onProgress: (phase, status, message) => {
            if (status === 'running') {
              send({
                type: 'phase_start',
                data: { phase, message },
              })
            } else if (status === 'completed') {
              send({
                type: 'phase_complete',
                data: { phase, message, result: null },
              })
            } else if (status === 'failed') {
              send({
                type: 'phase_error',
                data: { phase, error: message, recoverable: true },
              })
            } else if (status === 'skipped') {
              send({
                type: 'phase_skipped',
                data: { phase, reason: message },
              })
            }
          },
        })

        if (!result.success) {
          send({
            type: 'error',
            data: {
              message: result.errors?.[0]?.error || 'Enrichment failed',
              code: 'ENRICHMENT_FAILED',
            },
          })

          // Save failed job
          try {
            await sql`
              INSERT INTO enrichment_jobs (
                input_type, input_value, domain, status, error_message, user_id
              ) VALUES (
                ${Object.keys(enrichmentInput)[0]}, 
                ${inputTrimmed}, 
                ${result.data?.discovery?.domain || null}, 
                'failed', 
                ${result.errors?.[0]?.error || 'Enrichment failed'}, 
                ${userId}
              )
            `
          } catch (dbError) {
            console.error('[Enrich Stream] DB error:', dbError)
          }

          controller.close()
          return
        }

        const { discovery, profile, funding, techStack, customFields, sources } = result.data

        // Get branding/screenshot
        send({
          type: 'phase_start',
          data: { phase: 'branding', message: 'Extracting brand assets...' },
        })

        const firecrawl = getFirecrawlClient()
        const brandResult = await firecrawl.extractBrand(discovery.website)
        const screenshot = brandResult.success ? brandResult.data?.screenshot : null
        const logo = brandResult.success ? brandResult.data?.branding?.logo : null

        send({
          type: 'phase_complete',
          data: { phase: 'branding', message: 'Brand assets extracted', result: { logo, screenshot: !!screenshot } },
        })

        // Save to database
        let savedJob = null
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
              ${Object.keys(enrichmentInput)[0]}, 
              ${inputTrimmed}, 
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
              ${JSON.stringify(result.data)}, 
              'completed', 
              ${userId}
            )
            RETURNING *
          `
          savedJob = dbResult[0]
        } catch (dbError) {
          console.error('[Enrich Stream] DB error:', dbError)
        }

        // Log usage
        try {
          await sql`
            INSERT INTO usage_events (event_type, module, input_value, status, metadata, user_id)
            VALUES (
              'enrichment', 
              'enrich', 
              ${inputTrimmed}, 
              'success', 
              ${JSON.stringify({ 
                domain: discovery.domain, 
                duration_ms: result.duration_ms,
                icp_score: customFields.icp_fit_score,
                is_personal_site: customFields.is_personal_site,
                synthesis: !!result.synthesis,
                thoughts_count: result.thoughts.length,
                errors: result.errors?.length || 0
              })}, 
              ${userId}
            )
          `
        } catch (usageError) {
          console.error('[Enrich Stream] Usage logging error:', usageError)
        }

        // Send complete event with full result
        const finalResult = {
          id: savedJob?.id,
          input_type: Object.keys(enrichmentInput)[0],
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
          is_personal_site: customFields.is_personal_site,
          buying_signals: customFields.buying_signals,
          tech_signals: techStack.signals,
          screenshot,
          sources,
          synthesis: result.synthesis,
          thoughts: result.thoughts,
          agents: {
            discovery,
            profile,
            funding,
            techStack,
            customFields,
          },
        }

        send({
          type: 'complete',
          data: {
            success: true,
            result: finalResult,
            duration_ms: Date.now() - startTime,
            errors: result.errors?.map(e => ({ phase: e.phase, error: e.error })),
          },
        })

      } catch (error) {
        send({
          type: 'error',
          data: {
            message: error instanceof Error ? error.message : 'Enrichment failed',
            code: 'UNKNOWN_ERROR',
          },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
