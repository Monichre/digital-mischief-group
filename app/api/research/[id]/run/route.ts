import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db/neon"
import { generateText } from "ai"

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY
const SERPER_API_KEY = process.env.SERPER_API_KEY

interface Finding {
  title: string
  content: string
  source: string
  url?: string
  relevance: number
  category: "fact" | "insight" | "trend" | "competitor" | "opportunity"
}

// Perplexity search
async function searchPerplexity(query: string): Promise<Finding[]> {
  if (!PERPLEXITY_API_KEY) return []

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content:
              "You are a research assistant. Provide detailed, factual answers with specific data points, statistics, and insights. Focus on actionable intelligence.",
          },
          {
            role: "user",
            content: query,
          },
        ],
        max_tokens: 4096,
        return_citations: true,
      }),
    })

    if (!response.ok) return []

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""
    const citations = data.citations || []

    return [
      {
        title: "Perplexity Research",
        content,
        source: "perplexity",
        url: citations[0] || undefined,
        relevance: 0.9,
        category: "insight",
      },
    ]
  } catch (error) {
    console.error("Perplexity search failed:", error)
    return []
  }
}

// Exa search
async function searchExa(query: string): Promise<Finding[]> {
  if (!EXA_API_KEY) return []

  try {
    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EXA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        numResults: 10,
        useAutoprompt: true,
        type: "neural",
        contents: {
          text: { maxCharacters: 2000 },
        },
      }),
    })

    if (!response.ok) return []

    const data = await response.json()

    return (data.results || []).map((result: { title: string; text: string; url: string; score: number }) => ({
      title: result.title || "Untitled",
      content: result.text || "",
      source: "exa",
      url: result.url,
      relevance: result.score || 0.7,
      category: "fact" as const,
    }))
  } catch (error) {
    console.error("Exa search failed:", error)
    return []
  }
}

// Serper search
async function searchSerper(query: string): Promise<Finding[]> {
  if (!SERPER_API_KEY) return []

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 10 }),
    })

    if (!response.ok) return []

    const data = await response.json()

    return (data.organic || []).map((result: { title: string; snippet: string; link: string }, index: number) => ({
      title: result.title || "Untitled",
      content: result.snippet || "",
      source: "serper",
      url: result.link,
      relevance: 1 - index * 0.05,
      category: "fact" as const,
    }))
  } catch (error) {
    console.error("Serper search failed:", error)
    return []
  }
}

// Synthesize findings into summary
async function synthesizeFindings(query: string, findings: Finding[]): Promise<string> {
  const findingsText = findings
    .slice(0, 15)
    .map((f) => `[${f.source}] ${f.title}: ${f.content.slice(0, 500)}`)
    .join("\n\n")

  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4-20250514",
      system: `You are a strategic intelligence analyst for DMG (Digital Mischief Group). 
Your job is to synthesize research findings into actionable intelligence briefs.
Structure your analysis as:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. KEY FINDINGS (bullet points)
3. OPPORTUNITIES (what can be exploited)
4. THREATS (what to watch out for)
5. RECOMMENDED ACTIONS (specific next steps)

Be direct, tactical, and actionable. No fluff.`,
      prompt: `Research Query: ${query}

Raw Findings:
${findingsText}

Synthesize these findings into an intelligence brief.`,
      maxTokens: 2000,
    })

    return text
  } catch (error) {
    console.error("Synthesis failed:", error)
    return "Synthesis failed. Review raw findings manually."
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    // Get mission
    const [mission] = await sql`
      SELECT * FROM research_missions WHERE id = ${id}
    `

    if (!mission) {
      return NextResponse.json({ error: "Mission not found" }, { status: 404 })
    }

    // Update status to running
    await sql`
      UPDATE research_missions 
      SET status = 'running' 
      WHERE id = ${id}
    `

    const { query, sources, depth } = mission
    const enabledSources = sources || ["perplexity", "exa"]

    // Run searches in parallel
    const searchPromises: Promise<Finding[]>[] = []

    if (enabledSources.includes("perplexity")) {
      searchPromises.push(searchPerplexity(query))
    }
    if (enabledSources.includes("exa")) {
      searchPromises.push(searchExa(query))
    }
    if (enabledSources.includes("serper")) {
      searchPromises.push(searchSerper(query))
    }

    // For deep research, run additional queries
    if (depth === "deep") {
      const subQueries = [
        `${query} market trends 2024 2025`,
        `${query} competitive analysis`,
        `${query} opportunities threats`,
      ]
      for (const subQuery of subQueries) {
        if (enabledSources.includes("exa")) {
          searchPromises.push(searchExa(subQuery))
        }
      }
    }

    const results = await Promise.all(searchPromises)
    const allFindings = results.flat().filter((f) => f.content)

    // Sort by relevance
    allFindings.sort((a, b) => b.relevance - a.relevance)

    // Synthesize
    const summary = await synthesizeFindings(query, allFindings)

    // Update mission with results
    await sql`
      UPDATE research_missions 
      SET 
        status = 'completed',
        findings = ${JSON.stringify(allFindings)},
        summary = ${summary},
        raw_results = ${JSON.stringify({ sources: enabledSources, totalFindings: allFindings.length })},
        completed_at = NOW()
      WHERE id = ${id}
    `

    // Get updated mission
    const [updatedMission] = await sql`
      SELECT * FROM research_missions WHERE id = ${id}
    `

    return NextResponse.json({ mission: updatedMission })
  } catch (error) {
    console.error("Research mission failed:", error)

    await sql`
      UPDATE research_missions 
      SET status = 'failed' 
      WHERE id = ${id}
    `

    return NextResponse.json({ error: "Research mission failed" }, { status: 500 })
  }
}
