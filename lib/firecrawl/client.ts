// Unified Firecrawl Client for DMG Intelligence Suite

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v1"

export type FirecrawlFormat = "markdown" | "html" | "rawHtml" | "links" | "screenshot" | "branding" | "extract"

export interface FirecrawlScrapeOptions {
  url: string
  formats?: FirecrawlFormat[]
  onlyMainContent?: boolean
  includeTags?: string[]
  excludeTags?: string[]
  waitFor?: number
  timeout?: number
  extract?: {
    schema?: Record<string, unknown>
    systemPrompt?: string
    prompt?: string
  }
}

export interface FirecrawlMapOptions {
  url: string
  search?: string
  ignoreSitemap?: boolean
  includeSubdomains?: boolean
  limit?: number
}

export interface FirecrawlCrawlOptions {
  url: string
  excludePaths?: string[]
  includePaths?: string[]
  maxDepth?: number
  limit?: number
  allowBackwardLinks?: boolean
  allowExternalLinks?: boolean
  scrapeOptions?: Omit<FirecrawlScrapeOptions, "url">
}

export interface FirecrawlResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

class FirecrawlClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured")
    }
    this.apiKey = FIRECRAWL_API_KEY
    this.baseUrl = FIRECRAWL_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<FirecrawlResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `API error: ${response.status}`,
        }
      }

      return {
        success: true,
        data: data.data || data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  // Scrape a single URL
  async scrape<T = unknown>(options: FirecrawlScrapeOptions): Promise<FirecrawlResponse<T>> {
    return this.request<T>("/scrape", {
      method: "POST",
      body: JSON.stringify(options),
    })
  }

  // Extract brand identity
  async extractBrand(url: string): Promise<
    FirecrawlResponse<{
      branding: Record<string, unknown>
      metadata?: Record<string, unknown>
      screenshot?: string
    }>
  > {
    return this.scrape({
      url,
      formats: ["branding", "screenshot"],
    })
  }

  // Extract structured data with schema
  async extract<T>(url: string, schema: Record<string, unknown>, prompt?: string): Promise<FirecrawlResponse<T>> {
    return this.scrape<T>({
      url,
      formats: ["extract"],
      extract: {
        schema,
        prompt,
      },
    })
  }

  // Map a website (get all URLs)
  async map(options: FirecrawlMapOptions): Promise<FirecrawlResponse<{ links: string[] }>> {
    return this.request("/map", {
      method: "POST",
      body: JSON.stringify(options),
    })
  }

  // Crawl a website (scrape multiple pages)
  async crawl(options: FirecrawlCrawlOptions): Promise<FirecrawlResponse<{ id: string }>> {
    return this.request("/crawl", {
      method: "POST",
      body: JSON.stringify(options),
    })
  }

  // Check crawl status
  async getCrawlStatus(crawlId: string): Promise<
    FirecrawlResponse<{
      status: "scraping" | "completed" | "failed"
      total: number
      completed: number
      data: unknown[]
    }>
  > {
    return this.request(`/crawl/${crawlId}`, {
      method: "GET",
    })
  }
}

// Singleton instance
let client: FirecrawlClient | null = null

export function getFirecrawlClient(): FirecrawlClient {
  if (!client) {
    client = new FirecrawlClient()
  }
  return client
}

// Utility functions
export function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1] : null
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, "")
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0]
  }
}

export function normalizeUrl(input: string): string {
  // Check if it's an email
  if (input.includes("@") && !input.includes("://")) {
    const domain = extractDomainFromEmail(input)
    if (domain) {
      return `https://${domain}`
    }
    throw new Error("Invalid email format")
  }

  // Check if it's a URL without protocol
  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return `https://${input}`
  }

  return input
}
