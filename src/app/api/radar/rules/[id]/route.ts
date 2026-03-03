import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { headers } from "next/headers"
import { auth } from "@/platform/auth/server"
import { getRule, updateRule, deleteRule } from "@/daedalus/radar/service"
import type { RadarSource } from "@/daedalus/radar/types"

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  terms: z.array(z.string().min(1)).min(1).optional(),
  sources: z.array(z.enum(["twitter", "reddit", "hackernews", "firecrawl", "exa"] as [RadarSource, ...RadarSource[]])).min(1).optional(),
  notify_email: z.string().email().nullable().optional(),
  notify_webhook: z.string().url().nullable().optional(),
  cooldown_minutes: z.number().int().min(1).max(1440).optional(),
  check_interval_minutes: z.number().int().min(5).max(1440).optional(),
  is_active: z.boolean().optional(),
})

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const rule = await getRule(id, session.user.id)
    if (!rule) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ rule })
  } catch (error) {
    console.error("[radar] get rule error", error)
    return NextResponse.json({ error: "Failed to fetch rule" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const body = await request.json()
    const parsed = UpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 })
    }

    const updated = await updateRule(id, session.user.id, parsed.data)
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ rule: updated })
  } catch (error) {
    console.error("[radar] update rule error", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id } = await params
    const ok = await deleteRule(id, session.user.id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[radar] delete rule error", error)
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
