import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/platform/auth/server"
import { createRule, listRules } from "@/daedalus/radar/service"
import type { RadarSource } from "@/daedalus/radar/types"

const RuleSchema = z.object({
  name: z.string().min(1),
  terms: z.array(z.string().min(1)).min(1),
  sources: z.array(z.enum(["twitter", "reddit", "hackernews", "firecrawl", "exa"] as [RadarSource, ...RadarSource[]])).min(1),
  notify_email: z.string().email().optional().nullable(),
  notify_webhook: z.string().url().optional().nullable(),
  cooldown_minutes: z.number().int().min(1).max(1440).optional(),
  check_interval_minutes: z.number().int().min(5).max(1440).optional(),
})

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await listRules(session.user.id)
    return NextResponse.json({ rules })
  } catch (error) {
    console.error("[radar] list rules error", error)
    return NextResponse.json({ error: "Failed to list rules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = RuleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const rule = await createRule({
      userId: session.user.id,
      name: parsed.data.name,
      terms: parsed.data.terms,
      sources: parsed.data.sources,
      notify_email: parsed.data.notify_email ?? null,
      notify_webhook: parsed.data.notify_webhook ?? null,
      cooldown_minutes: parsed.data.cooldown_minutes,
      check_interval_minutes: parsed.data.check_interval_minutes,
    })

    return NextResponse.json({ rule })
  } catch (error) {
    console.error("[radar] create rule error", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}
