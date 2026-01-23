import { getFirecrawlClient } from "@/platform/firecrawl/service"
import type { SearchHit, RadarSource } from "./types"

const EXA_API_KEY = process.env.EXA_API_KEY
const HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export async function searchFirecrawl(query: string): Promise<SearchHit[]> {
  try {
    const client = getFirecrawlClient()
    const result = await client.search({
      query,
      limit: 20,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
      },
    })

    if (!result.success || !result.data) return []

    return result.data.map((r) => ({
      url: r.url,
      title: r.title || null,
      snippet: r.description || r.markdown?.slice(0, 300) || null,
      timestamp: new Date().toISOString(),
      source: "firecrawl",
    }))
  } catch (error) {
    console.error("[radar] Firecrawl search failed", error)
    return []
  }
}

export async function searchExa(query: string): Promise<SearchHit[]> {
  if (!EXA_API_KEY) return []
  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "x-api-key": EXA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        useAutoprompt: true,
        numResults: 20,
      }),
    })

    if (!res.ok) return []
    const data = await res.json()
    return (data.results || []).map((r: { url: string; title?: string; text?: string; publishedDate?: string }) => ({
      url: r.url,
      title: r.title || null,
      snippet: r.text?.slice(0, 300) || null,
      timestamp: r.publishedDate || new Date().toISOString(),
      source: "exa",
    }))
  } catch (error) {
    console.error("[radar] Exa search failed", error)
    return []
  }
}

export async function searchHackerNews(query: string): Promise<SearchHit[]> {
  const url = `${HN_SEARCH_URL}?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`
  const data = await fetchJson<{ hits: Array<{ url: string; title: string; created_at: string }> }>(url)
  if (!data?.hits) return []
  return data.hits
    .filter((h) => h.url)
    .map((h) => ({
      url: h.url,
      title: h.title || null,
      snippet: null,
      timestamp: h.created_at,
      source: "hackernews",
    }))
}

export async function searchReddit(query: string): Promise<SearchHit[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=20&sort=new`
  const data = await fetchJson<{ data?: { children: Array<{ data: { title: string; selftext: string; url: string; created_utc: number } }> } }>(url)
  if (!data?.data?.children) return []
  return data.data.children.map((child) => ({
    url: child.data.url,
    title: child.data.title || null,
    snippet: child.data.selftext?.slice(0, 280) || null,
    timestamp: new Date(child.data.created_utc * 1000).toISOString(),
    source: "reddit",
  }))
}

export async function searchTwitter(_query: string): Promise<SearchHit[]> {
  // Placeholder: require X API key; return empty if not configured
  const key = process.env.TWITTER_BEARER_TOKEN
  if (!key) {
    console.log("[radar] Twitter search skipped: TWITTER_BEARER_TOKEN not set")
    return []
  }
  // Minimal search via recent search endpoint
  try {
    const res = await fetch("https://api.x.com/2/tweets/search/recent", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: _query, max_results: 20, expansions: ["author_id"], "tweet.fields": ["created_at"] }),
    })
    if (!res.ok) return []
    const data = await res.json()
    const tweets = data.data || []
    return tweets.map((t: { id: string; text: string; created_at?: string }) => ({
      url: `https://x.com/i/web/status/${t.id}`,
      title: t.text?.slice(0, 120) || null,
      snippet: t.text || null,
      timestamp: t.created_at || new Date().toISOString(),
      source: "twitter",
    }))
  } catch (error) {
    console.error("[radar] Twitter search failed", error)
    return []
  }
}

export async function fetchBySource(source: RadarSource, query: string): Promise<SearchHit[]> {
  switch (source) {
    case "firecrawl":
      return searchFirecrawl(query)
    case "exa":
      return searchExa(query)
    case "hackernews":
      return searchHackerNews(query)
    case "reddit":
      return searchReddit(query)
    case "twitter":
      return searchTwitter(query)
    default:
      return []
  }
}
