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

  it('supports v2 envelope branding payloads from scrape', async () => {
    const app = {
      scrape: async () => ({
        data: {
          data: {
            branding: {
              colorScheme: 'dark',
              colors: { primary: '#FF6B35' },
              images: { logo: 'https://example.com/logo.svg' },
            },
            metadata: {
              title: 'Example',
              description: 'Example description',
            },
            screenshot: 'https://example.com/screenshot.png',
          },
        },
      }),
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

    expect(result.success).toBe(true)
    expect(result.data?.siteTitle).toBe('Example')
    expect(result.data?.siteDescription).toBe('Example description')
    expect(result.data?.images?.logo).toBe('https://example.com/logo.svg')
    expect(result.data?.screenshot).toBe('https://example.com/screenshot.png')
  })

  it('parses browser sandbox lifecycle responses', async () => {
    const app = {
      scrape: async () => ({}),
      search: async () => ({}),
      startAgent: async () => ({}),
      getAgentStatus: async () => ({}),
      createBrowserSession: async () => ({
        data: {
          id: 'session-1',
          cdpUrl: 'wss://cdp.example.com/session-1',
          liveViewUrl: 'https://live.example.com/session-1',
          interactiveLiveViewUrl: 'https://interactive.example.com/session-1',
        },
      }),
      executeBrowserCode: async () => ({
        data: {
          result: {
            stdout: 'ok',
            exitCode: 0,
          },
        },
      }),
      listBrowserSessions: async () => ({
        data: {
          sessions: [
            {
              id: 'session-1',
              status: 'active',
              cdpUrl: 'wss://cdp.example.com/session-1',
              liveViewUrl: 'https://live.example.com/session-1',
              interactiveLiveViewUrl: 'https://interactive.example.com/session-1',
            },
          ],
        },
      }),
      closeBrowserSession: async () => ({ data: { id: 'session-1' } }),
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })

    const created = await service.createBrowserSession({
      ttl: 300,
      activityTtl: 60,
      profile: { name: 'qa', saveChanges: true },
    })
    expect(created.success).toBe(true)
    expect(created.data?.id).toBe('session-1')
    expect(created.data?.cdpUrl).toBe('wss://cdp.example.com/session-1')
    expect(created.data?.interactiveLiveViewUrl).toBe('https://interactive.example.com/session-1')

    const execution = await service.executeBrowserCode({
      sessionId: 'session-1',
      code: 'console.log("ok")',
      language: 'node',
    })
    expect(execution.success).toBe(true)
    expect(execution.data?.result).toEqual({ stdout: 'ok', exitCode: 0 })

    const listed = await service.listBrowserSessions({ status: 'active' })
    expect(listed.success).toBe(true)
    expect(listed.data?.[0]?.id).toBe('session-1')
    expect(listed.data?.[0]?.status).toBe('active')

    const closed = await service.closeBrowserSession('session-1')
    expect(closed.success).toBe(true)
    expect(closed.data?.id).toBe('session-1')
  })

  it('passes urls/model/maxCredits through runAgent and returns credits metadata', async () => {
    const startPayloads: Array<Record<string, unknown>> = []
    const app = {
      scrape: async () => ({}),
      search: async () => ({}),
      startAgent: async (payload: Record<string, unknown>) => {
        startPayloads.push(payload)
        return { id: 'job-1' }
      },
      getAgentStatus: async () => ({
        status: 'completed',
        data: { summary: 'done' },
        creditsUsed: 7,
        expiresAt: '2026-03-05T00:00:00Z',
      }),
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })

    const result = await service.runAgent({
      prompt: 'Summarize these pages',
      urls: ['https://example.com', 'https://example.com/about'],
      model: 'FIRE-1',
      maxCredits: 25,
      pollIntervalMs: 1,
      maxWaitMs: 1000,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ summary: 'done' })
    expect(result.creditsUsed).toBe(7)
    expect(result.expiresAt).toBe('2026-03-05T00:00:00Z')

    expect(startPayloads.length).toBe(1)
    expect(startPayloads[0]?.prompt).toBe('Summarize these pages')
    expect(startPayloads[0]?.urls).toEqual(['https://example.com', 'https://example.com/about'])
    expect(startPayloads[0]?.model).toBe('FIRE-1')
    expect(startPayloads[0]?.maxCredits).toBe(25)
  })

  it('uses sdk agent wrapper with option pass-through', async () => {
    const agentPayloads: Array<Record<string, unknown>> = []
    const app = {
      scrape: async () => ({}),
      search: async () => ({}),
      startAgent: async () => ({}),
      getAgentStatus: async () => ({}),
      agent: async (payload: Record<string, unknown>) => {
        agentPayloads.push(payload)
        return {
          status: 'completed',
          data: { answer: 'ok' },
          creditsUsed: 3,
          expiresAt: '2026-03-05T00:00:00Z',
        }
      },
    } satisfies NonNullable<FirecrawlServiceOptions['app']>

    const service = createFirecrawlService({ app, maxRetries: 0, backoffMs: 0 })
    const result = await service.agent({
      prompt: 'Run sync agent',
      urls: ['https://example.com'],
      model: 'v3-beta',
      maxCredits: 10,
      pollIntervalMs: 2000,
      timeoutMs: 8000,
    })

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ answer: 'ok' })
    expect(result.creditsUsed).toBe(3)
    expect(result.expiresAt).toBe('2026-03-05T00:00:00Z')

    expect(agentPayloads.length).toBe(1)
    expect(agentPayloads[0]?.prompt).toBe('Run sync agent')
    expect(agentPayloads[0]?.urls).toEqual(['https://example.com'])
    expect(agentPayloads[0]?.model).toBe('v3-beta')
    expect(agentPayloads[0]?.maxCredits).toBe(10)
    expect(agentPayloads[0]?.pollInterval).toBe(2)
    expect(agentPayloads[0]?.timeout).toBe(8)
  })
})
