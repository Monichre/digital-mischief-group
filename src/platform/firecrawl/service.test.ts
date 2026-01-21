import { describe, expect, it } from 'bun:test'
import { createFirecrawlService, type FirecrawlServiceOptions } from './service'

describe('FirecrawlService', () => {
  it('falls back when scrape result is empty', async () => {
    const calls: string[] = []
    const app = {
      scrape: async (url: string) => {
        calls.push(url)
        if (calls.length === 1) {
          return { markdown: '' }
        }
        return { markdown: 'ok', metadata: { title: 'About' } }
      },
      search: async () => ({}),
      startAgent: async () => ({}),
      getAgentStatus: async () => ({}),
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })

    const result = await service.scrape({
      url: 'https://example.com/pricing',
      formats: ['markdown'],
      onlyMainContent: true,
    })

    expect(result.success).toBe(true)
    expect(result.data?.markdown).toBe('ok')
    expect(result.meta?.finalUrl).toBe('https://example.com/about')
    expect(calls).toEqual(['https://example.com/pricing', 'https://example.com/about'])
  })

  it('returns structured errors after retries', async () => {
    const app = {
      scrape: async () => {
        const error = new Error('Rate limit exceeded') as Error & { status?: number }
        error.status = 429
        throw error
      },
      search: async () => ({}),
      startAgent: async () => ({}),
      getAgentStatus: async () => ({}),
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })

    const result = await service.scrape({
      url: 'https://example.com',
      formats: ['markdown'],
      useFallbacks: false,
      retries: 1,
      backoffMs: 0,
    })

    expect(result.success).toBe(false)
    expect(result.errorDetails?.code).toBe('rate_limited')
    expect(result.meta?.attempts).toBe(2)
  })

  it('rejects empty branding payloads', async () => {
    const app = {
      scrape: async () => ({ branding: {} }),
      search: async () => ({}),
      startAgent: async () => ({}),
      getAgentStatus: async () => ({}),
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })

    const result = await service.extractBrand('https://example.com', {
      useFallbacks: false,
      retries: 0,
      backoffMs: 0,
    })

    expect(result.success).toBe(false)
    expect(result.errorDetails?.code).toBe('empty_response')
  })
})
