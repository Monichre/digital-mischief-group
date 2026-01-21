import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/platform/db/neon"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"

/**
 * T-008: CSV Enrichment Flow
 * 
 * Batch history API for session continuity.
 * Allows users to see past batches and resume interrupted sessions.
 */

export interface BatchSummary {
  id: string
  totalRows: number
  completedRows: number
  failedRows: number
  status: "processing" | "completed" | "failed" | "paused"
  createdAt: string
  updatedAt: string
  successRate: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id

    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const offset = parseInt(searchParams.get("offset") || "0")
    const status = searchParams.get("status") // Optional filter: processing, completed, failed

    // Build query with optional status filter
    let batches
    let total

    if (status) {
      batches = await sql`
        SELECT 
          id, 
          total_rows, 
          completed_rows, 
          failed_rows, 
          status, 
          created_at, 
          updated_at
        FROM enrichment_batches
        WHERE user_id = ${userId}
          AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      const countResult = await sql`
        SELECT COUNT(*) as count FROM enrichment_batches
        WHERE user_id = ${userId} AND status = ${status}
      `
      total = parseInt(countResult[0].count)
    } else {
      batches = await sql`
        SELECT 
          id, 
          total_rows, 
          completed_rows, 
          failed_rows, 
          status, 
          created_at, 
          updated_at
        FROM enrichment_batches
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      const countResult = await sql`
        SELECT COUNT(*) as count FROM enrichment_batches
        WHERE user_id = ${userId}
      `
      total = parseInt(countResult[0].count)
    }

    // Transform to API response format
    const transformedBatches: BatchSummary[] = batches.map((batch: any) => {
      const completed = batch.completed_rows || 0
      const failed = batch.failed_rows || 0
      const processed = completed + failed
      const successRate = processed > 0 ? Math.round((completed / processed) * 100) : 0

      return {
        id: batch.id,
        totalRows: batch.total_rows,
        completedRows: completed,
        failedRows: failed,
        status: batch.status,
        createdAt: batch.created_at,
        updatedAt: batch.updated_at,
        successRate,
      }
    })

    return NextResponse.json({
      batches: transformedBatches,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + batches.length < total,
      },
    })
  } catch (error) {
    console.error("[Batch History] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch batch history" },
      { status: 500 }
    )
  }
}
