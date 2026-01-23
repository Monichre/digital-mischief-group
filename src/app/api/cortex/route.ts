import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/platform/db/neon'
import { auth } from '@/platform/auth/server'
import { headers } from 'next/headers'
import { getFirecrawlClient } from '@/platform/firecrawl/service'
import { generateObjectWithFallback } from '@/ai/tools/llm.tool'
import {
  CORTEX_DIRECTIVE_IDS,
  CORTEX_DIRECTIVE_LABELS,
  type CortexDossier,
} from '@/lib/cortex-directives'
import type { Competitor } from '@/ai/agents/competitive.agent'
import { discoverCompetitors } from '@/ai/agents/competitive.agent'
import { extractBrandIdentity } from '@/daedalus/extract/brand/workflow'
import { generateCortexDossier } from '@/daedalus/enrich/cortex-dossier'
import type { BrandingProfile } from '@/daedalus/extract/brand/types'

export const maxDuration = 120

const ArchiveSchema = z.object({
  enrichmentJobId: z.string().uuid(),
  directive: z.enum(CORTEX_DIRECTIVE_IDS),
  logoUrl: z.string().url().optional().nullable(),
  competitorsOverride: z
    .array(
      z.object({
        name: z.string().optional(),
        domain: z.string().min(2),
        website: z.string().optional(),
      })
    )
    .optional(),
})

function parseJsonValue<T>(value: unknown): T | null {
  if (!value) return null
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  }
  return null
}

function flattenSources(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (typeof value === 'object') {
    const entries = Object.values(value as Record<string, unknown>)
    return entries.flatMap(flattenSources)
  }
  if (typeof value === 'string') {
    return [value]
  }
  return []
}

function buildSearchText(
  dossier: CortexDossier,
  targetName: string | null,
  targetIdentifier: string | null,
  competitors: Competitor[] | null
): string {
  const parts = [
    targetName,
    targetIdentifier,
    CORTEX_DIRECTIVE_LABELS[dossier.directive],
    dossier.executive_summary,
    JSON.stringify(dossier),
    ...dossier.key_insights,
    ...(dossier.signals || []),
    ...(dossier.kill_chain?.pain_points || []),
    ...(dossier.kill_chain?.decision_makers || []),
    ...(dossier.kill_chain?.budget_signals || []),
    ...(dossier.market_teardown?.feature_gaps || []),
    ...(dossier.market_teardown?.pricing_models || []),
    ...(dossier.asset_strip?.brand_voice || []),
    ...(dossier.asset_strip?.messaging || []),
    ...(competitors || []).flatMap((comp) => [
      comp.name,
      comp.domain,
      comp.positioning,
    ]),
  ]

  return parts.filter(Boolean).join(' ')
}

async function enrichCompetitorsFromOverrides(
  overrides: Array<{ name?: string; domain: string; website?: string }>
): Promise<Competitor[]> {
  const firecrawl = getFirecrawlClient()
  const competitors: Competitor[] = []
  const schema = z.object({
    name: z.string().nullable().optional(),
    positioning: z.string().nullable().optional(),
    value_props: z.array(z.string()).default([]),
    price_tier: z
      .enum(['budget', 'mid-market', 'premium', 'enterprise'])
      .nullable()
      .optional(),
    segment: z.string().nullable().optional(),
  })

  for (const override of overrides.slice(0, 8)) {
    const website = override.website || `https://${override.domain}`
    try {
      const scrapeResult = await firecrawl.scrape({
        url: website,
        formats: ['markdown'],
        onlyMainContent: true,
      })

      if (!scrapeResult.success || !scrapeResult.data?.markdown) {
        continue
      }

      const markdown = scrapeResult.data.markdown.slice(0, 8000)
      const prompt = `Extract competitive intelligence from this company website:

${markdown}

Return ONLY a JSON object with:
{
  "name": "Company name",
  "positioning": "One-sentence positioning statement",
  "value_props": ["Value prop 1", "Value prop 2", "Value prop 3"],
  "price_tier": "budget|mid-market|premium|enterprise",
  "segment": "Target customer segment"
}`

      const { object } = await generateObjectWithFallback({
        schema,
        prompt,
        maxTokens: 700,
        temperature: 0.3,
      })

      competitors.push({
        name: object.name || override.name || override.domain,
        domain: override.domain,
        website,
        positioning: object.positioning || 'Positioning unavailable',
        value_props: object.value_props || [],
        price_tier: object.price_tier || 'mid-market',
        segment: object.segment || 'unknown',
        confidence: object.positioning ? 0.6 : 0.3,
      })
    } catch (error) {
      console.error('[Cortex Competitors] Override enrichment failed:', error)
    }
  }

  return competitors
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim()

  const dossiers = query
    ? await sql`
        SELECT
          id,
          target_name,
          target_identifier,
          directive,
          summary,
          logo_url,
          created_at
        FROM cortex_dossiers
        WHERE user_id = ${session.user.id}
          AND (
            to_tsvector('english', COALESCE(search_text, '')) @@ plainto_tsquery('english', ${query})
            OR target_name ILIKE ${`%${query}%`}
            OR target_identifier ILIKE ${`%${query}%`}
          )
        ORDER BY created_at DESC
        LIMIT 100
      `
    : await sql`
        SELECT
          id,
          target_name,
          target_identifier,
          directive,
          summary,
          logo_url,
          created_at
        FROM cortex_dossiers
        WHERE user_id = ${session.user.id}
        ORDER BY created_at DESC
        LIMIT 100
      `

  return NextResponse.json({ dossiers })
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const body = await request.json()
    const { enrichmentJobId, directive, logoUrl, competitorsOverride } =
      ArchiveSchema.parse(body)

    const existing = await sql`
      SELECT id FROM cortex_dossiers
      WHERE user_id = ${userId}
        AND enrichment_job_id = ${enrichmentJobId}
        AND directive = ${directive}
      LIMIT 1
    `

    if (existing.length > 0) {
      return NextResponse.json({ id: existing[0].id })
    }

    const enrichmentRows = await sql`
      SELECT
        id,
        input_type,
        input_value,
        domain,
        company_name,
        company_description,
        industry,
        employee_count,
        founded_year,
        headquarters,
        website,
        funding_total,
        technologies,
        leadership,
        icp_fit_score,
        icp_fit_reasons,
        buying_signals,
        sources,
        custom_fields_data
      FROM enrichment_jobs
      WHERE id = ${enrichmentJobId}
        AND user_id = ${userId}
      LIMIT 1
    `

    if (enrichmentRows.length === 0) {
      return NextResponse.json({ error: 'Enrichment job not found' }, { status: 404 })
    }

    const enrichment = enrichmentRows[0]
    const leadership = parseJsonValue<Array<{ name: string; title: string; linkedin?: string | null }>>(
      enrichment.leadership
    )
    const buyingSignals = parseJsonValue<Array<{ signal: string; confidence: number }>>(
      enrichment.buying_signals
    )
    const customFields = parseJsonValue<Record<string, unknown>>(enrichment.custom_fields_data)
    const sources = flattenSources(parseJsonValue(enrichment.sources))

    let competitors: Competitor[] | null = null
    let competitorSources: string[] = []

    if (directive === 'market_teardown') {
      if (competitorsOverride && competitorsOverride.length > 0) {
        competitors = await enrichCompetitorsFromOverrides(competitorsOverride)
      } else {
        const competitiveResult = await discoverCompetitors({
          company_name: enrichment.company_name || enrichment.domain || 'Unknown',
          domain: enrichment.domain || enrichment.website || '',
          industry: enrichment.industry || null,
          description: enrichment.company_description || null,
          segment:
            (customFields?.segment as string | null) ||
            (customFields?.business_type as string | null) ||
            null,
        })

        if (competitiveResult.success && competitiveResult.data) {
          competitors = competitiveResult.data.competitors.slice(0, 8)
          competitorSources = competitiveResult.data.sources || []
        }
      }
    }

    let branding: BrandingProfile | null = null
    let brandSources: string[] = []
    if (directive === 'asset_strip' && enrichment.website) {
      const brandResult = await extractBrandIdentity({ url: enrichment.website })
      if (brandResult.success && brandResult.data) {
        branding = brandResult.data.branding
        brandSources = brandResult.data.sources
      }
    }

    const targetName =
      enrichment.company_name ||
      enrichment.domain ||
      enrichment.input_value ||
      'Unknown'
    const targetIdentifier =
      enrichment.domain || enrichment.website || enrichment.input_value || null
    const targetType =
      enrichment.input_type === 'email' ? 'person' : 'company'

    const dossier = await generateCortexDossier({
      directive,
      target: {
        type: targetType,
        name: targetName,
        identifier: targetIdentifier,
      },
      enrichment: {
        description: enrichment.company_description,
        industry: enrichment.industry,
        employee_count: enrichment.employee_count,
        headquarters: enrichment.headquarters,
        founded_year: enrichment.founded_year,
        funding_total: enrichment.funding_total,
        tech_stack: parseJsonValue<string[]>(enrichment.technologies),
        icp_fit_score: enrichment.icp_fit_score,
        icp_fit_reasons: enrichment.icp_fit_reasons,
        buying_signals: buyingSignals,
        leadership,
        pain_points: (customFields?.pain_points as string[]) || null,
        competitive_landscape: (customFields?.competitive_landscape as string[]) || null,
      },
      competitors,
      branding,
    })

    const summary = dossier.executive_summary
    const searchText = buildSearchText(dossier, targetName, targetIdentifier, competitors)
    const allSources = [...sources, ...competitorSources, ...brandSources].filter(Boolean)

    const [saved] = await sql`
      INSERT INTO cortex_dossiers (
        user_id,
        enrichment_job_id,
        target_type,
        target_name,
        target_identifier,
        directive,
        summary,
        dossier_json,
        search_text,
        logo_url,
        sources,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${enrichmentJobId},
        ${targetType},
        ${targetName},
        ${targetIdentifier},
        ${directive},
        ${summary},
        ${JSON.stringify(dossier)},
        ${searchText},
        ${logoUrl || null},
        ${JSON.stringify(allSources)},
        NOW(),
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({ id: saved.id })
  } catch (error) {
    console.error('[Cortex Archive] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to archive' },
      { status: 500 }
    )
  }
}
