import { z } from 'zod'
import { generateObjectWithFallback } from '@/ai/tools/llm.tool'
import type { Competitor } from '@/ai/agents/competitive.agent'
import type { BrandingProfile } from '@/daedalus/extract/brand/types'
import {
  CORTEX_DIRECTIVE_IDS,
  CORTEX_DIRECTIVE_LABELS,
  type CortexDirective,
  type CortexDossier,
} from '@/lib/cortex-directives'

const DirectiveSchema = z.enum(CORTEX_DIRECTIVE_IDS)

const CortexDossierSchema = z.object({
  directive: DirectiveSchema,
  title: z.string(),
  executive_summary: z.string(),
  key_insights: z.array(z.string()).min(3).max(12),
  signals: z.array(z.string()).optional(),
  kill_chain: z
    .object({
      pain_points: z.array(z.string()),
      decision_makers: z.array(z.string()),
      budget_signals: z.array(z.string()),
      outreach_angles: z.array(z.string()),
    })
    .optional(),
  market_teardown: z
    .object({
      competitors: z.array(
        z.object({
          name: z.string(),
          domain: z.string(),
          positioning: z.string(),
          price_tier: z.enum(['budget', 'mid-market', 'premium', 'enterprise']),
          gaps: z.array(z.string()),
        })
      ),
      pricing_models: z.array(z.string()),
      feature_gaps: z.array(z.string()),
      moat_risks: z.array(z.string()),
    })
    .optional(),
  asset_strip: z
    .object({
      brand_voice: z.array(z.string()),
      design_tokens: z
        .object({
          colors: z.array(z.string()).optional(),
          fonts: z.array(z.string()).optional(),
          typography: z.array(z.string()).optional(),
        })
        .optional(),
      messaging: z.array(z.string()),
      ad_copy: z.array(z.string()),
    })
    .optional(),
  recommended_actions: z.array(z.string()).min(3).max(10),
})

export type CortexDossierContext = {
  directive: CortexDirective
  target: {
    type: 'company' | 'person'
    name: string
    identifier?: string | null
  }
  enrichment: {
    description?: string | null
    industry?: string | null
    employee_count?: string | number | null
    headquarters?: string | null
    founded_year?: number | null
    funding_total?: string | null
    funding_stage?: string | null
    tech_stack?: string[] | null
    icp_fit_score?: number | null
    icp_fit_reasons?: string[] | null
    buying_signals?: Array<{ signal: string; confidence: number }> | null
    leadership?: Array<{ name: string; title: string; linkedin?: string | null }> | null
    pain_points?: string[] | null
    competitive_landscape?: string[] | null
  }
  competitors?: Competitor[] | null
  branding?: BrandingProfile | null
}

const DIRECTIVE_FOCUS: Record<CortexDirective, string> = {
  kill_chain:
    'Expose pain points, decision makers, budget signals, and outreach angles.',
  market_teardown:
    'Compare competitors on positioning, pricing models, feature gaps, and strategic risk.',
  asset_strip:
    'Extract brand voice, design tokens, messaging patterns, and ad copy.',
}

function buildFallbackDossier(
  context: CortexDossierContext
): CortexDossier {
  const title = `${context.target.name} — ${CORTEX_DIRECTIVE_LABELS[context.directive]}`
  return {
    directive: context.directive,
    title,
    executive_summary:
      context.enrichment.description ||
      `${context.target.name} dossier generated from available enrichment data.`,
    key_insights: [
      context.enrichment.industry
        ? `Industry: ${context.enrichment.industry}`
        : 'Industry signal unavailable.',
      context.enrichment.icp_fit_score !== null &&
      context.enrichment.icp_fit_score !== undefined
        ? `ICP fit score: ${context.enrichment.icp_fit_score}`
        : 'ICP fit score unavailable.',
      context.enrichment.funding_stage
        ? `Funding stage: ${context.enrichment.funding_stage}`
        : 'Funding stage unavailable.',
    ],
    signals: context.enrichment.buying_signals?.map((s) => s.signal) || [],
    recommended_actions: [
      'Validate target requirements with a focused discovery call.',
      'Confirm budget ownership and decision-making chain.',
      'Monitor competitor moves and update outreach narrative.',
    ],
  }
}

export async function generateCortexDossier(
  context: CortexDossierContext
): Promise<CortexDossier> {
  const label = CORTEX_DIRECTIVE_LABELS[context.directive]
  const prompt = `You are a strategic intelligence analyst. Produce a classified dossier for the target using the directive provided.

Directive: ${label}
Focus: ${DIRECTIVE_FOCUS[context.directive]}

Rules:
- Use only the data in the context.
- If a field is missing, return a short placeholder or empty array.
- Keep language tactical, concise, and actionable.
- Return ONLY valid JSON that matches the schema.

Context JSON:
${JSON.stringify(
  {
    target: context.target,
    enrichment: context.enrichment,
    competitors: context.competitors || [],
    branding: context.branding || null,
  },
  null,
  2
)}`

  try {
    const { object } = await generateObjectWithFallback({
      schema: CortexDossierSchema,
      prompt,
      temperature: 0.2,
      maxTokens: 1800,
    })

    return {
      ...object,
      directive: context.directive,
      title: object.title || `${context.target.name} — ${label}`,
    }
  } catch (error) {
    console.error('[Cortex Dossier] LLM generation failed:', error)
    return buildFallbackDossier(context)
  }
}
