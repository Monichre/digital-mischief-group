import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/platform/auth/server"
import { headers } from "next/headers"
import { getMonitors, createMonitor } from "@/daedalus/observe/workflow"

// Input validation schema
const CreateMonitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  check_interval_seconds: z.number().int().min(60).optional(),
  notification_email: z.string().email().optional().nullable(),
})

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
    
    // Validate input with Zod
    const parseResult = CreateMonitorSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      )
    }

    const { name, url, check_interval_seconds, notification_email } = parseResult.data

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
