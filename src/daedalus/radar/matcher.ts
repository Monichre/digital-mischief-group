import type { SearchHit } from "./types"

const STOP_WORDS = new Set(["the", "and", "for", "with", "from", "this", "that", "have", "your", "our"])

function isRegex(term: string): boolean {
  return term.length > 2 && term.startsWith("/") && term.endsWith("/")
}

function normalizeText(value: string | null | undefined): string {
  return (value || "")
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function termMatches(term: string, text: string): boolean {
  if (!term) return false
  if (isRegex(term)) {
    try {
      const pattern = term.slice(1, -1)
      const regex = new RegExp(pattern, "i")
      return regex.test(text)
    } catch {
      return false
    }
  }

  const normalizedTerm = term.toLowerCase().trim()
  if (!normalizedTerm || STOP_WORDS.has(normalizedTerm)) return false
  return text.includes(normalizedTerm)
}

export function matchHit(terms: string[], hit: SearchHit): { matched: boolean; matchedTerms: string[] } {
  const haystack = normalizeText(`${hit.title || ""} ${hit.snippet || ""} ${hit.url}`)
  const matchedTerms: string[] = []

  for (const term of terms) {
    if (termMatches(term, haystack)) {
      matchedTerms.push(term)
    }
  }

  return { matched: matchedTerms.length > 0, matchedTerms }
}
