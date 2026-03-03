import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { auth } from "@/platform/auth/server"
import { getRule, sendTestNotification } from "@/daedalus/radar/service"

const BodySchema = z.object({ ruleId: z.string().uuid() })

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const rule = await getRule(parsed.data.ruleId, session.user.id)
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const ok = await sendTestNotification(rule)
    return NextResponse.json({ success: ok })
  } catch (error) {
    console.error("[radar] test notification error", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
