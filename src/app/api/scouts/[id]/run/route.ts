import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { runScout } from "@/daedalus/scout/workflow"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const { id } = await params

    const result = await runScout(id, userId)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      new_results: result.new_results,
      total_searched: result.total_searched,
      duplicates_removed: result.duplicates_removed,
    })
  } catch (error) {
    console.error("Failed to run scout:", error)
    return NextResponse.json({ error: "Failed to run scout" }, { status: 500 })
  }
}
