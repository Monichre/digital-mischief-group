// Unified Firecrawl Client for DMG Intelligence Suite
// Uses official @mendable/firecrawl-js SDK

import Firecrawl from '@mendable/firecrawl-js'
import { z } from 'zod'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

// Re-export types for convenience
export type FirecrawlFormat = "markdown" | "html" | "rawHtml" | "links" | "screenshot" | "branding" | "json"

export interface FirecrawlSearchResult {
  url: string
  title: string
  description: string
  markdown?: string
  html?: string
  metadata?: Record<string, unknown>
}

export interface FirecrawlResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Comprehensive Zod Schema for Brand Extraction using Firecrawl's Extract API
export const BrandSchema = z.object({
  // Site metadata
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),

  // Color system
  colorScheme: z.enum(['light', 'dark', 'auto']).optional(),
  colors: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    textPrimary: z.string().optional(),
    textSecondary: z.string().optional(),
    success: z.string().optional(),
    warning: z.string().optional(),
    error: z.string().optional(),
    info: z.string().optional(),
  }).catchall(z.string()).optional(),

  // Typography system
  typography: z.object({
    fontFamilies: z.object({
      primary: z.string().optional(),
      heading: z.string().optional(),
      monospace: z.string().optional(),
    }).catchall(z.string()).optional(),
    fontSizes: z.record(z.string(), z.string()).optional(),
    fontWeights: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    lineHeights: z.record(z.string(), z.string()).optional(),
  }).optional(),

  // Font families as array (for compatibility)
  fonts: z.array(z.object({
    family: z.string(),
    weights: z.array(z.union([z.string(), z.number()])).optional(),
    styles: z.array(z.string()).optional(),
    url: z.string().optional(),
  })).optional(),

  // Spacing system
  spacing: z.object({
    unit: z.string().optional(),
    scale: z.record(z.string(), z.string()).optional(),
  }).optional(),

  // Component library patterns
  components: z.object({
    buttons: z.record(z.string(), z.any()).optional(),
    inputs: z.record(z.string(), z.any()).optional(),
    cards: z.record(z.string(), z.any()).optional(),
    navigation: z.record(z.string(), z.any()).optional(),
  }).optional(),

  // Image assets
  images: z.object({
    logo: z.string().optional(),
    favicon: z.string().optional(),
    ogImage: z.string().optional(),
    heroImage: z.string().optional(),
    patterns: z.array(z.string()).optional(),
  }).optional(),

  // Animation patterns
  animations: z.object({
    transitions: z.record(z.string(), z.string()).optional(),
    durations: z.record(z.string(), z.string()).optional(),
    easings: z.record(z.string(), z.string()).optional(),
  }).optional(),

  // Layout patterns
  layout: z.object({
    maxWidth: z.string().optional(),
    breakpoints: z.record(z.string(), z.string()).optional(),
    grid: z.object({
      columns: z.number().optional(),
      gap: z.string().optional(),
    }).optional(),
  }).optional(),

  // Brand personality
  personality: z.object({
    tone: z.array(z.string()).optional(), // e.g., ['professional', 'friendly', 'technical']
    keywords: z.array(z.string()).optional(),
    messagingThemes: z.array(z.string()).optional(),
    targetAudience: z.string().optional(),
  }).optional(),

  // Screenshot (base64 or URL)
  screenshot: z.string().optional(),
})

export type BrandingProfile = z.infer<typeof BrandSchema>

// Legacy interface for backward compatibility
export interface BrandingProfileLegacy {
  colorScheme?: 'light' | 'dark' | string
  logo?: string | null
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    textPrimary?: string
    textSecondary?: string
    [key: string]: string | undefined
  }
  typography?: {
    fontFamilies?: {
      primary?: string
      heading?: string
      [key: string]: string | undefined
    }
    [key: string]: unknown
  }
  fonts?: Array<{ family: string; [key: string]: unknown }>
  spacing?: Record<string, unknown>
  components?: Record<string, unknown>
  images?: Record<string, unknown>
  animations?: Record<string, unknown>
  layout?: Record<string, unknown>
  personality?: Record<string, unknown>
}

class FirecrawlClient {
  private app: Firecrawl

  constructor() {
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY is not configured")
    }
    this.app = new Firecrawl({ apiKey: FIRECRAWL_API_KEY })
  }

  // Scrape a single URL
  async scrape<T = unknown>(options: {
    url: string
    formats?: FirecrawlFormat[]
    onlyMainContent?: boolean
    includeTags?: string[]
    excludeTags?: string[]
    waitFor?: number
    timeout?: number
  }): Promise<FirecrawlResponse<T>> {
    try {
      const result = await this.app.scrape(options.url, {
        formats: options.formats as any,
        onlyMainContent: options.onlyMainContent,
        includeTags: options.includeTags,
        excludeTags: options.excludeTags,
        waitFor: options.waitFor,
        timeout: options.timeout,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return { success: true, data: result as T }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Scrape failed",
      }
    }
  }

  // Extract brand identity using Firecrawl's modern extract endpoint
  async extractBrand(url: string): Promise<FirecrawlResponse<BrandingProfile>> {
    try {
      // Use Firecrawl's extract endpoint with comprehensive brand schema
      const result = await (this.app as any).extract({
        urls: [url],
        prompt: `Extract comprehensive brand identity and design system information from this website including:
- Site metadata (title, description)
- Color palette (primary, secondary, accent, background, text colors, semantic colors)
- Typography system (font families, sizes, weights, line heights)
- Spacing system and design tokens
- Component patterns (buttons, inputs, cards, navigation)
- Image assets (logo, favicon, og:image, hero images)
- Animation patterns (transitions, durations, easings)
- Layout patterns (max width, breakpoints, grid system)
- Brand personality (tone, keywords, messaging themes, target audience)
- Screenshot of the homepage

Focus on extracting the actual CSS values, design tokens, and visual patterns used on the site.`,
        schema: BrandSchema,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      // Extract data from response
      const extractedData = (result as any).data || result

      return {
        success: true,
        data: extractedData as BrandingProfile,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Brand extraction failed",
      }
    }
  }

  // Legacy brand extraction (fallback using scrape endpoint)
  async extractBrandLegacy(url: string): Promise<FirecrawlResponse<{
    branding?: BrandingProfileLegacy
    metadata?: Record<string, unknown>
    screenshot?: string
  }>> {
    try {
      const result = await this.app.scrape(url, {
        formats: ['branding', 'screenshot'] as any,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return {
        success: true,
        data: {
          branding: (result as any).branding,
          metadata: (result as any).metadata,
          screenshot: (result as any).screenshot,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Brand extraction failed",
      }
    }
  }

  // Extract structured data with JSON schema
  async extract<T>(
    url: string,
    schema: Record<string, unknown>,
    prompt?: string
  ): Promise<FirecrawlResponse<T>> {
    try {
      const result = await this.app.scrape(url, {
        formats: [{
          type: 'json',
          schema,
          prompt,
        }] as any,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return { success: true, data: (result as any).json as T }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Extraction failed",
      }
    }
  }

  // Search the web
  async search(options: {
    query: string
    limit?: number
    lang?: string
    country?: string
    scrapeOptions?: {
      formats?: FirecrawlFormat[]
      onlyMainContent?: boolean
    }
  }): Promise<FirecrawlResponse<FirecrawlSearchResult[]>> {
    try {
      const result = await this.app.search(options.query, {
        limit: options.limit || 5,
        scrapeOptions: options.scrapeOptions as any,
      } as any)

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      // Normalize search results
      const searchResults: FirecrawlSearchResult[] = []
      
      if (result.web) {
        for (const item of result.web) {
          searchResults.push({
            url: (item as any).url || '',
            title: (item as any).title || '',
            description: (item as any).description || (item as any).snippet || '',
            markdown: (item as any).markdown,
            metadata: (item as any).metadata,
          })
        }
      }

      return { success: true, data: searchResults }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
      }
    }
  }

  // Start an agent job (async)
  async startAgent(options: {
    url: string
    prompt: string
    schema?: Record<string, unknown>
    enableWebSearch?: boolean
  }): Promise<FirecrawlResponse<{ jobId: string }>> {
    try {
      const result = await this.app.startAgent({
        url: options.url,
        prompt: options.prompt,
        schema: options.schema,
        enableWebSearch: options.enableWebSearch,
      } as any)

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return { success: true, data: { jobId: (result as any).id || (result as any).jobId } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Agent start failed",
      }
    }
  }

  // Get agent job status
  async getAgentStatus(jobId: string): Promise<FirecrawlResponse<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    data?: unknown
    steps?: Array<{ action: string; result: unknown }>
  }>> {
    try {
      const result = await this.app.getAgentStatus(jobId)

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return {
        success: true,
        data: {
          status: (result as any).status,
          data: (result as any).data,
          steps: (result as any).steps,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Agent status check failed",
      }
    }
  }

  // Run agent and wait for completion (convenience method)
  async runAgent(options: {
    url: string
    prompt: string
    schema?: Record<string, unknown>
    enableWebSearch?: boolean
    maxWaitMs?: number
    pollIntervalMs?: number
  }): Promise<FirecrawlResponse<unknown>> {
    const startResult = await this.startAgent(options)
    if (!startResult.success || !startResult.data?.jobId) {
      return { success: false, error: startResult.error || 'Failed to start agent' }
    }

    const jobId = startResult.data.jobId
    const maxWait = options.maxWaitMs || 60000
    const pollInterval = options.pollIntervalMs || 2000
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      const statusResult = await this.getAgentStatus(jobId)
      
      if (!statusResult.success) {
        return { success: false, error: statusResult.error }
      }

      if (statusResult.data?.status === 'completed') {
        return { success: true, data: statusResult.data.data }
      }

      if (statusResult.data?.status === 'failed') {
        return { success: false, error: 'Agent job failed' }
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    return { success: false, error: 'Agent job timed out' }
  }

  // Map a website (get all URLs)
  async map(options: {
    url: string
    search?: string
    limit?: number
  }): Promise<FirecrawlResponse<{ links: string[] }>> {
    try {
      const result = await (this.app as any).mapUrl(options.url, {
        search: options.search,
        limit: options.limit,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return { success: true, data: { links: result.links || [] } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Map failed",
      }
    }
  }

  // Crawl a website (scrape multiple pages)
  async crawl(options: {
    url: string
    limit?: number
    maxDepth?: number
    excludePaths?: string[]
    includePaths?: string[]
  }): Promise<FirecrawlResponse<{ id: string }>> {
    try {
      const result = await (this.app as any).crawlUrl(options.url, {
        limit: options.limit,
        maxDepth: options.maxDepth,
        excludePaths: options.excludePaths,
        includePaths: options.includePaths,
      })

      if ('error' in result && result.error) {
        return { success: false, error: String(result.error) }
      }

      return { success: true, data: { id: result.id } }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Crawl failed",
      }
    }
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
  if (input.includes("@") && !input.includes("://")) {
    const domain = extractDomainFromEmail(input)
    if (domain) {
      return `https://${domain}`
    }
    throw new Error("Invalid email format")
  }

  if (!input.startsWith("http://") && !input.startsWith("https://")) {
    return `https://${input}`
  }

  return input
}
