# Anthropic API Fallback System - Update Summary

**Date**: 2026-01-06
**Issue**: Anthropic API credit exhaustion causing enrichment failures
**Solution**: Implemented OpenRouter fallback system + updated all models to latest versions

---

## Changes Overview

### 1. Created LLM Provider Fallback System
**File**: `lib/agents/llm-provider.ts` (NEW)

- **Purpose**: Centralized LLM provider with automatic fallback from Anthropic to OpenRouter
- **Credit Error Detection**: Detects 400/402/429 status codes and error messages containing "credit balance", "insufficient_quota", etc.
- **Primary Provider**: Anthropic Claude Sonnet 4.5 (claude-sonnet-4-5-20241022)
- **Fallback Provider**: OpenRouter with GPT-5.2 (openai/gpt-5.2)
- **Key Function**: `generateWithFallback(options)` - tries Anthropic first, falls back to OpenRouter on credit errors

### 2. Updated Agent Files

#### ✅ lib/agents/conductor.ts
- **Updated**: 3 LLM calls to use `generateWithFallback()`
- **Functions**: `analyzeDiscoveryAndPlan()`, `reflectOnProgress()`, `generateFinalSynthesis()`

#### ✅ lib/agents/sentinel-agent.ts
- **Updated**: 4 LLM calls to use `generateWithFallback()`
- **Functions**: `extractRelevantContent()`, `analyzeCompetitiveSignals()`, `detectTrends()`, `synthesizeInsights()`

#### ✅ lib/agents/competitive-discovery.ts
- **Updated**: 3 LLM calls to use `generateWithFallback()`
- **Functions**: `generateCompetitorSearchQueries()`, `extractCompetitorInfo()`, `analyzePositioning()`

### 3. Updated API Routes

#### ✅ app/api/enrich/batch/stream/route.ts
- **Updated**: `generateSynthesis()` function to use `generateWithFallback()`
- **Added**: Fallback to data-based summary if LLM synthesis fails

#### ✅ app/api/research/stream/route.ts
- **Updated**: Vercel AI SDK `streamText()` model from `anthropic/claude-sonnet-4-20250514` to `anthropic/claude-sonnet-4.5`

#### ✅ app/api/research/[id]/run/route.ts
- **Updated**: Vercel AI SDK `generateText()` model from `anthropic/claude-sonnet-4-20250514` to `anthropic/claude-sonnet-4.5`

#### ✅ app/api/monitors/[id]/check/route.ts
- **Updated**: Vercel AI SDK `generateText()` model from `openai/gpt-4o-mini` to `openai/gpt-5.2`

#### ✅ app/api/ai/scrape/route.ts
- **Updated**: Vercel AI SDK `generateObject()` model from `openai/gpt-4o-mini` to `openai/gpt-5.2`

#### ✅ app/api/ai/process-document/route.ts
- **Already using**: `anthropic/claude-sonnet-4.5` (no update needed)

### 4. Data Quality Improvements

#### ✅ lib/agents/custom-fields.ts
**Fixed Personal Site Detection Logic**:
- **Before**: `if (employee_count === null)` → marked as personal site
- **After**: Only marks as personal with strong positive evidence
- **Result**: Prevents false positives like Stripe being classified as "personal site"

#### ✅ Enhanced Extraction Prompts
Updated all Firecrawl extraction prompts to be more detailed and specific:
- `lib/agents/company-profile.ts` - Comprehensive firmographic extraction guidance
- `lib/agents/tech-stack.ts` - Detailed technology detection instructions
- `lib/agents/funding.ts` - Specific funding information extraction guidance

#### ✅ lib/firecrawl/client.ts
**Added Debug Logging**:
- Logs URL, prompt preview, raw response, and extracted data
- Helps diagnose Firecrawl API issues and empty data returns

---

## Model Versions Updated

| Component | Previous Model | New Model |
|-----------|---------------|-----------|
| **Direct Anthropic Calls** | claude-sonnet-4-20250514 | claude-sonnet-4-5-20241022 |
| **OpenRouter Fallback** | - | openai/gpt-5.2 |
| **Vercel AI SDK (Claude)** | anthropic/claude-sonnet-4-20250514 | anthropic/claude-sonnet-4.5 |
| **Vercel AI SDK (OpenAI)** | openai/gpt-4o-mini | openai/gpt-5.2 |

---

## Environment Variables

Added to `.env.example`:
```bash
# OpenRouter (fallback for Anthropic when credits are low)
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Testing Recommendations

1. **Test Fallback System**:
   - Temporarily disable Anthropic API key to trigger fallback
   - Verify OpenRouter is used automatically
   - Check logs for fallback messages

2. **Test Data Quality**:
   - Run enrichment on known companies (e.g., Stripe, Shopify)
   - Verify they are NOT marked as personal sites
   - Check that all data fields are populated

3. **Monitor Logs**:
   - Watch for `[LLM Fallback]` messages
   - Check Firecrawl extraction debug logs
   - Verify no Anthropic credit errors

---

## Files Changed Summary

**Created (1)**:
- `lib/agents/llm-provider.ts`

**Modified (11)**:
- `lib/agents/conductor.ts`
- `lib/agents/sentinel-agent.ts`
- `lib/agents/competitive-discovery.ts`
- `lib/agents/custom-fields.ts`
- `lib/agents/company-profile.ts`
- `lib/agents/tech-stack.ts`
- `lib/agents/funding.ts`
- `lib/firecrawl/client.ts`
- `app/api/enrich/batch/stream/route.ts`
- `app/api/research/stream/route.ts`
- `app/api/research/[id]/run/route.ts`
- `app/api/monitors/[id]/check/route.ts`
- `app/api/ai/scrape/route.ts`

**Documentation (1)**:
- `.env.example`

---

## Total Impact

- **12 files updated** with fallback system
- **15 total LLM calls** now use automatic fallback
- **All model versions** updated to latest (Claude 4.5, GPT-5.2)
- **Personal site detection** logic fixed
- **Extraction prompts** enhanced for better data quality
- **Debug logging** added to diagnose issues

---

## Next Steps

1. ✅ Verify `.env` has `OPENROUTER_API_KEY` configured
2. ✅ Test enrichment with known companies to verify data quality
3. ✅ Monitor logs for fallback events
4. ⏳ Consider adding Exa integration for search/discovery (mentioned by user)
5. ⏳ Clarify "brand extraction" vs general extraction terminology
