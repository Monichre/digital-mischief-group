import { type NextRequest } from "next/server"
import { sql } from "@/platform/db/neon"
import { getFirecrawlClient } from "@/platform/firecrawl/service"
import { runSentinelAgent } from "@/ai/agents/sentinel.agent"
import type { Scout, ScoutResult } from "@/daedalus/scout/types"
import type { SentinelStreamEvent, SearchProgress } from "@/daedalus/scout/stream-types"

const SERPER_API_KEY = process.env.SERPER_API_KEY
const EXA_API_KEY = process.env.EXA_API_KEY

function formatSSE( event: SentinelStreamEvent ): string {
  return `data: ${JSON.stringify( { ...event, timestamp: Date.now() } )}\n\n`
}

async function searchSerper( query: string ) {
  if ( !SERPER_API_KEY ) return []
  const response = await fetch( "https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify( { q: query, num: 20 } ),
  } )
  if ( !response.ok ) return []
  const data = await response.json()
  return ( data.organic || [] ).map( ( r: any ) => ( {
    url: r.link,
    title: r.title,
    snippet: r.snippet,
    source: "serper",
  } ) )
}

async function searchExa( query: string ) {
  if ( !EXA_API_KEY ) return []
  const response = await fetch( "https://api.exa.ai/search", {
    method: "POST",
    headers: { "x-api-key": EXA_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify( { query, numResults: 20, useAutoprompt: true } ),
  } )
  if ( !response.ok ) return []
  const data = await response.json()
  return ( data.results || [] ).map( ( r: any ) => ( {
    url: r.url,
    title: r.title,
    snippet: r.text?.slice( 0, 300 ),
    source: "exa",
  } ) )
}

async function searchFirecrawl( query: string ) {
  try {
    const firecrawl = getFirecrawlClient()
    const result = await firecrawl.search( {
      query,
      limit: 20,
      scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
    } )
    if ( !result.success || !result.data ) return []
    return result.data.map( ( r ) => ( {
      url: r.url,
      title: r.title,
      snippet: r.description || r.markdown?.slice( 0, 300 ) || "",
      source: "firecrawl",
    } ) )
  } catch {
    return []
  }
}

export async function GET( request: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
  const { id } = await params
  const startTime = Date.now()

  const encoder = new TextEncoder()
  const stream = new ReadableStream( {
    async start( controller ) {
      const send = ( event: SentinelStreamEvent ) => {
        controller.enqueue( encoder.encode( formatSSE( event ) ) )
      }

      try {
        // Get scout
        const rows = await sql`SELECT * FROM scouts WHERE id = ${id}`
        const scout = rows[0] as Scout | undefined
        if ( !scout ) {
          send( { type: "error", data: { message: "Scout not found", phase: "init", recoverable: false } } )
          controller.close()
          return
        }

        // Create agent run record
        const [agentRun] = await sql`
          INSERT INTO sentinel_agent_runs (scout_id, status)
          VALUES (${id}, 'running')
          RETURNING id
        `
        const runId = agentRun.id

        // Phase 1: Search engines (parallel)
        const searchEngines = [
          { name: "serper" as const, fn: searchSerper },
          { name: "exa" as const, fn: searchExa },
          { name: "firecrawl" as const, fn: searchFirecrawl },
        ]

        const searchResults: any[] = []
        const searchStartTime = Date.now()

        for ( const engine of searchEngines ) {
          send( {
            type: "search_start",
            data: { engine: engine.name, query: scout.search_query },
          } )
        }

        // Run searches in parallel
        const results = await Promise.all(
          searchEngines.map( async ( engine ) => {
            const engineStart = Date.now()
            try {
              const results = await engine.fn( scout.search_query )
              const duration = Date.now() - engineStart

              send( {
                type: "search_complete",
                data: {
                  engine: engine.name,
                  total: results.length,
                  newResults: results.length,
                  duration_ms: duration,
                },
              } )

              return results
            } catch ( error ) {
              send( {
                type: "error",
                data: {
                  message: `${engine.name} search failed: ${error instanceof Error ? error.message : "Unknown"}`,
                  phase: `search_${engine.name}`,
                  recoverable: true,
                },
              } )
              return []
            }
          } )
        )

        // Combine results
        results.forEach( ( r ) => searchResults.push( ...r ) )

        // Deduplicate
        const seenUrls = new Set( scout.seen_urls || [] )
        const beforeDedup = searchResults.length
        const newResults = searchResults.filter( ( r: any ) => !seenUrls.has( r.url ) )
        const afterDedup = newResults.length

        send( {
          type: "deduplication",
          data: {
            before: beforeDedup,
            after: afterDedup,
            duplicates_removed: beforeDedup - afterDedup,
          },
        } )

        if ( newResults.length === 0 ) {
          send( {
            type: "complete",
            data: {
              success: true,
              new_results: 0,
              total_searched: searchResults.length,
              insights: [],
              competitive_intel: [],
              trends: [],
              duration_ms: Date.now() - startTime,
              run_id: runId,
            },
          } )

          await sql`
            UPDATE sentinel_agent_runs
            SET status = 'completed',
                search_results_count = ${searchResults.length},
                new_results_count = 0,
                completed_at = NOW()
            WHERE id = ${runId}
          `

          controller.close()
          return
        }

        // Store new results
        for ( const result of newResults ) {
          await sql`
            INSERT INTO scout_results (scout_id, url, title, snippet, source, metadata)
            VALUES (${id}, ${result.url}, ${result.title}, ${result.snippet}, ${result.source}, ${JSON.stringify( result )})
          `
        }

        // Update scout
        const newSeenUrls = [...seenUrls, ...newResults.map( ( r: any ) => r.url )]
        await sql`
          UPDATE scouts
          SET seen_urls = ${newSeenUrls}, last_run_at = NOW(), updated_at = NOW()
          WHERE id = ${id}
        `

        send( {
          type: "storage_complete",
          data: { stored: newResults.length, insights_saved: 0 },
        } )

        // Phase 2: AI Analysis
        send( {
          type: "ai_analysis_start",
          data: {
            total_results: newResults.length,
            phases: ["extraction", "competitive", "trends", "scoring", "synthesis"],
          },
        } )

        const aiStartTime = Date.now()

        // Convert to ScoutResult format
        const scoutResults: ScoutResult[] = newResults.map( ( r ) => ( {
          id: crypto.randomUUID(),
          scout_id: id,
          url: r.url,
          title: r.title,
          snippet: r.snippet,
          source: r.source,
          first_seen_at: new Date().toISOString(),
          metadata: r,
        } ) )

        // Run AI agent with streaming
        const analysis = await runSentinelAgent( scoutResults, scout, {
          onThought: ( thought ) => {
            send( { type: "ai_thought", data: thought } )
          },
          onInsight: ( insight ) => {
            send( { type: "insight_generated", data: insight } )
          },
          onCompetitiveIntel: ( intel ) => {
            send( { type: "competitive_intel", data: intel } )
          },
          onTrend: ( trend ) => {
            send( { type: "trend_detected", data: trend } )
          },
        } )

        const aiDuration = Date.now() - aiStartTime

        // Store insights
        let insightsSaved = 0
        for ( const insight of analysis.insights ) {
          await sql`
            INSERT INTO sentinel_insights (
              scout_id, run_id, insight_type, title, description,
              confidence_score, actionable, priority, metadata
            ) VALUES (
              ${id}, ${runId}, ${insight.type}, ${insight.title}, ${insight.description},
              ${insight.confidence}, ${insight.actionable}, ${insight.priority}, ${JSON.stringify( insight.metadata || {} )}
            )
          `
          insightsSaved++
        }

        // Store competitive intel
        for ( const intel of analysis.competitive_intel ) {
          await sql`
            INSERT INTO competitive_intel (
              scout_id, run_id, competitor_name, action_type, summary, impact, url, metadata
            ) VALUES (
              ${id}, ${runId}, ${intel.competitor_name}, ${intel.action_type},
              ${intel.summary}, ${intel.impact}, ${intel.url}, ${JSON.stringify( {} )}
            )
          `
        }

        // Store trends
        for ( const trend of analysis.trends ) {
          await sql`
            INSERT INTO sentinel_trends (
              scout_id, run_id, trend_name, strength, evidence, emerging, metadata
            ) VALUES (
              ${id}, ${runId}, ${trend.trend_name}, ${trend.strength},
              ${JSON.stringify( trend.evidence )}, ${trend.emerging}, ${JSON.stringify( {} )}
            )
          `
        }

        // Update agent run
        await sql`
          UPDATE sentinel_agent_runs
          SET status = 'completed',
              search_results_count = ${searchResults.length},
              new_results_count = ${newResults.length},
              analysis_duration_ms = ${aiDuration},
              thoughts = ${JSON.stringify( analysis.thoughts )},
              insights_generated = ${insightsSaved},
              completed_at = NOW()
          WHERE id = ${runId}
        `

        // Send complete event
        send( {
          type: "complete",
          data: {
            success: true,
            new_results: newResults.length,
            total_searched: searchResults.length,
            insights: analysis.insights,
            competitive_intel: analysis.competitive_intel,
            trends: analysis.trends,
            duration_ms: Date.now() - startTime,
            run_id: runId,
          },
        } )
      } catch ( error ) {
        send( {
          type: "error",
          data: {
            message: error instanceof Error ? error.message : "Unknown error",
            phase: "unknown",
            recoverable: false,
          },
        } )
      } finally {
        controller.close()
      }
    },
  } )

  return new Response( stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  } )
}
