import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { getMonitors, createMonitor } from "@/daedalus/observe/workflow"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const monitors = await getMonitors(session.user.id)
    return NextResponse.json({ monitors })
  } catch (error) {
    console.error("Failed to fetch monitors:", error)
    return NextResponse.json({ error: "Failed to fetch monitors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, url, check_interval_seconds, notification_email } = body

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL required" }, { status: 400 })
    }

    const monitor = await createMonitor(
      { name, url, check_interval_seconds, notification_email },
      session.user.id
    )

    return NextResponse.json({ monitor })
  } catch (error) {
    console.error("Failed to create monitor:", error)
    return NextResponse.json({ error: "Failed to create monitor" }, { status: 500 })
  }
}
