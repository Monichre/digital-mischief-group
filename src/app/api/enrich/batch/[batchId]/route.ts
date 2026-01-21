import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

/**
 * T-008: CSV Enrichment Flow
 * 
 * Individual batch details API.
 * Returns batch metadata and all associated enrichment jobs.
 */

interface BatchJob {
  id: string
  inputType: string
  inputValue: string
  domain: string | null
  companyName: string | null
  status: string
  error: string | null
  enriched: {
    company_name: string | null
    company_description: string | null
    industry: string | null
    segment: string | null
    employee_count: number | string | null
    headquarters: string | null
    website: string | null
    funding_stage: string | null
    funding_total: string | null
    investors: string[]
    technologies: string[]
    tech_signals: {
      ai_adoption: boolean
      modern_stack: boolean
      cloud_native: boolean
    }
    leadership: Array<{ name: string; title: string; linkedin: string | null }>
    ceo_name: string | null
    icp_fit_score: number
    icp_fit_reasons: string[]
    buying_signals: Array<{ signal: string; confidence: number }>
    contact: {
      first_name: string | null
      last_name: string | null
      full_name: string | null
      title: string | null
      email: string | null
    } | null
    synthesis: string | null
    sources: string[]
  } | null
  createdAt: string
}

export async function GET(
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

    // Verify batch belongs to user
    const batchResult = await sql`
      SELECT id, total_rows, completed_rows, failed_rows, status, created_at, updated_at
      FROM enrichment_batches
      WHERE id = ${batchId} AND user_id = ${userId}
    `

    if (batchResult.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 })
    }

    const batch = batchResult[0]

    // Fetch all jobs for this batch
    const jobs = await sql`
      SELECT
        id, input_type, input_value, domain, company_name,
        company_description, industry, employee_count, founded_year,
        headquarters, website, funding_total,
        discovery_data, profile_data, funding_data, tech_stack_data,
        custom_fields_data, sources, synthesis, status, error_message, created_at
      FROM enrichment_jobs
      WHERE batch_id = ${batchId}
      ORDER BY created_at ASC
    `

    // Transform jobs to API response format
    const transformedJobs: BatchJob[] = jobs.map((job: any) => {
      const techStack = job.tech_stack_data || {}
      const customFields = job.custom_fields_data || {}
      const funding = job.funding_data || {}
      const profile = job.profile_data || {}

      return {
        id: job.id,
        inputType: job.input_type,
        inputValue: job.input_value,
        domain: job.domain,
        companyName: job.company_name,
        status: job.status,
        error: job.error_message,
        enriched: job.status === "completed" ? {
          company_name: job.company_name,
          company_description: job.company_description,
          industry: job.industry,
          segment: profile.segment || null,
          employee_count: job.employee_count,
          headquarters: job.headquarters,
          website: job.website,
          funding_stage: funding.funding_stage || null,
          funding_total: job.funding_total,
          investors: Array.isArray(funding.investors) ? funding.investors : [],
          technologies: [
            ...(techStack.languages || []),
            ...(techStack.frameworks || []),
            ...(techStack.tools || []),
          ],
          tech_signals: {
            ai_adoption: Boolean(techStack.signals?.ai_adoption),
            modern_stack: Boolean(techStack.signals?.modern_stack),
            cloud_native: Boolean(techStack.signals?.cloud_native),
          },
          leadership: Array.isArray(customFields.key_executives) 
            ? customFields.key_executives 
            : [],
          ceo_name: customFields.ceo_name || null,
          icp_fit_score: customFields.icp_fit_score || 0,
          icp_fit_reasons: Array.isArray(customFields.icp_fit_reasons) 
            ? customFields.icp_fit_reasons 
            : [],
          buying_signals: Array.isArray(customFields.buying_signals) 
            ? customFields.buying_signals 
            : [],
          contact: customFields.contact || null,
          synthesis: job.synthesis,
          sources: Array.isArray(job.sources) ? job.sources : [],
        } : null,
        createdAt: job.created_at,
      }
    })

    // Calculate stats
    const completed = batch.completed_rows || 0
    const failed = batch.failed_rows || 0
    const pending = batch.total_rows - completed - failed
    const successRate = (completed + failed) > 0 
      ? Math.round((completed / (completed + failed)) * 100) 
      : 0

    return NextResponse.json({
      batch: {
        id: batch.id,
        totalRows: batch.total_rows,
        completedRows: completed,
        failedRows: failed,
        pendingRows: pending,
        status: batch.status,
        successRate,
        createdAt: batch.created_at,
        updatedAt: batch.updated_at,
      },
      jobs: transformedJobs,
      failedJobs: transformedJobs.filter(j => j.status === "failed"),
    })
  } catch (error) {
    console.error("[Batch Details] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch batch details" },
      { status: 500 }
    )
  }
}
