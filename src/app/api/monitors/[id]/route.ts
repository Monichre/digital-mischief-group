import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { getMonitor, deleteMonitor } from "@/daedalus/observe/workflow"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const result = await getMonitor(id, session.user.id)

    if (!result) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Failed to fetch monitor:", error)
    return NextResponse.json({ error: "Failed to fetch monitor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const deleted = await deleteMonitor(id, session.user.id)

    if (!deleted) {
      return NextResponse.json({ error: "Monitor not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete monitor:", error)
    return NextResponse.json({ error: "Failed to delete monitor" }, { status: 500 })
  }
}
