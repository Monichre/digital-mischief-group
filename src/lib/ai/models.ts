export const MODELS = {
  anthropic: {
    sonnet45: "anthropic/claude-sonnet-4.5",
  },
  openai: {
    gpt52: "openai/gpt-5.2",
  },
  google: {
    gemini3Pro: "google/gemini-3-pro",
  },
} as const

export const DEFAULT_TEXT_MODEL = MODELS.anthropic.sonnet45
export const DEFAULT_JSON_MODEL = MODELS.anthropic.sonnet45
