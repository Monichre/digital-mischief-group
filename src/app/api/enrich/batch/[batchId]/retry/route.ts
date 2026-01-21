import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { runEnrichment, type EnrichmentInput } from "@/daedalus/enrich/api"
import { generateWithFallback } from "@/ai/tools/llm.tool"
import { z } from "zod"

export const maxDuration = 60

/**
 * T-008: CSV Enrichment Flow
 *
 * Retry API endpoint for failed enrichment rows.
 * Allows users to retry individual rows or all failed rows in a batch.
 */

const RetryInputSchema = z.object({
  jobIds: z.array(z.string().uuid()).min(1).max(50),
})

// Synthesis generator (copied from stream route for consistency)
async function generateSynthesis(result: {
  company_name: string | null
  industry: string | null
  segment: string | null
  employee_count: string | number | null
  funding_total: string | null
  funding_stage: string | null
  tech_signals?: { ai_adoption: boolean; modern_stack: boolean; cloud_native: boolean }
  buying_signals?: Array<{ signal: string; confidence: number }>
  icp_fit_score: number
  icp_fit_reasons?: string[]
}): Promise<string | null> {
  try {
    const prompt = `You are an intelligence analyst at a strategic sales consultancy. Based on the enrichment data below, write a concise 2-3 sentence "Why This Company Matters" brief for a sales team.

Company: ${result.company_name}
Industry: ${result.industry || "Unknown"}
Segment: ${result.segment || "Unknown"}
Employees: ${result.employee_count || "Unknown"}
Funding: ${result.funding_total || "Unknown"} (${result.funding_stage || "Unknown stage"})
ICP Fit Score: ${result.icp_fit_score}/100

Key Signals:
- AI Adoption: ${result.tech_signals?.ai_adoption ? "Yes" : "No"}
- Modern Stack: ${result.tech_signals?.modern_stack ? "Yes" : "No"}
- Buying Signals: ${result.buying_signals?.map((s) => s.signal).join(", ") || "None detected"}

ICP Fit Reasons: ${result.icp_fit_reasons?.join("; ") || "None"}

Write a brief that:
1. Summarizes why this company is worth pursuing
2. Highlights the most compelling buying signal or timing factor
3. Suggests an angle for outreach

Keep it under 100 words. Be direct and actionable.`

    const response = await generateWithFallback({
      prompt,
      maxTokens: 200,
      temperature: 0.7,
    })

    return response.text
  } catch (error) {
    console.error("[Retry Synthesis] Error:", error)
    return `${result.company_name} - ${result.industry || "Company"} with ICP fit score ${result.icp_fit_score}/100.`
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const { batchId } = await params

    // Validate batch ownership
    const batchCheck = await sql`
      SELECT id FROM enrichment_batches
      WHERE id = ${batchId} AND user_id = ${userId}
    `

    if (batchCheck.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = RetryInputSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      )
    }

    const { jobIds } = validation.data

    // Fetch failed jobs to retry
    const failedJobs = await sql`
      SELECT id, input_type, input_value, domain, custom_fields_data
      FROM enrichment_jobs
      WHERE id = ANY(${jobIds})
        AND batch_id = ${batchId}
        AND status = 'failed'
    `

    if (failedJobs.length === 0) {
      return NextResponse.json({ error: "No failed jobs found to retry" }, { status: 400 })
    }

    // Process retries and collect results
    const results: Array<{
      jobId: string
      status: "completed" | "failed"
      error?: string
      enriched?: Record<string, unknown>
    }> = []

    for (const job of failedJobs) {
      const inputType = job.input_type as string
      const inputValue = job.input_value as string
      const contact = (job.custom_fields_data as Record<string, unknown>)?.contact || null

      // Build enrichment input
      const enrichmentInput: EnrichmentInput = {}
      if (inputType === "email") enrichmentInput.email = inputValue
      else if (inputType === "domain") enrichmentInput.domain = inputValue
      else if (inputType === "company_name") enrichmentInput.company_name = inputValue
      else {
        results.push({
          jobId: job.id,
          status: "failed",
          error: "Invalid input type",
        })
        continue
      }

      try {
        // Run enrichment
        const enrichResult = await runEnrichment(enrichmentInput, {
          onProgress: () => {}, // No streaming for retry
        })

        if (!enrichResult.success) {
          // Update job with new error
          await sql`
            UPDATE enrichment_jobs
            SET error_message = ${enrichResult.errors?.[0]?.error || "Enrichment failed"},
                updated_at = NOW()
            WHERE id = ${job.id}
          `

          results.push({
            jobId: job.id,
            status: "failed",
            error: enrichResult.errors?.[0]?.error || "Enrichment failed",
          })
          continue
        }

        const { discovery, profile, funding, techStack, customFields, sources } = enrichResult.data

        // Generate synthesis
        const synthesisResult = {
          company_name: discovery.company_name,
          industry: profile.industry,
          segment: profile.segment,
          employee_count: profile.employee_count,
          funding_total: funding.total_funding,
          funding_stage: funding.funding_stage,
          tech_signals: techStack.signals,
          buying_signals: customFields.buying_signals,
          icp_fit_score: customFields.icp_fit_score,
          icp_fit_reasons: customFields.icp_fit_reasons,
        }
        const synthesis = await generateSynthesis(synthesisResult)

        // Merge contact from original failed job
        const customFieldsWithContact = { ...customFields, contact }

        // Update job with successful enrichment
        await sql`
          UPDATE enrichment_jobs
          SET
            normalized_url = ${discovery.website},
            domain = ${discovery.domain},
            company_name = ${discovery.company_name},
            company_description = ${profile.description},
            industry = ${profile.industry},
            employee_count = ${profile.employee_count},
            founded_year = ${profile.year_founded},
            headquarters = ${profile.headquarters},
            website = ${discovery.website},
            funding_total = ${funding.total_funding},
            technologies = ${JSON.stringify([...techStack.languages, ...techStack.frameworks, ...techStack.tools])},
            leadership = ${JSON.stringify(customFields.key_executives)},
            discovery_data = ${JSON.stringify(discovery)},
            profile_data = ${JSON.stringify(profile)},
            funding_data = ${JSON.stringify(funding)},
            tech_stack_data = ${JSON.stringify(techStack)},
            custom_fields_data = ${JSON.stringify(customFieldsWithContact)},
            sources = ${JSON.stringify(sources)},
            icp_fit_score = ${customFields.icp_fit_score},
            icp_fit_reasons = ${customFields.icp_fit_reasons},
            buying_signals = ${JSON.stringify(customFields.buying_signals)},
            synthesis = ${synthesis},
            completed_phases = ${["discovery", "company_profile", "funding", "tech_stack", "custom_fields"]},
            status = 'completed',
            error_message = NULL,
            updated_at = NOW()
          WHERE id = ${job.id}
        `

        // Update batch counts
        await sql`
          UPDATE enrichment_batches
          SET
            completed_rows = completed_rows + 1,
            failed_rows = GREATEST(failed_rows - 1, 0),
            updated_at = NOW()
          WHERE id = ${batchId}
        `

        results.push({
          jobId: job.id,
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
            contact,
            synthesis,
            sources,
          },
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error"

        await sql`
          UPDATE enrichment_jobs
          SET error_message = ${errorMessage},
              updated_at = NOW()
          WHERE id = ${job.id}
        `

        results.push({
          jobId: job.id,
          status: "failed",
          error: errorMessage,
        })
      }
    }

    const successCount = results.filter((r) => r.status === "completed").length
    const failCount = results.filter((r) => r.status === "failed").length

    return NextResponse.json({
      success: true,
      summary: {
        total: results.length,
        succeeded: successCount,
        failed: failCount,
      },
      results,
    })
  } catch (error) {
    console.error("[Retry Batch] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to retry rows" },
      { status: 500 }
    )
  }
}
