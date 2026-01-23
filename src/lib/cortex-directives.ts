export const CORTEX_DIRECTIVE_IDS = [
  'kill_chain',
  'market_teardown',
  'asset_strip',
] as const

export type CortexDirective = (typeof CORTEX_DIRECTIVE_IDS)[number]

export const CORTEX_DIRECTIVES: Array<{
  id: CortexDirective
  label: string
  focus: string
  purpose: string
}> = [
  {
    id: 'kill_chain',
    label: 'KILL CHAIN',
    focus: 'Pain points, decision makers, budget signals.',
    purpose: 'Sales',
  },
  {
    id: 'market_teardown',
    label: 'MARKET TEARDOWN',
    focus: 'Competitor features, pricing models, gaps.',
    purpose: 'Strategy',
  },
  {
    id: 'asset_strip',
    label: 'ASSET STRIP',
    focus: 'Brand voice, design tokens, ad copy.',
    purpose: 'Creative',
  },
]

export const CORTEX_DIRECTIVE_LABELS: Record<CortexDirective, string> = {
  kill_chain: 'KILL CHAIN',
  market_teardown: 'MARKET TEARDOWN',
  asset_strip: 'ASSET STRIP',
}

export type CortexDossier = {
  directive: CortexDirective
  title: string
  executive_summary: string
  key_insights: string[]
  signals?: string[]
  kill_chain?: {
    pain_points: string[]
    decision_makers: string[]
    budget_signals: string[]
    outreach_angles: string[]
  }
  market_teardown?: {
    competitors: Array<{
      name: string
      domain: string
      positioning: string
      price_tier: 'budget' | 'mid-market' | 'premium' | 'enterprise'
      gaps: string[]
    }>
    pricing_models: string[]
    feature_gaps: string[]
    moat_risks: string[]
  }
  asset_strip?: {
    brand_voice: string[]
    design_tokens?: {
      colors?: string[]
      fonts?: string[]
      typography?: string[]
    }
    messaging: string[]
    ad_copy: string[]
  }
  recommended_actions: string[]
}
