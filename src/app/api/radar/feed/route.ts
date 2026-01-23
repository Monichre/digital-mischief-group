import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/platform/auth/server"
import { fetchFeed } from "@/daedalus/radar/service"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get("ruleId") || undefined
    const seenParam = searchParams.get("seen")
    const seen = seenParam === null ? undefined : seenParam === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const feed = await fetchFeed(session.user.id, { ruleId, seen, limit })
    return NextResponse.json({ feed })
  } catch (error) {
    console.error("[radar] feed error", error)
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 })
  }
}
