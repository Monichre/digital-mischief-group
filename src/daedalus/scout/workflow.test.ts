import { describe, expect, it } from "bun:test"
import {
  normalizeUrl,
  deduplicateResults,
  calculateNextRunAt,
  type SearchResult,
} from "./workflow"

// Type assertion helper for bun:test matchers that aren't properly typed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any

describe("Scout Workflow", () => {
  describe("normalizeUrl", () => {
    it("removes trailing slashes", () => {
      expect(normalizeUrl("https://example.com/")).toBe("https://example.com")
      expect(normalizeUrl("https://example.com/path/")).toBe("https://example.com/path")
    })

    it("lowercases hostname", () => {
      expect(normalizeUrl("https://EXAMPLE.COM/Path")).toBe("https://example.com/Path")
    })

    it("removes utm parameters", () => {
      const url = "https://example.com/page?utm_source=google&utm_medium=cpc&foo=bar"
      expect(normalizeUrl(url)).toBe("https://example.com/page?foo=bar")
    })

    it("handles invalid URLs gracefully", () => {
      expect(normalizeUrl("not-a-url/")).toBe("not-a-url")
    })

    it("preserves non-tracking query params", () => {
      const url = "https://example.com/search?q=test&page=2"
      expect(normalizeUrl(url)).toBe("https://example.com/search?q=test&page=2")
    })
  })

  describe("deduplicateResults", () => {
    const makeResult = (url: string): SearchResult => ({
      url,
      title: "Test",
      snippet: "Test snippet",
      source: "test",
    })

    it("filters out previously seen URLs", () => {
      const results = [
        makeResult("https://example.com/new"),
        makeResult("https://example.com/seen"),
      ]
      const seenUrls = ["https://example.com/seen"]

      const { newResults, duplicates } = deduplicateResults(results, seenUrls)

      expectAny(newResults).toHaveLength(1)
      expect(newResults[0].url).toBe("https://example.com/new")
      expect(duplicates).toBe(1)
    })

    it("handles normalized URL matching", () => {
      const results = [
        makeResult("https://EXAMPLE.COM/page/"),
        makeResult("https://example.com/page?utm_source=test"),
      ]
      const seenUrls = ["https://example.com/page"]

      const { newResults, duplicates } = deduplicateResults(results, seenUrls)

      expectAny(newResults).toHaveLength(0)
      expect(duplicates).toBe(2)
    })

    it("deduplicates within the same batch", () => {
      const results = [
        makeResult("https://example.com/page"),
        makeResult("https://example.com/page/"), // Same after normalization
        makeResult("https://example.com/other"),
      ]
      const seenUrls: string[] = []

      const { newResults, duplicates } = deduplicateResults(results, seenUrls)

      expectAny(newResults).toHaveLength(2)
      expect(duplicates).toBe(1)
    })

    it("handles empty seen_urls", () => {
      const results = [
        makeResult("https://example.com/a"),
        makeResult("https://example.com/b"),
      ]

      const { newResults, duplicates } = deduplicateResults(results, [])

      expectAny(newResults).toHaveLength(2)
      expect(duplicates).toBe(0)
    })

    it("handles empty results", () => {
      const { newResults, duplicates } = deduplicateResults([], ["https://example.com"])

      expectAny(newResults).toHaveLength(0)
      expect(duplicates).toBe(0)
    })
  })

  describe("calculateNextRunAt", () => {
    it("returns null for manual schedule", () => {
      expectAny(calculateNextRunAt("manual")).toBeNull()
    })

    it("calculates hourly schedule", () => {
      const before = Date.now()
      const result = calculateNextRunAt("hourly")
      const after = Date.now()

      expectAny(result).not.toBeNull()
      const diff = result!.getTime() - before
      // Should be approximately 1 hour (3600000ms) ± small tolerance
      expectAny(diff).toBeGreaterThanOrEqual(3600000 - 100)
      expectAny(diff).toBeLessThanOrEqual(3600000 + (after - before) + 100)
    })

    it("calculates daily schedule", () => {
      const result = calculateNextRunAt("daily")
      expectAny(result).not.toBeNull()
      const diff = result!.getTime() - Date.now()
      // Should be approximately 24 hours
      expectAny(diff).toBeGreaterThan(23 * 60 * 60 * 1000)
      expectAny(diff).toBeLessThan(25 * 60 * 60 * 1000)
    })

    it("calculates weekly schedule", () => {
      const result = calculateNextRunAt("weekly")
      expectAny(result).not.toBeNull()
      const diff = result!.getTime() - Date.now()
      // Should be approximately 7 days
      expectAny(diff).toBeGreaterThan(6 * 24 * 60 * 60 * 1000)
      expectAny(diff).toBeLessThan(8 * 24 * 60 * 60 * 1000)
    })

    it("returns null for unknown schedule", () => {
      expectAny(calculateNextRunAt("unknown")).toBeNull()
    })
  })
})
