export const HYPERBROWSER_PRESETS = [
  {
    key: 'trend_summary',
    label: 'HyperBrowser Trend Summary',
    mission:
      'Summarize live trend momentum by scanning current discussions and pulling signal shifts.',
    defaultInput: {
      query: 'AI agents and browser automation trends this week',
    },
  },
  {
    key: 'competitor_analyzer',
    label: 'Competitor Analyzer',
    mission:
      'Compare competitor websites for positioning, features, pricing language, and messaging gaps.',
    defaultInput: {
      urls: ['https://firecrawl.dev', 'https://apify.com'],
    },
  },
  {
    key: 'company_researcher',
    label: 'Company Researcher',
    mission:
      'Generate a structured company brief for a specific research topic using web extraction.',
    defaultInput: {
      companyName: 'OpenAI',
      researchTopic: 'new product launches and strategic partnerships',
    },
  },
  {
    key: 'hyper_train',
    label: 'Hyper Train',
    mission:
      'Build LLM-ready datasets from URL lists with optional embeddings and QA generation.',
    defaultInput: {
      urls: ['https://docs.firecrawl.dev/features/browser', 'https://docs.firecrawl.dev/features/agent'],
      outputDir: 'tmp/hyper-train',
      chunkSize: 900,
      concurrency: 3,
      includeEmbeddings: false,
      includeQaGeneration: false,
    },
  },
] as const

export type HyperbrowserPresetKey =
  (typeof HYPERBROWSER_PRESETS)[number]['key']

export function isHyperbrowserPresetKey(value: unknown): value is HyperbrowserPresetKey {
  return (
    typeof value === 'string' &&
    HYPERBROWSER_PRESETS.some((preset) => preset.key === value)
  )
}

export function getHyperbrowserPreset(key: HyperbrowserPresetKey) {
  return HYPERBROWSER_PRESETS.find((preset) => preset.key === key) || null
}
