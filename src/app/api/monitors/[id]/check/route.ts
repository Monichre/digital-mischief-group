import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { checkMonitor } from "@/daedalus/observe/workflow"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await checkMonitor(id, session.user.id)

    if (!result.success) {
      const status = result.error === "Monitor not found" ? 404 : 500
      return NextResponse.json({ error: result.error }, { status })
    }

    return NextResponse.json({
      success: true,
      changed: result.changed,
      new_hash: result.newHash,
    })
  } catch (error) {
    console.error("Failed to check monitor:", error)
    return NextResponse.json({ error: "Failed to check monitor" }, { status: 500 })
  }
}
