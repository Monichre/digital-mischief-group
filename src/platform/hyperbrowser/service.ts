import { Hyperbrowser } from '@hyperbrowser/sdk'

export type HyperbrowserStrategyKey =
  | 'trend_summary'
  | 'competitor_analyzer'
  | 'company_researcher'

export interface TrendSummaryInput {
  query: string
}

export interface CompetitorAnalyzerInput {
  urls: string[]
}

export interface CompanyResearcherInput {
  companyName: string
  researchTopic: string
}

export type HyperbrowserStrategyInput =
  | {
      strategy: 'trend_summary'
      input: TrendSummaryInput
    }
  | {
      strategy: 'competitor_analyzer'
      input: CompetitorAnalyzerInput
    }
  | {
      strategy: 'company_researcher'
      input: CompanyResearcherInput
    }

export interface HyperbrowserStrategyResult {
  strategy: HyperbrowserStrategyKey
  summary: string
  data: Record<string, unknown>
}

class HyperbrowserConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HyperbrowserConfigError'
  }
}

function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown HyperBrowser error'
}

function normalizeUrls(urls: string[]): string[] {
  const deduped = new Set<string>()
  for (const raw of urls) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const withProtocol =
      trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`
    deduped.add(withProtocol)
  }
  return Array.from(deduped).slice(0, 5)
}

export class HyperbrowserService {
  private readonly apiKey: string | undefined
  private readonly enabled: boolean

  constructor() {
    this.apiKey = process.env.HYPERBROWSER_API_KEY
    this.enabled = process.env.HYPERBROWSER_ENABLED === 'true'
  }

  isAvailable(): boolean {
    return this.enabled && Boolean(this.apiKey)
  }

  private getClient(): Hyperbrowser {
    if (!this.enabled) {
      throw new HyperbrowserConfigError(
        'HyperBrowser is disabled (set HYPERBROWSER_ENABLED=true).'
      )
    }

    if (!this.apiKey) {
      throw new HyperbrowserConfigError('HYPERBROWSER_API_KEY is missing.')
    }

    return new Hyperbrowser({ apiKey: this.apiKey })
  }

  async runStrategy(
    strategyInput: HyperbrowserStrategyInput
  ): Promise<HyperbrowserStrategyResult> {
    switch (strategyInput.strategy) {
      case 'trend_summary':
        return this.runTrendSummary(strategyInput.input)
      case 'competitor_analyzer':
        return this.runCompetitorAnalyzer(strategyInput.input)
      case 'company_researcher':
        return this.runCompanyResearcher(strategyInput.input)
    }
  }

  async runTrendSummary(input: TrendSummaryInput): Promise<HyperbrowserStrategyResult> {
    const client = this.getClient()

    try {
      const job = await client.agents.hyperAgent.startAndWait({
        task: `Open Hacker News front page and identify top stories relevant to: ${input.query}. Then search Reddit for those stories and summarize the current conversation with key trend signals.`,
        maxSteps: 20,
      })

      if (job.status !== 'completed') {
        throw new Error(job.error || `HyperAgent did not complete (status=${job.status})`)
      }

      const summary =
        job.data?.finalResult ||
        'Trend summary completed, but the provider returned no final summary text.'

      return {
        strategy: 'trend_summary',
        summary,
        data: {
          liveUrl: job.liveUrl,
          metadata: job.metadata || null,
          steps: job.data?.steps || [],
        },
      }
    } catch (error) {
      throw new Error(`Trend Summary failed: ${extractErrorMessage(error)}`)
    }
  }

  async runCompetitorAnalyzer(
    input: CompetitorAnalyzerInput
  ): Promise<HyperbrowserStrategyResult> {
    const client = this.getClient()
    const urls = normalizeUrls(input.urls)

    if (urls.length < 2) {
      throw new Error('Competitor Analyzer requires at least 2 valid URLs.')
    }

    try {
      const scrapeResults = await Promise.all(
        urls.map(async (url) => {
          const scraped = await client.scrape.startAndWait({
            url,
            scrapeOptions: { formats: ['markdown'] },
          })

          return {
            url,
            status: scraped.status,
            markdown: scraped.data?.markdown || '',
            metadata: scraped.data?.metadata || {},
          }
        })
      )

      const extractResult = await client.extract.startAndWait({
        urls,
        prompt:
          'Compare these competitor websites. Extract for each: headline, key features, pricing model, and USP. Then provide a concise comparison summary.',
        schema: {
          type: 'object',
          properties: {
            sites: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  headline: { type: 'string' },
                  features: {
                    type: 'array',
                    items: { type: 'string' },
                  },
                  pricing: { type: 'string' },
                  usp: { type: 'string' },
                },
              },
            },
            summary: { type: 'string' },
          },
          required: ['sites'],
        },
      })

      if (extractResult.status !== 'completed') {
        throw new Error(
          extractResult.error ||
            `Competitor extract did not complete (status=${extractResult.status})`
        )
      }

      const extracted =
        extractResult.data && typeof extractResult.data === 'object'
          ? (extractResult.data as Record<string, unknown>)
          : {}

      const summary =
        typeof extracted.summary === 'string'
          ? extracted.summary
          : `Analyzed ${urls.length} competitor websites.`

      return {
        strategy: 'competitor_analyzer',
        summary,
        data: {
          urls,
          extracted,
          scrapes: scrapeResults,
          metadata: extractResult.metadata || null,
        },
      }
    } catch (error) {
      throw new Error(`Competitor Analyzer failed: ${extractErrorMessage(error)}`)
    }
  }

  async runCompanyResearcher(
    input: CompanyResearcherInput
  ): Promise<HyperbrowserStrategyResult> {
    const client = this.getClient()

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      `${input.companyName} ${input.researchTopic}`
    )}`

    try {
      const result = await client.extract.startAndWait({
        urls: [searchUrl],
        prompt: `Research ${input.companyName} with focus on: ${input.researchTopic}. Return company overview, key findings, and actionable key points.`,
        schema: {
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            companyOverview: { type: 'string' },
            researchFindings: { type: 'string' },
            keyPoints: {
              type: 'array',
              items: { type: 'string' },
            },
            additionalInfo: { type: 'string' },
          },
          required: ['companyName', 'companyOverview', 'researchFindings', 'keyPoints'],
        },
      })

      if (result.status !== 'completed') {
        throw new Error(
          result.error ||
            `Company researcher extract did not complete (status=${result.status})`
        )
      }

      const data =
        result.data && typeof result.data === 'object'
          ? (result.data as Record<string, unknown>)
          : {}

      const summary =
        typeof data.researchFindings === 'string'
          ? data.researchFindings
          : `Completed research for ${input.companyName}.`

      return {
        strategy: 'company_researcher',
        summary,
        data,
      }
    } catch (error) {
      throw new Error(`Company Researcher failed: ${extractErrorMessage(error)}`)
    }
  }
}

let hyperbrowserService: HyperbrowserService | null = null

export function getHyperbrowserService(): HyperbrowserService {
  if (!hyperbrowserService) {
    hyperbrowserService = new HyperbrowserService()
  }
  return hyperbrowserService
}
