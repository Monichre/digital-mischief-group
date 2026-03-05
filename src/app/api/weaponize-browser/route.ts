import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/platform/auth/server'
import { getFirecrawlClient } from '@/platform/firecrawl/service'
import { getHyperbrowserService } from '@/platform/hyperbrowser'
import { HYPERBROWSER_PRESETS } from '@/daedalus/browser/presets'
import { runHyperTrainDatasetPipeline } from '@/daedalus/browser/hyper-train/pipeline'

const FirecrawlBrowserSchema = z.object({
  mode: z.literal('firecrawl_browser'),
  url: z.string().url(),
  code: z.string().optional(),
  language: z.enum(['node', 'bash']).default('node'),
  ttl: z.number().int().min(30).max(3600).optional(),
  activityTtl: z.number().int().min(10).max(3600).optional(),
})

const FirecrawlAgentSchema = z.object({
  mode: z.literal('firecrawl_agent'),
  prompt: z.string().min(5),
  urls: z.array(z.string().url()).optional(),
  model: z.string().optional(),
  maxCredits: z.number().int().positive().optional(),
})

const HyperbrowserStrategyPayloadSchema = z.discriminatedUnion('strategy', [
  z.object({
    strategy: z.literal('trend_summary'),
    query: z.string().min(3),
  }),
  z.object({
    strategy: z.literal('competitor_analyzer'),
    urls: z.array(z.string().url()).min(2),
  }),
  z.object({
    strategy: z.literal('company_researcher'),
    companyName: z.string().min(2),
    researchTopic: z.string().min(3),
  }),
])

const HyperbrowserStrategySchema = z.object({
  mode: z.literal('hyperbrowser_strategy'),
  payload: HyperbrowserStrategyPayloadSchema,
})

const HyperTrainSchema = z.object({
  mode: z.literal('hyper_train'),
  urls: z.array(z.string().url()).min(1),
  outputDir: z.string().optional(),
  chunkSize: z.number().int().min(300).max(5000).optional(),
  concurrency: z.number().int().min(1).max(20).optional(),
  includeEmbeddings: z.boolean().optional(),
  includeQaGeneration: z.boolean().optional(),
})

const WeaponizeRequestSchema = z.discriminatedUnion('mode', [
  FirecrawlBrowserSchema,
  FirecrawlAgentSchema,
  HyperbrowserStrategySchema,
  HyperTrainSchema,
])

function defaultBrowserScript(url: string): string {
  return `
await page.goto(${JSON.stringify(url)}, { waitUntil: 'domcontentloaded' });
const title = await page.title();
const href = page.url();
console.log(JSON.stringify({ title, href }));
`.trim()
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    presets: HYPERBROWSER_PRESETS,
  })
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let parsed: z.infer<typeof WeaponizeRequestSchema>
  try {
    const body = await request.json()
    parsed = WeaponizeRequestSchema.parse(body)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request payload' },
      { status: 400 }
    )
  }

  try {
    if (parsed.mode === 'firecrawl_browser') {
      const firecrawl = getFirecrawlClient()
      const sessionResult = await firecrawl.createBrowserSession({
        ttl: parsed.ttl,
        activityTtl: parsed.activityTtl,
      })

      if (!sessionResult.success || !sessionResult.data) {
        return NextResponse.json(
          { error: sessionResult.error || 'Failed to create browser session' },
          { status: 502 }
        )
      }

      const browserSession = sessionResult.data

      try {
        const executionResult = await firecrawl.executeBrowserCode({
          sessionId: browserSession.id,
          code: parsed.code?.trim() || defaultBrowserScript(parsed.url),
          language: parsed.language,
        })

        return NextResponse.json({
          mode: parsed.mode,
          session: browserSession,
          execution: executionResult,
        })
      } finally {
        await firecrawl.closeBrowserSession(browserSession.id)
      }
    }

    if (parsed.mode === 'firecrawl_agent') {
      const firecrawl = getFirecrawlClient()
      const result = await firecrawl.agent({
        prompt: parsed.prompt,
        urls: parsed.urls,
        model: parsed.model,
        maxCredits: parsed.maxCredits,
        maxWaitMs: 90000,
      })

      return NextResponse.json({
        mode: parsed.mode,
        result,
      })
    }

    if (parsed.mode === 'hyperbrowser_strategy') {
      const hyperbrowser = getHyperbrowserService()
      const result =
        parsed.payload.strategy === 'trend_summary'
          ? await hyperbrowser.runStrategy({
              strategy: 'trend_summary',
              input: { query: parsed.payload.query },
            })
          : parsed.payload.strategy === 'competitor_analyzer'
            ? await hyperbrowser.runStrategy({
                strategy: 'competitor_analyzer',
                input: { urls: parsed.payload.urls },
              })
            : await hyperbrowser.runStrategy({
                strategy: 'company_researcher',
                input: {
                  companyName: parsed.payload.companyName,
                  researchTopic: parsed.payload.researchTopic,
                },
              })

      return NextResponse.json({
        mode: parsed.mode,
        result,
      })
    }

    const report = await runHyperTrainDatasetPipeline({
      urls: parsed.urls,
      outputDir: parsed.outputDir || 'tmp/hyper-train',
      chunkSize: parsed.chunkSize,
      concurrency: parsed.concurrency,
      includeEmbeddings: parsed.includeEmbeddings,
      includeQaGeneration: parsed.includeQaGeneration,
      runLabel: 'weaponize-browser',
    })

    return NextResponse.json({
      mode: parsed.mode,
      report,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    )
  }
}
