import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/platform/auth/server"
import { runRulesForUser } from "@/daedalus/radar/service"

const BodySchema = z.object({ ruleId: z.string().uuid().optional() })

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid input" }, { status: 400 })
    }

    const stats = await runRulesForUser(session.user.id, parsed.data.ruleId)
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("[radar] refresh error", error)
    return NextResponse.json({ error: "Failed to refresh radar" }, { status: 500 })
  }
}
