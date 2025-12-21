import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { generateText } from "ai"

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

function hashContent(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return hash.toString(16)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [monitor] = await sql`SELECT * FROM monitors WHERE id = ${id}`

    if (!monitor) {
      return NextResponse.json({ error: "Monitor not found" }, { status: 404 })
    }

    // Scrape current content
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: monitor.url,
        formats: ["markdown"],
      }),
    })

    if (!scrapeResponse.ok) {
      return NextResponse.json({ error: "Failed to scrape URL" }, { status: 500 })
    }

    const scrapeData = await scrapeResponse.json()
    const content = scrapeData.data?.markdown || ""
    const newHash = hashContent(content)
    const excerpt = content.slice(0, 500)

    // Check if content changed
    const hasChanged = monitor.last_content_hash && monitor.last_content_hash !== newHash

    if (hasChanged) {
      // Generate AI summary of changes
      let aiSummary = null
      try {
        const { text } = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: `Summarize what changed on this webpage. Be concise (2-3 sentences).
          
Old excerpt: ${monitor.last_excerpt || "N/A"}

New excerpt: ${excerpt}`,
        })
        aiSummary = text
      } catch (e) {
        console.error("AI summary failed:", e)
      }

      // Record the change
      await sql`
        INSERT INTO monitor_changes (monitor_id, old_hash, new_hash, old_excerpt, new_excerpt, ai_summary)
        VALUES (${id}, ${monitor.last_content_hash}, ${newHash}, ${monitor.last_excerpt || null}, ${excerpt}, ${aiSummary})
      `
    }

    // Update monitor
    await sql`
      UPDATE monitors 
      SET last_checked_at = NOW(), last_content_hash = ${newHash}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      changed: hasChanged,
      new_hash: newHash,
    })
  } catch (error) {
    console.error("Failed to check monitor:", error)
    return NextResponse.json({ error: "Failed to check monitor" }, { status: 500 })
  }
}
