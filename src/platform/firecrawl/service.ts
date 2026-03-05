import Firecrawl from '@mendable/firecrawl-js'
import { z } from 'zod'
import { recordFirecrawlRequest } from '@/platform/monitoring'

export type FirecrawlFormat =
  | 'markdown'
  | 'html'
  | 'rawHtml'
  | 'links'
  | 'screenshot'
  | 'branding'
  | 'json'
  | { type: 'json'; schema?: Record<string, unknown>; prompt?: string }
  | { type: 'screenshot'; fullPage?: boolean; quality?: number; viewport?: { width: number; height: number } }

export interface FirecrawlSearchResult {
  url: string
  title: string
  description: string
  markdown?: string
  html?: string
  metadata?: Record<string, unknown>
}

export type FirecrawlErrorCode =
  | 'api_error'
  | 'rate_limited'
  | 'empty_response'
  | 'timeout'
  | 'missing_api_key'
  | 'unknown'

export interface FirecrawlErrorDetails {
  code: FirecrawlErrorCode
  message: string
  url: string
  attempt: number
  status?: number
}

export interface FirecrawlResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  errorDetails?: FirecrawlErrorDetails
  creditsUsed?: number
  expiresAt?: string
  meta?: {
    attempts: number
    fallbackUrls: string[]
    finalUrl?: string
    durationMs: number
  }
}

export const BrandSchema = z.object({
  colorScheme: z.enum(['light', 'dark']).optional(),
  logo: z.string().optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      textPrimary: z.string().optional(),
      textSecondary: z.string().optional(),
      link: z.string().optional(),
      success: z.string().optional(),
      warning: z.string().optional(),
      error: z.string().optional(),
      info: z.string().optional(),
    })
    .catchall(z.string())
    .optional(),
  fonts: z
    .array(
      z.object({
        family: z.string(),
        weights: z.array(z.union([z.string(), z.number()])).optional(),
        styles: z.array(z.string()).optional(),
        url: z.string().optional(),
      })
    )
    .optional(),
  typography: z
    .object({
      fontFamilies: z
        .object({
          primary: z.string().optional(),
          heading: z.string().optional(),
          code: z.string().optional(),
          monospace: z.string().optional(),
        })
        .catchall(z.string())
        .optional(),
      fontSizes: z.record(z.string(), z.string()).optional(),
      fontWeights: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
      lineHeights: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  spacing: z
    .object({
      baseUnit: z.number().optional(),
      borderRadius: z.string().optional(),
      padding: z.record(z.string(), z.string()).optional(),
      margins: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  components: z
    .object({
      buttonPrimary: z.record(z.string(), z.any()).optional(),
      buttonSecondary: z.record(z.string(), z.any()).optional(),
      input: z.record(z.string(), z.any()).optional(),
      cards: z.record(z.string(), z.any()).optional(),
      navigation: z.record(z.string(), z.any()).optional(),
    })
    .catchall(z.record(z.string(), z.any()))
    .optional(),
  icons: z.record(z.string(), z.any()).optional(),
  images: z
    .object({
      logo: z.string().optional(),
      favicon: z.string().optional(),
      ogImage: z.string().optional(),
      heroImage: z.string().optional(),
      patterns: z.array(z.string()).optional(),
    })
    .catchall(z.any())
    .optional(),
  animations: z.record(z.string(), z.any()).optional(),
  layout: z.record(z.string(), z.any()).optional(),
  personality: z.record(z.string(), z.any()).optional(),
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),
  screenshot: z.string().optional(),
})

export type BrandingProfile = z.infer<typeof BrandSchema>

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

type FirecrawlLogger = Pick<Console, 'info' | 'warn' | 'error'>

type FirecrawlScrapePayload = {
  markdown?: string
  html?: string
  rawHtml?: string
  links?: string[]
  screenshot?: string
  branding?: Record<string, unknown>
  data?: {
    branding?: Record<string, unknown>
    screenshot?: string
    metadata?: Record<string, unknown>
  }
  json?: Record<string, unknown>
  metadata?: Record<string, unknown>
} & Record<string, unknown>

type FirecrawlSdk = {
  scrape: (url: string, options: Record<string, unknown>) => Promise<unknown>
  search: (query: string, options: Record<string, unknown>) => Promise<unknown>
  startAgent: (options: Record<string, unknown>) => Promise<unknown>
  getAgentStatus: (jobId: string) => Promise<unknown>
  agent?: (options: Record<string, unknown>) => Promise<unknown>
  createBrowserSession?: (options: Record<string, unknown>) => Promise<unknown>
  executeBrowserCode?: (sessionId: string, options: Record<string, unknown>) => Promise<unknown>
  listBrowserSessions?: (options?: Record<string, unknown>) => Promise<unknown>
  closeBrowserSession?: (sessionId: string) => Promise<unknown>
  mapUrl?: (url: string, options: Record<string, unknown>) => Promise<unknown>
  crawlUrl?: (url: string, options: Record<string, unknown>) => Promise<unknown>
}

type FirecrawlErrorResult = {
  error?: unknown
  status?: number
  statusCode?: number
}

type FirecrawlSearchApiItem = {
  url?: string
  title?: string
  description?: string
  snippet?: string
  markdown?: string
  metadata?: Record<string, unknown>
}

type FirecrawlSearchApiResult = {
  web?: FirecrawlSearchApiItem[]
  data?: {
    web?: FirecrawlSearchApiItem[]
  }
}

type FirecrawlAgentStartResult = {
  id?: string
  jobId?: string
  creditsUsed?: number
  expiresAt?: string
  data?: {
    id?: string
    jobId?: string
    creditsUsed?: number
    expiresAt?: string
  }
  error?: unknown
}

type FirecrawlAgentStatusResult = {
  status?: 'pending' | 'processing' | 'completed' | 'failed'
  data?: unknown
  steps?: Array<{ action: string; result: unknown }>
  creditsUsed?: number
  expiresAt?: string
  error?: unknown
}

export type FirecrawlBrowserLanguage = 'node' | 'bash'

export interface FirecrawlBrowserProfile {
  name: string
  saveChanges?: boolean
}

export interface FirecrawlBrowserSession {
  id: string
  status?: string
  cdpUrl?: string
  liveViewUrl?: string
  interactiveLiveViewUrl?: string
}

type FirecrawlBrowserCreateResult = {
  id?: string
  cdpUrl?: string
  liveViewUrl?: string
  interactiveLiveViewUrl?: string
  error?: unknown
  data?: {
    id?: string
    cdpUrl?: string
    liveViewUrl?: string
    interactiveLiveViewUrl?: string
  }
}

type FirecrawlBrowserExecuteResult = {
  result?: unknown
  error?: unknown
  data?: {
    result?: unknown
  }
}

type FirecrawlBrowserListResult = {
  sessions?: unknown[]
  data?: {
    sessions?: unknown[]
  }
  error?: unknown
}

type FirecrawlBrowserCloseResult = {
  id?: string
  error?: unknown
  data?: {
    id?: string
  }
}

export interface FirecrawlAgentOptions {
  prompt: string
  url?: string
  urls?: string[]
  schema?: Record<string, unknown>
  model?: string
  maxCredits?: number
  enableWebSearch?: boolean
}

export interface FirecrawlAgentRunOptions extends FirecrawlAgentOptions {
  maxWaitMs?: number
  pollIntervalMs?: number
}

type FirecrawlMapResult = {
  links?: string[]
  error?: unknown
}

type FirecrawlCrawlResult = {
  id?: string
  error?: unknown
}

const DEFAULT_MAX_RETRIES = Number(process.env.FIRECRAWL_MAX_RETRIES ?? 2)
const DEFAULT_BACKOFF_MS = Number(process.env.FIRECRAWL_BACKOFF_MS ?? 500)
const DEFAULT_MAX_CONCURRENT = Number(process.env.FIRECRAWL_MAX_CONCURRENT ?? 4)
const DEFAULT_MIN_DELAY_MS = Number(process.env.FIRECRAWL_MIN_DELAY_MS ?? 0)

const FALLBACK_PATHS = ['/about', '/team', '/company']

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isEmptyObject(value: unknown): boolean {
  return !!value && typeof value === 'object' && Object.keys(value as object).length === 0
}

function extractScrapePayload(result: unknown): FirecrawlScrapePayload {
  if (!result || typeof result !== 'object') return {}
  const data = (result as { data?: FirecrawlScrapePayload }).data
  return data ?? (result as FirecrawlScrapePayload)
}

function isEmptyScrapePayload(payload: FirecrawlScrapePayload, formats?: FirecrawlFormat[]): boolean {
  const checks: Array<() => boolean> = []

  const hasText = (value?: string) => typeof value === 'string' && value.trim().length > 0
  const hasArray = (value?: unknown[]) => Array.isArray(value) && value.length > 0

  if (!formats || formats.length === 0) {
    checks.push(
      () => hasText(payload.markdown),
      () => hasText(payload.html),
      () => hasText(payload.rawHtml),
      () => hasArray(payload.links),
      () => hasText(payload.screenshot),
      () => !isEmptyObject(payload.branding),
      () => !isEmptyObject(payload.json),
    )
  } else {
    for (const format of formats) {
      if (format === 'markdown') checks.push(() => hasText(payload.markdown))
      if (format === 'html') checks.push(() => hasText(payload.html))
      if (format === 'rawHtml') checks.push(() => hasText(payload.rawHtml))
      if (format === 'links') checks.push(() => hasArray(payload.links))
      if (format === 'screenshot') checks.push(() => hasText(payload.screenshot))
      if (format === 'branding') checks.push(() => !isEmptyObject(payload.branding))
      if (format === 'json') checks.push(() => !isEmptyObject(payload.json))
      if (typeof format === 'object' && format) {
        if (format.type === 'json') checks.push(() => !isEmptyObject(payload.json))
        if (format.type === 'screenshot') checks.push(() => hasText(payload.screenshot))
      }
    }
  }

  return !checks.some((check) => check())
}

function buildFallbackUrls(url: string): string[] {
  try {
    const parsed = new URL(url)
    const origin = parsed.origin
    const urls = [url, ...FALLBACK_PATHS.map((path) => `${origin}${path}`)]
    return Array.from(new Set(urls))
  } catch {
    return [url]
  }
}

function resolveErrorCode(error: unknown): FirecrawlErrorCode {
  if (error instanceof FirecrawlRequestError) return error.details.code
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  if (message.includes('rate limit') || message.includes('429')) return 'rate_limited'
  if (message.includes('timeout')) return 'timeout'
  if (message.includes('api key')) return 'missing_api_key'
  return 'unknown'
}

function resolveStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const status = (error as FirecrawlErrorResult).status
  const statusCode = (error as FirecrawlErrorResult).statusCode
  return typeof status === 'number' ? status : typeof statusCode === 'number' ? statusCode : undefined
}

function extractErrorMessage(result: unknown): string | undefined {
  if (!result || typeof result !== 'object') return undefined
  const errorValue = (result as FirecrawlErrorResult).error
  if (!errorValue) return undefined
  if (typeof errorValue === 'string') return errorValue
  try {
    return JSON.stringify(errorValue)
  } catch {
    return String(errorValue)
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

function responseLayers(result: unknown): Record<string, unknown>[] {
  const layers: Record<string, unknown>[] = []
  const root = asRecord(result)
  if (!root) return layers

  layers.push(root)
  const data = asRecord(root.data)
  if (data) {
    layers.push(data)
    const nestedData = asRecord(data.data)
    if (nestedData) layers.push(nestedData)
  }

  return layers
}

function getStringFromLayers(result: unknown, key: string): string | undefined {
  for (const layer of responseLayers(result)) {
    const value = asString(layer[key])
    if (value) return value
  }
  return undefined
}

function getNumberFromLayers(result: unknown, key: string): number | undefined {
  for (const layer of responseLayers(result)) {
    const value = asNumber(layer[key])
    if (value !== undefined) return value
  }
  return undefined
}

function getUnknownFromLayers(result: unknown, key: string): unknown {
  for (const layer of responseLayers(result)) {
    if (Object.prototype.hasOwnProperty.call(layer, key)) {
      return layer[key]
    }
  }
  return undefined
}

function getArrayFromLayers(result: unknown, key: string): unknown[] | undefined {
  for (const layer of responseLayers(result)) {
    const value = layer[key]
    if (Array.isArray(value)) return value
  }
  return undefined
}

function extractErrorMessageFromLayers(result: unknown): string | undefined {
  for (const layer of responseLayers(result)) {
    if (!Object.prototype.hasOwnProperty.call(layer, 'error')) continue
    const value = layer.error
    if (!value) continue
    if (typeof value === 'string') return value
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return undefined
}

class FirecrawlRequestError extends Error {
  details: FirecrawlErrorDetails

  constructor(details: FirecrawlErrorDetails) {
    super(details.message)
    this.details = details
  }
}

class FirecrawlRateLimiter {
  private active = 0
  private queue: Array<() => void> = []
  private lastRequestAt = 0

  constructor(private maxConcurrent: number, private minDelayMs: number) {}

  async schedule<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire()
    try {
      const waitMs = Math.max(0, this.minDelayMs - (Date.now() - this.lastRequestAt))
      if (waitMs > 0) await sleep(waitMs)
      const result = await task()
      this.lastRequestAt = Date.now()
      return result
    } finally {
      this.release()
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.maxConcurrent) {
      this.active += 1
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.queue.push(() => {
        this.active += 1
        resolve()
      })
    })
  }

  private release() {
    this.active = Math.max(0, this.active - 1)
    const next = this.queue.shift()
    if (next) next()
  }
}

export interface FirecrawlServiceOptions {
  app?: FirecrawlSdk
  apiKey?: string
  apiUrl?: string
  logger?: FirecrawlLogger
  maxRetries?: number
  backoffMs?: number
  maxConcurrent?: number
  minDelayMs?: number
}

export class FirecrawlService {
  private app: FirecrawlSdk
  private logger: FirecrawlLogger
  private limiter: FirecrawlRateLimiter
  private maxRetries: number
  private backoffMs: number
  private apiKey?: string
  private apiUrl: string

  constructor(options: FirecrawlServiceOptions = {}) {
    const apiKey = options.apiKey ?? process.env.FIRECRAWL_API_KEY
    const apiUrl = (options.apiUrl ?? process.env.FIRECRAWL_API_URL ?? 'https://api.firecrawl.dev').replace(/\/$/, '')

    if (options.app) {
      this.app = options.app
    } else {
      if (!apiKey) {
        throw new Error('FIRECRAWL_API_KEY is not configured')
      }
      this.app = new Firecrawl({ apiKey }) as unknown as FirecrawlSdk
    }

    this.logger = options.logger ?? console
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
    this.backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS
    this.apiKey = apiKey
    this.apiUrl = apiUrl
    this.limiter = new FirecrawlRateLimiter(
      options.maxConcurrent ?? DEFAULT_MAX_CONCURRENT,
      options.minDelayMs ?? DEFAULT_MIN_DELAY_MS,
    )
  }

  async scrape<T = FirecrawlScrapePayload>(options: {
    url: string
    formats?: FirecrawlFormat[]
    onlyMainContent?: boolean
    includeTags?: string[]
    excludeTags?: string[]
    waitFor?: number
    timeout?: number
    useFallbacks?: boolean
    retries?: number
    backoffMs?: number
  }): Promise<FirecrawlResponse<T>> {
    const { url, useFallbacks = true, retries, backoffMs, ...scrapeOptions } = options
    return this.scrapeWithFallback<T>({
      url,
      scrapeOptions,
      useFallbacks,
      retries,
      backoffMs,
    })
  }

  async extractBrand(
    url: string,
    options: { useFallbacks?: boolean; retries?: number; backoffMs?: number } = {},
  ): Promise<FirecrawlResponse<BrandingProfile>> {
    const scrapeResult = await this.scrapeWithFallback<FirecrawlScrapePayload>({
      url,
      scrapeOptions: { formats: ['branding', 'screenshot'] },
      useFallbacks: options.useFallbacks ?? true,
      retries: options.retries,
      backoffMs: options.backoffMs,
    })

    if (!scrapeResult.success || !scrapeResult.data) {
      return {
        success: false,
        error: scrapeResult.error || 'Brand extraction failed',
        errorDetails: scrapeResult.errorDetails,
        meta: scrapeResult.meta,
      }
    }

    const payload = scrapeResult.data
    const brandingData = (payload.branding ?? payload.data?.branding) as BrandingProfileLegacy | undefined
    const metadata = payload.metadata ?? payload.data?.metadata ?? {}

    if (!brandingData || isEmptyObject(brandingData)) {
      return {
        success: false,
        error: 'Brand extraction returned empty branding data',
        errorDetails: {
          code: 'empty_response',
          message: 'Brand extraction returned empty branding data',
          url,
          attempt: scrapeResult.meta?.attempts || 1,
        },
        meta: scrapeResult.meta,
      }
    }

    const colorScheme = brandingData?.colorScheme
    const normalizedColorScheme =
      colorScheme === 'light' || colorScheme === 'dark' ? colorScheme : undefined

    const brandingProfile: BrandingProfile = {
      siteTitle: asString((metadata as Record<string, unknown>).title) ||
        asString((metadata as Record<string, unknown>).ogTitle),
      siteDescription: asString((metadata as Record<string, unknown>).description) ||
        asString((metadata as Record<string, unknown>).ogDescription),
      colorScheme: normalizedColorScheme,
      colors: brandingData?.colors as BrandingProfile['colors'],
      typography: brandingData?.typography as BrandingProfile['typography'],
      fonts: brandingData?.fonts as BrandingProfile['fonts'],
      spacing: brandingData?.spacing as BrandingProfile['spacing'],
      components: brandingData?.components as BrandingProfile['components'],
      images: {
        logo: brandingData?.logo ?? undefined,
        favicon: asString((metadata as Record<string, unknown>).favicon),
        ogImage: asString((metadata as Record<string, unknown>).ogImage),
        ...(brandingData?.images ?? {}),
      },
      animations: brandingData?.animations as BrandingProfile['animations'],
      layout: brandingData?.layout as BrandingProfile['layout'],
      personality: brandingData?.personality as BrandingProfile['personality'],
      screenshot: payload.screenshot ?? payload.data?.screenshot,
    }

    return { success: true, data: brandingProfile, meta: scrapeResult.meta }
  }

  async extractBrandLegacy(
    url: string,
    options: { useFallbacks?: boolean; retries?: number; backoffMs?: number } = {},
  ): Promise<
    FirecrawlResponse<{
      branding?: BrandingProfileLegacy
      metadata?: Record<string, unknown>
      screenshot?: string
    }>
  > {
    const scrapeResult = await this.scrapeWithFallback<FirecrawlScrapePayload>({
      url,
      scrapeOptions: { formats: ['branding', 'screenshot'] },
      useFallbacks: options.useFallbacks ?? true,
      retries: options.retries,
      backoffMs: options.backoffMs,
    })

    if (!scrapeResult.success || !scrapeResult.data) {
      return {
        success: false,
        error: scrapeResult.error || 'Brand extraction failed',
        errorDetails: scrapeResult.errorDetails,
        meta: scrapeResult.meta,
      }
    }

    return {
      success: true,
      data: {
        branding: (scrapeResult.data.branding ?? scrapeResult.data.data?.branding) as BrandingProfileLegacy,
        metadata: scrapeResult.data.metadata ?? scrapeResult.data.data?.metadata,
        screenshot: scrapeResult.data.screenshot ?? scrapeResult.data.data?.screenshot,
      },
      meta: scrapeResult.meta,
    }
  }

  async extract<T>(
    url: string,
    schema: Record<string, unknown>,
    prompt?: string,
    options: { useFallbacks?: boolean; retries?: number; backoffMs?: number } = {},
  ): Promise<FirecrawlResponse<T>> {
    const scrapeResult = await this.scrapeWithFallback<FirecrawlScrapePayload>({
      url,
      scrapeOptions: {
        formats: [
          {
            type: 'json',
            schema,
            prompt,
          },
        ],
      },
      useFallbacks: options.useFallbacks ?? true,
      retries: options.retries,
      backoffMs: options.backoffMs,
    })

    if (!scrapeResult.success || !scrapeResult.data) {
      return {
        success: false,
        error: scrapeResult.error || 'Extraction failed',
        errorDetails: scrapeResult.errorDetails,
        meta: scrapeResult.meta,
      }
    }

    const extractedData = scrapeResult.data.json as T
    if (!extractedData || isEmptyObject(extractedData)) {
      return {
        success: false,
        error: 'Extraction returned empty data',
        errorDetails: {
          code: 'empty_response',
          message: 'Extraction returned empty data',
          url,
          attempt: scrapeResult.meta?.attempts || 1,
        },
        meta: scrapeResult.meta,
      }
    }

    return { success: true, data: extractedData, meta: scrapeResult.meta }
  }

  async search(options: {
    query: string
    limit?: number
    lang?: string
    country?: string
    scrapeOptions?: {
      formats?: FirecrawlFormat[]
      onlyMainContent?: boolean
    }
    retries?: number
    backoffMs?: number
  }): Promise<FirecrawlResponse<FirecrawlSearchResult[]>> {
    const { query, retries, backoffMs, ...searchOptions } = options
    const startTime = Date.now()
    let attempt = 0
    let lastError: FirecrawlErrorDetails | undefined
    const maxRetries = retries ?? this.maxRetries
    const delayMs = backoffMs ?? this.backoffMs

    for (let retry = 0; retry <= maxRetries; retry++) {
      attempt += 1
      try {
        const result = await this.limiter.schedule(() =>
          this.app.search(query, {
            limit: searchOptions.limit || 5,
            scrapeOptions: searchOptions.scrapeOptions as Record<string, unknown>,
          })
        )

        const errorMessage = extractErrorMessage(result)
        if (errorMessage) {
          throw new FirecrawlRequestError({
            code: 'api_error',
            message: errorMessage,
            url: query,
            attempt,
            status: resolveStatus(result),
          })
        }

        const payload = result as FirecrawlSearchApiResult
        const webResults = payload.web ?? payload.data?.web ?? []

        const searchResults: FirecrawlSearchResult[] = webResults.map((item) => ({
          url: item.url || '',
          title: item.title || '',
          description: item.description || item.snippet || '',
          markdown: item.markdown,
          metadata: item.metadata,
        }))

        return {
          success: true,
          data: searchResults,
          meta: { attempts: attempt, fallbackUrls: [], durationMs: Date.now() - startTime },
        }
      } catch (error) {
        const details =
          error instanceof FirecrawlRequestError
            ? error.details
            : {
                code: resolveErrorCode(error),
                message: error instanceof Error ? error.message : 'Search failed',
                url: query,
                attempt,
                status: resolveStatus(error),
              }
        lastError = details
        this.logger.warn('[Firecrawl] search failed', details)
        if (retry < maxRetries) {
          await sleep(delayMs * 2 ** retry)
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Search failed',
      errorDetails: lastError,
      meta: { attempts: attempt, fallbackUrls: [], durationMs: Date.now() - startTime },
    }
  }

  async startAgent(options: FirecrawlAgentOptions): Promise<
    FirecrawlResponse<{ jobId: string; creditsUsed?: number; expiresAt?: string }>
  > {
    try {
      const urls = options.urls && options.urls.length > 0
        ? options.urls
        : options.url
          ? [options.url]
          : undefined

      const payload: Record<string, unknown> = {
        prompt: options.prompt,
        schema: options.schema,
        enableWebSearch: options.enableWebSearch,
        model: options.model,
        maxCredits: options.maxCredits,
      }

      // Preserve compatibility with older Firecrawl agent payloads.
      if (options.url) payload.url = options.url
      if (urls?.length) payload.urls = urls

      const result = await this.limiter.schedule(() => this.app.startAgent(payload))

      const payloadResult = result as FirecrawlAgentStartResult
      const errorMessage = extractErrorMessage(payloadResult) || extractErrorMessageFromLayers(payloadResult)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      const jobId = getStringFromLayers(payloadResult, 'id') || getStringFromLayers(payloadResult, 'jobId')
      if (!jobId) {
        return { success: false, error: 'Agent start failed' }
      }

      const creditsUsed = getNumberFromLayers(payloadResult, 'creditsUsed')
      const expiresAt = getStringFromLayers(payloadResult, 'expiresAt')

      return {
        success: true,
        data: { jobId, creditsUsed, expiresAt },
        creditsUsed,
        expiresAt,
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Agent start failed' }
    }
  }

  async getAgentStatus(jobId: string): Promise<
    FirecrawlResponse<{
      status: 'pending' | 'processing' | 'completed' | 'failed'
      data?: unknown
      steps?: Array<{ action: string; result: unknown }>
      creditsUsed?: number
      expiresAt?: string
    }>
  > {
    try {
      const result = await this.limiter.schedule(() => this.app.getAgentStatus(jobId))

      const payload = result as FirecrawlAgentStatusResult
      const errorMessage = extractErrorMessage(payload) || extractErrorMessageFromLayers(payload)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      const status = getStringFromLayers(payload, 'status') as
        | 'pending'
        | 'processing'
        | 'completed'
        | 'failed'
        | undefined

      if (!status) {
        return { success: false, error: 'Agent status missing' }
      }

      const creditsUsed = getNumberFromLayers(payload, 'creditsUsed')
      const expiresAt = getStringFromLayers(payload, 'expiresAt')

      return {
        success: true,
        data: {
          status,
          data: getUnknownFromLayers(payload, 'data'),
          steps: getUnknownFromLayers(payload, 'steps') as Array<{ action: string; result: unknown }> | undefined,
          creditsUsed,
          expiresAt,
        },
        creditsUsed,
        expiresAt,
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Agent status check failed' }
    }
  }

  async runAgent(options: FirecrawlAgentRunOptions): Promise<FirecrawlResponse<unknown>> {
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
        return {
          success: true,
          data: statusResult.data.data,
          creditsUsed: statusResult.data.creditsUsed,
          expiresAt: statusResult.data.expiresAt,
        }
      }

      if (statusResult.data?.status === 'failed') {
        return {
          success: false,
          error: 'Agent job failed',
          creditsUsed: statusResult.data.creditsUsed,
          expiresAt: statusResult.data.expiresAt,
        }
      }

      await sleep(pollInterval)
    }

    return {
      success: false,
      error: 'Agent job timed out',
      creditsUsed: startResult.creditsUsed,
      expiresAt: startResult.expiresAt,
    }
  }

  async agent(
    options: FirecrawlAgentOptions & {
      pollIntervalMs?: number
      timeoutMs?: number
      maxWaitMs?: number
    },
  ): Promise<FirecrawlResponse<unknown>> {
    if (this.app.agent) {
      try {
        const urls = options.urls && options.urls.length > 0
          ? options.urls
          : options.url
            ? [options.url]
            : undefined

        const payload: Record<string, unknown> = {
          prompt: options.prompt,
          urls,
          schema: options.schema,
          model: options.model,
          maxCredits: options.maxCredits,
          pollInterval: options.pollIntervalMs ? Math.max(1, Math.round(options.pollIntervalMs / 1000)) : undefined,
          timeout: options.timeoutMs
            ? Math.max(1, Math.round(options.timeoutMs / 1000))
            : options.maxWaitMs
              ? Math.max(1, Math.round(options.maxWaitMs / 1000))
              : undefined,
        }

        const result = await this.limiter.schedule(() => this.app.agent!(payload))
        const errorMessage = extractErrorMessageFromLayers(result) || extractErrorMessage(result)
        if (errorMessage) {
          return { success: false, error: errorMessage }
        }

        const status = getStringFromLayers(result, 'status')
        if (status === 'failed') {
          return {
            success: false,
            error: 'Agent job failed',
            creditsUsed: getNumberFromLayers(result, 'creditsUsed'),
            expiresAt: getStringFromLayers(result, 'expiresAt'),
          }
        }

        return {
          success: true,
          data: getUnknownFromLayers(result, 'data'),
          creditsUsed: getNumberFromLayers(result, 'creditsUsed'),
          expiresAt: getStringFromLayers(result, 'expiresAt'),
        }
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Agent failed' }
      }
    }

    return this.runAgent({
      ...options,
      maxWaitMs: options.maxWaitMs ?? options.timeoutMs,
    })
  }

  async createBrowserSession(options: {
    ttl?: number
    activityTtl?: number
    profile?: FirecrawlBrowserProfile
  } = {}): Promise<FirecrawlResponse<FirecrawlBrowserSession>> {
    try {
      const payload: Record<string, unknown> = {
        ttl: options.ttl,
        activityTtl: options.activityTtl,
        profile: options.profile,
      }

      const result = this.app.createBrowserSession
        ? await this.limiter.schedule(() => this.app.createBrowserSession!(payload))
        : await this.firecrawlApiRequest<FirecrawlBrowserCreateResult>('POST', ['/v2/browser', '/browser'], payload)

      const errorMessage = extractErrorMessageFromLayers(result) || extractErrorMessage(result)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      const id = getStringFromLayers(result, 'id')
      if (!id) {
        return { success: false, error: 'Browser session creation failed' }
      }

      return {
        success: true,
        data: {
          id,
          cdpUrl: getStringFromLayers(result, 'cdpUrl'),
          liveViewUrl: getStringFromLayers(result, 'liveViewUrl'),
          interactiveLiveViewUrl: getStringFromLayers(result, 'interactiveLiveViewUrl'),
          status: getStringFromLayers(result, 'status'),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Browser session creation failed',
      }
    }
  }

  async executeBrowserCode(options: {
    sessionId: string
    code: string
    language: FirecrawlBrowserLanguage
    timeout?: number
  }): Promise<FirecrawlResponse<{ result: unknown }>> {
    try {
      const payload: Record<string, unknown> = {
        code: options.code,
        language: options.language,
        timeout: options.timeout,
      }

      const result = this.app.executeBrowserCode
        ? await this.limiter.schedule(() => this.app.executeBrowserCode!(options.sessionId, payload))
        : await this.firecrawlApiRequest<FirecrawlBrowserExecuteResult>(
            'POST',
            [`/v2/browser/${options.sessionId}/execute`, `/browser/${options.sessionId}/execute`],
            payload,
          )

      const errorMessage = extractErrorMessageFromLayers(result) || extractErrorMessage(result)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      const explicitResult = getUnknownFromLayers(result, 'result')
      return {
        success: true,
        data: {
          result: explicitResult !== undefined ? explicitResult : result,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Browser code execution failed',
      }
    }
  }

  async listBrowserSessions(options?: {
    status?: string
  }): Promise<FirecrawlResponse<Array<FirecrawlBrowserSession & { result?: unknown }>>> {
    try {
      const params = options?.status ? { status: options.status } : undefined
      const result = this.app.listBrowserSessions
        ? await this.limiter.schedule(() => this.app.listBrowserSessions!(params))
        : await this.firecrawlApiRequest<FirecrawlBrowserListResult>('GET', ['/v2/browser', '/browser'], params)

      const errorMessage = extractErrorMessageFromLayers(result) || extractErrorMessage(result)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      const root = asRecord(result)
      const sessionsRaw =
        (Array.isArray(result) ? result : undefined) ||
        getArrayFromLayers(result, 'sessions') ||
        (root && Array.isArray(root.data) ? root.data : [])

      const sessions: Array<FirecrawlBrowserSession & { result?: unknown }> = []
      for (const session of sessionsRaw) {
        const id = getStringFromLayers(session, 'id')
        if (!id) continue

        sessions.push({
          id,
          status: getStringFromLayers(session, 'status'),
          cdpUrl: getStringFromLayers(session, 'cdpUrl'),
          liveViewUrl: getStringFromLayers(session, 'liveViewUrl'),
          interactiveLiveViewUrl: getStringFromLayers(session, 'interactiveLiveViewUrl'),
          result: getUnknownFromLayers(session, 'result'),
        })
      }

      return { success: true, data: sessions }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list browser sessions',
      }
    }
  }

  async closeBrowserSession(sessionId: string): Promise<FirecrawlResponse<{ id: string }>> {
    try {
      const result = this.app.closeBrowserSession
        ? await this.limiter.schedule(() => this.app.closeBrowserSession!(sessionId))
        : await this.firecrawlApiRequest<FirecrawlBrowserCloseResult>('DELETE', [`/v2/browser/${sessionId}`, `/browser/${sessionId}`])

      const errorMessage = extractErrorMessageFromLayers(result) || extractErrorMessage(result)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      return {
        success: true,
        data: {
          id: getStringFromLayers(result, 'id') || sessionId,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to close browser session',
      }
    }
  }

  async map(options: {
    url: string
    search?: string
    limit?: number
  }): Promise<FirecrawlResponse<{ links: string[] }>> {
    try {
      const result = await this.limiter.schedule(() =>
        (this.app.mapUrl as NonNullable<FirecrawlSdk['mapUrl']>)(options.url, {
          search: options.search,
          limit: options.limit,
        })
      )

      const payload = result as FirecrawlMapResult
      const errorMessage = extractErrorMessage(payload)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      return { success: true, data: { links: payload.links || [] } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Map failed' }
    }
  }

  async crawl(options: {
    url: string
    limit?: number
    maxDepth?: number
    excludePaths?: string[]
    includePaths?: string[]
  }): Promise<FirecrawlResponse<{ id: string }>> {
    try {
      const result = await this.limiter.schedule(() =>
        (this.app.crawlUrl as NonNullable<FirecrawlSdk['crawlUrl']>)(options.url, {
          limit: options.limit,
          maxDepth: options.maxDepth,
          excludePaths: options.excludePaths,
          includePaths: options.includePaths,
        })
      )

      const payload = result as FirecrawlCrawlResult
      const errorMessage = extractErrorMessage(payload)
      if (errorMessage) {
        return { success: false, error: errorMessage }
      }

      if (!payload.id) {
        return { success: false, error: 'Crawl failed' }
      }

      return { success: true, data: { id: payload.id } }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Crawl failed' }
    }
  }

  private async firecrawlApiRequest<T>(
    method: 'GET' | 'POST' | 'DELETE',
    endpoints: string[],
    body?: Record<string, unknown>,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('FIRECRAWL_API_KEY is not configured')
    }

    let lastError: Error | undefined

    for (const endpoint of endpoints) {
      try {
        const url = new URL(`${this.apiUrl}${endpoint}`)
        if (method === 'GET' && body) {
          for (const [key, value] of Object.entries(body)) {
            if (value !== undefined && value !== null) {
              url.searchParams.set(key, String(value))
            }
          }
        }

        const response = await this.limiter.schedule(() =>
          fetch(url.toString(), {
            method,
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
          })
        )

        if (!response.ok) {
          const errorText = await response.text()
          if (response.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
            continue
          }

          throw new Error(errorText || `Firecrawl API request failed (${response.status})`)
        }

        const rawText = await response.text()
        if (!rawText) {
          return {} as T
        }

        try {
          return JSON.parse(rawText) as T
        } catch {
          return { result: rawText } as T
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
      }
    }

    throw lastError ?? new Error('Firecrawl API request failed')
  }

  private async scrapeWithFallback<T = FirecrawlScrapePayload>(options: {
    url: string
    scrapeOptions: {
      formats?: FirecrawlFormat[]
      onlyMainContent?: boolean
      includeTags?: string[]
      excludeTags?: string[]
      waitFor?: number
      timeout?: number
    }
    useFallbacks: boolean
    retries?: number
    backoffMs?: number
  }): Promise<FirecrawlResponse<T>> {
    const startTime = Date.now()
    const fallbackUrls = options.useFallbacks ? buildFallbackUrls(options.url) : [options.url]
    const maxRetries = options.retries ?? this.maxRetries
    const delayMs = options.backoffMs ?? this.backoffMs
    let attempt = 0
    let lastError: FirecrawlErrorDetails | undefined

    for (const candidate of fallbackUrls) {
      for (let retry = 0; retry <= maxRetries; retry++) {
        attempt += 1
        try {
          const result = await this.limiter.schedule(() =>
            this.app.scrape(candidate, {
              formats: options.scrapeOptions.formats as unknown as Array<string | Record<string, unknown>>,
              onlyMainContent: options.scrapeOptions.onlyMainContent,
              includeTags: options.scrapeOptions.includeTags,
              excludeTags: options.scrapeOptions.excludeTags,
              waitFor: options.scrapeOptions.waitFor,
              timeout: options.scrapeOptions.timeout,
            })
          )

          const errorMessage = extractErrorMessage(result)
          if (errorMessage) {
            throw new FirecrawlRequestError({
              code: 'api_error',
              message: errorMessage,
              url: candidate,
              attempt,
              status: resolveStatus(result),
            })
          }

          const payload = extractScrapePayload(result)
          if (isEmptyScrapePayload(payload, options.scrapeOptions.formats)) {
            throw new FirecrawlRequestError({
              code: 'empty_response',
              message: 'Firecrawl returned empty content',
              url: candidate,
              attempt,
            })
          }

          const durationMs = Date.now() - startTime
          recordFirecrawlRequest('extract', true, {
            url: candidate,
            durationMs,
            attempts: attempt,
          })
          return {
            success: true,
            data: payload as T,
            meta: {
              attempts: attempt,
              fallbackUrls,
              finalUrl: candidate,
              durationMs,
            },
          }
        } catch (error) {
          const details =
            error instanceof FirecrawlRequestError
              ? error.details
              : {
                  code: resolveErrorCode(error),
                  message: error instanceof Error ? error.message : 'Scrape failed',
                  url: candidate,
                  attempt,
                  status: resolveStatus(error),
                }
          lastError = details
          this.logger.warn('[Firecrawl] scrape failed', details)
          if (retry < maxRetries) {
            await sleep(delayMs * 2 ** retry)
          }
        }
      }
    }

    const durationMs = Date.now() - startTime
    recordFirecrawlRequest('extract', false, {
      url: options.url,
      durationMs,
      attempts: attempt,
      errorCode: lastError?.code,
    })
    return {
      success: false,
      error: lastError?.message || 'Scrape failed',
      errorDetails: lastError,
      meta: {
        attempts: attempt,
        fallbackUrls,
        durationMs,
      },
    }
  }
}

let client: FirecrawlService | null = null

export function getFirecrawlClient(): FirecrawlService {
  if (!client) {
    client = new FirecrawlService()
  }
  return client
}

export function createFirecrawlService(options: FirecrawlServiceOptions) {
  return new FirecrawlService(options)
}

export function extractDomainFromEmail(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/)
  return match ? match[1] : null
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
  }
}

export function normalizeUrl(input: string): string {
  if (input.includes('@') && !input.includes('://')) {
    const domain = extractDomainFromEmail(input)
    if (domain) {
      return `https://${domain}`
    }
    throw new Error('Invalid email format')
  }

  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return `https://${input}`
  }

  return input
}
