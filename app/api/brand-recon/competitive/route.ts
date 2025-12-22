import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { discoverCompetitors, type CompetitiveInput } from "@/lib/agents/competitive-discovery"

export const maxDuration = 60

// ============================================================================
// POST - Start competitive discovery
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { enrichmentJobId } = await request.json()

    if (!enrichmentJobId) {
      return NextResponse.json(
        { success: false, error: "enrichmentJobId required" },
        { status: 400 }
      )
    }

    // Fetch enrichment data
    const enrichment = await sql`
      SELECT
        id, company_name, domain, industry, company_description,
        profile_data
      FROM enrichment_jobs
      WHERE id = ${enrichmentJobId}
      AND user_id = ${userId}
      LIMIT 1
    `

    if (enrichment.length === 0) {
      return NextResponse.json(
        { success: false, error: "Enrichment job not found" },
        { status: 404 }
      )
    }

    const job = enrichment[0]
    const profileData = job.profile_data || {}

    // Check if brand recon already exists
    const existing = await sql`
      SELECT id, status FROM brand_recon_jobs
      WHERE enrichment_job_id = ${enrichmentJobId}
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        data: { id: existing[0].id, status: existing[0].status },
        message: "Brand recon already exists for this enrichment",
      })
    }

    // Create brand recon job
    const brandReconResult = await sql`
      INSERT INTO brand_recon_jobs (
        enrichment_job_id, source_company_name, source_domain,
        source_industry, status, user_id
      ) VALUES (
        ${enrichmentJobId}, ${job.company_name}, ${job.domain},
        ${job.industry}, 'processing', ${userId}
      )
      RETURNING id
    `

    const brandReconId = brandReconResult[0].id

    // Run competitive discovery asynchronously
    const competitiveInput: CompetitiveInput = {
      company_name: job.company_name,
      domain: job.domain,
      industry: job.industry,
      description: job.company_description,
      segment: profileData.segment || null,
    }

    // Start discovery (will run async)
    runCompetitiveDiscovery(brandReconId, competitiveInput, userId).catch((error) => {
      console.error("[Competitive Discovery] Background error:", error)
    })

    return NextResponse.json({
      success: true,
      data: {
        id: brandReconId,
        status: "processing",
      },
    })
  } catch (error) {
    console.error("[Brand Recon Competitive] Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET - Fetch brand recon results
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const enrichmentJobId = searchParams.get("enrichmentJobId")

    if (!id && !enrichmentJobId) {
      return NextResponse.json(
        { success: false, error: "id or enrichmentJobId required" },
        { status: 400 }
      )
    }

    let results
    if (id) {
      results = await sql`
        SELECT * FROM brand_recon_jobs
        WHERE id = ${id}
        AND user_id = ${userId}
        LIMIT 1
      `
    } else {
      results = await sql`
        SELECT * FROM brand_recon_jobs
        WHERE enrichment_job_id = ${enrichmentJobId}
        AND user_id = ${userId}
        LIMIT 1
      `
    }

    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: "Brand recon not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: results[0] })
  } catch (error) {
    console.error("[Brand Recon Competitive GET] Error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// ============================================================================
// Background Processing
// ============================================================================

async function runCompetitiveDiscovery(
  brandReconId: string,
  input: CompetitiveInput,
  userId: string
) {
  try {
    const result = await discoverCompetitors(input)

    if (!result.success || !result.data) {
      // Update as failed
      await sql`
        UPDATE brand_recon_jobs
        SET status = 'failed', error_message = ${result.error || "Discovery failed"}, updated_at = NOW()
        WHERE id = ${brandReconId}
      `
      return
    }

    const data = result.data

    // Save results
    await sql`
      UPDATE brand_recon_jobs
      SET
        competitors = ${JSON.stringify(data.competitors)},
        positioning_statement = ${data.positioning_statement},
        value_propositions = ${data.value_propositions},
        target_segments = ${data.target_segments},
        differentiation_points = ${data.differentiation_points},
        price_tier = ${data.price_tier},
        pricing_model = ${data.pricing_model},
        sources = ${JSON.stringify(data.sources)},
        status = 'completed',
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${brandReconId}
    `

    console.log(`[Competitive Discovery] Completed for brand_recon_job ${brandReconId}`)
  } catch (error) {
    console.error("[Competitive Discovery] Background error:", error)

    await sql`
      UPDATE brand_recon_jobs
      SET
        status = 'failed',
        error_message = ${error instanceof Error ? error.message : "Unknown error"},
        updated_at = NOW()
      WHERE id = ${brandReconId}
    `
  }
}
