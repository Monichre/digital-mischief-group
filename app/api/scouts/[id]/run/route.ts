import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"

const SERPER_API_KEY = process.env.SERPER_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY

async function searchSerper(query: string) {
  if (!SERPER_API_KEY) return []

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query, num: 20 }),
  })

  if (!response.ok) return []

  const data = await response.json()
  return (data.organic || []).map((r: { link: string; title: string; snippet: string }) => ({
    url: r.link,
    title: r.title,
    snippet: r.snippet,
    source: "serper",
  }))
}

async function searchExa(query: string) {
  if (!EXA_API_KEY) return []

  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "x-api-key": EXA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      numResults: 20,
      useAutoprompt: true,
    }),
  })

  if (!response.ok) return []

  const data = await response.json()
  return (data.results || []).map((r: { url: string; title: string; text: string }) => ({
    url: r.url,
    title: r.title,
    snippet: r.text?.slice(0, 300),
    source: "exa",
  }))
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const [scout] = await sql`SELECT * FROM scouts WHERE id = ${id}`

    if (!scout) {
      return NextResponse.json({ error: "Scout not found" }, { status: 404 })
    }

    // Run searches in parallel
    const [serperResults, exaResults] = await Promise.all([
      searchSerper(scout.search_query),
      searchExa(scout.search_query),
    ])

    const allResults = [...serperResults, ...exaResults]
    const seenUrls = new Set(scout.seen_urls || [])
    const newResults = allResults.filter((r: { url: string }) => !seenUrls.has(r.url))

    // Insert new results
    let insertedCount = 0
    for (const result of newResults) {
      await sql`
        INSERT INTO scout_results (scout_id, url, title, snippet, source, metadata)
        VALUES (${id}, ${result.url}, ${result.title}, ${result.snippet}, ${result.source}, ${JSON.stringify(result)})
      `
      insertedCount++
    }

    // Update scout with new seen URLs and last run time
    const newSeenUrls = [...seenUrls, ...newResults.map((r: { url: string }) => r.url)]
    await sql`
      UPDATE scouts 
      SET seen_urls = ${newSeenUrls}, last_run_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      new_results: insertedCount,
      total_searched: allResults.length,
    })
  } catch (error) {
    console.error("Failed to run scout:", error)
    return NextResponse.json({ error: "Failed to run scout" }, { status: 500 })
  }
}
