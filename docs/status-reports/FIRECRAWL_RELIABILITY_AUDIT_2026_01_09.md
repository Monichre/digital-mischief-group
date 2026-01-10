# Firecrawl Reliability Audit
**Date**: 2026-01-09
**File**: `lib/firecrawl/client.ts`
**Status**: ⚠️ Basic validation present, critical features missing

---

## Current State Analysis

### ✅ What's Working

**Validation Function** (lines 151-159):
```typescript
function validateExtraction(data: any, context: string): void {
  if (!data) {
    throw new Error(`${context}: Returned data is null or undefined`)
  }

  if (typeof data === 'object' && Object.keys(data).length === 0) {
    throw new Error(`${context}: Returned data is an empty object`)
  }
}
```
- ✅ Checks for null/undefined
- ✅ Checks for empty objects
- ✅ Throws descriptive errors

**Usage in Key Methods**:
- ✅ `extract()` method (line 323) - validates structured extractions
- ✅ `extractBrand()` method (line 222) - validates brand extractions

**Logging**:
- ✅ `extract()` has comprehensive logging (lines 302-332)
- ✅ Logs URL, prompt, raw response, extracted data

---

## ❌ Critical Missing Features

### 1. Retry Logic with Exponential Backoff
**Issue**: No retry mechanism when extractions fail or return empty data

**Current Behavior**:
- Single attempt per extraction
- Immediate failure on empty data
- No backoff strategy

**Impact**: Transient Firecrawl API issues cause permanent failures

**Example Failure Pattern**:
```
[Firecrawl Extract] URL: https://stripe.com
[Firecrawl Extract] Raw response: { "json": {} }
[Firecrawl Extract] Validation Failed: Structured Extraction: Returned data is an empty object
❌ Enrichment fails permanently
```

**Recommended Solution**:
```typescript
async extractWithRetry<T>(
  url: string,
  schema: Record<string, unknown>,
  prompt?: string,
  maxRetries: number = 3
): Promise<FirecrawlResponse<T>> {
  let lastError: string = ''

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await this.extract<T>(url, schema, prompt)

    if (result.success && result.data) {
      return result
    }

    lastError = result.error || 'Unknown error'

    if (attempt < maxRetries) {
      const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      console.log(`[Firecrawl Retry] Attempt ${attempt} failed, waiting ${backoffMs}ms`)
      await new Promise(resolve => setTimeout(resolve, backoffMs))
    }
  }

  return { success: false, error: `Failed after ${maxRetries} attempts: ${lastError}` }
}
```

---

### 2. Fallback URL Strategies
**Issue**: No alternative URL attempts when primary extraction fails

**Current Behavior**:
- Single URL per extraction attempt
- No exploration of alternative pages (e.g., /about, /company, /blog)

**Impact**: Missing data even when information exists on other pages

**Example Failure**:
```
Company homepage: Empty extraction
/about page: Rich company data ← Never attempted
/team page: Leadership info ← Never attempted
```

**Recommended Solution**:
```typescript
async extractWithFallback<T>(
  primaryUrl: string,
  fallbackUrls: string[],
  schema: Record<string, unknown>,
  prompt?: string
): Promise<FirecrawlResponse<T>> {
  // Try primary URL with retries
  const primaryResult = await this.extractWithRetry<T>(primaryUrl, schema, prompt)
  if (primaryResult.success) {
    return primaryResult
  }

  // Try fallback URLs
  for (const fallbackUrl of fallbackUrls) {
    console.log(`[Firecrawl Fallback] Trying alternative: ${fallbackUrl}`)
    const fallbackResult = await this.extractWithRetry<T>(fallbackUrl, schema, prompt)
    if (fallbackResult.success) {
      return fallbackResult
    }
  }

  return { success: false, error: 'All URLs failed extraction' }
}
```

---

### 3. Enhanced Validation (Semantic Checks)
**Issue**: Current validation only checks for empty data, not meaningful data

**Current Validation**:
- ✅ Checks: `data !== null`, `data !== undefined`, `Object.keys(data).length > 0`
- ❌ Missing: Checks for meaningful field values

**Problem Example**:
```json
{
  "company_name": "",
  "industry": null,
  "employee_count": 0,
  "headquarters": ""
}
```
☝️ Passes current validation but contains no useful data

**Recommended Enhanced Validation**:
```typescript
function validateExtractionQuality<T>(
  data: T,
  context: string,
  requiredFields?: string[]
): void {
  // Existing checks
  if (!data) {
    throw new Error(`${context}: Returned data is null or undefined`)
  }

  if (typeof data === 'object' && Object.keys(data).length === 0) {
    throw new Error(`${context}: Returned data is an empty object`)
  }

  // New semantic checks
  if (typeof data === 'object') {
    const values = Object.values(data)
    const meaningfulValues = values.filter(v =>
      v !== null &&
      v !== undefined &&
      v !== '' &&
      !(Array.isArray(v) && v.length === 0) &&
      !(typeof v === 'object' && Object.keys(v).length === 0)
    )

    if (meaningfulValues.length === 0) {
      throw new Error(`${context}: All fields are empty or null`)
    }

    // Check required fields if specified
    if (requiredFields && requiredFields.length > 0) {
      const missingFields = requiredFields.filter(field => {
        const value = (data as any)[field]
        return value === null || value === undefined || value === ''
      })

      if (missingFields.length > 0) {
        throw new Error(`${context}: Missing required fields: ${missingFields.join(', ')}`)
      }
    }
  }
}
```

---

### 4. Success Rate Monitoring
**Issue**: No tracking of extraction success/failure rates

**Missing Metrics**:
- ❌ Extraction success rate by agent type
- ❌ Average retry count before success
- ❌ Most common failure patterns
- ❌ URL-level success rates

**Recommended Implementation**:
```typescript
interface ExtractionMetrics {
  totalAttempts: number
  successfulExtractions: number
  failedExtractions: number
  emptyDataCount: number
  errorTypes: Record<string, number>
  averageRetryCount: number
}

class FirecrawlMonitor {
  private metrics: Map<string, ExtractionMetrics> = new Map()

  recordAttempt(agentType: string, success: boolean, retryCount: number, errorType?: string) {
    const key = agentType
    const current = this.metrics.get(key) || {
      totalAttempts: 0,
      successfulExtractions: 0,
      failedExtractions: 0,
      emptyDataCount: 0,
      errorTypes: {},
      averageRetryCount: 0
    }

    current.totalAttempts++
    if (success) {
      current.successfulExtractions++
    } else {
      current.failedExtractions++
      if (errorType) {
        current.errorTypes[errorType] = (current.errorTypes[errorType] || 0) + 1
      }
    }

    // Update average retry count
    current.averageRetryCount =
      (current.averageRetryCount * (current.totalAttempts - 1) + retryCount) / current.totalAttempts

    this.metrics.set(key, current)
  }

  getSuccessRate(agentType: string): number {
    const metrics = this.metrics.get(agentType)
    if (!metrics || metrics.totalAttempts === 0) return 0
    return metrics.successfulExtractions / metrics.totalAttempts
  }

  getReport(): Record<string, ExtractionMetrics> {
    return Object.fromEntries(this.metrics)
  }
}
```

---

### 5. Scrape Method Not Using Validation
**Issue**: `scrape()` method (lines 172-202) bypasses validation entirely

**Current Code**:
```typescript
async scrape<T = unknown>(options: {...}): Promise<FirecrawlResponse<T>> {
  try {
    const result = await this.app.scrape(options.url, {...})

    if ('error' in result && result.error) {
      return { success: false, error: String(result.error) }
    }

    return { success: true, data: result as T }  // ⚠️ No validation!
  } catch (error) {
    return { success: false, error: ... }
  }
}
```

**Impact**: Empty scrape results pass through undetected

**Recommended Fix**:
```typescript
async scrape<T = unknown>(options: {...}): Promise<FirecrawlResponse<T>> {
  try {
    const result = await this.app.scrape(options.url, {...})

    if ('error' in result && result.error) {
      return { success: false, error: String(result.error) }
    }

    // Add validation
    try {
      validateExtraction(result, "Scrape")
    } catch (validationError) {
      return {
        success: false,
        error: validationError instanceof Error ? validationError.message : "Scrape returned empty data"
      }
    }

    return { success: true, data: result as T }
  } catch (error) {
    return { success: false, error: ... }
  }
}
```

---

## Evidence from User Report

**User Statement**: "significant regressions in the form of missing data, wrong data and generally non robust agentic task payloads"

**Correlation with Code Analysis**:
1. ✅ "missing data" → No retry logic, single-attempt failures
2. ✅ "wrong data" → Weak validation allows empty fields
3. ✅ "non robust" → No fallback strategies or monitoring

---

## Remediation Plan

### Phase 1: Validation Enhancement (2-4 hours)
1. Implement `validateExtractionQuality()` with semantic checks
2. Apply to all extraction methods (`scrape`, `extract`, `extractBrand`)
3. Add required field specifications per agent type

### Phase 2: Retry Logic (3-5 hours)
1. Implement `extractWithRetry()` with exponential backoff
2. Configure per-agent retry limits
3. Add retry logging for debugging

### Phase 3: Fallback Strategies (4-6 hours)
1. Implement `extractWithFallback()` for multi-URL attempts
2. Define fallback URL patterns per agent (e.g., /about, /company, /team)
3. Add URL priority ordering logic

### Phase 4: Monitoring (2-3 hours)
1. Implement `FirecrawlMonitor` class
2. Add metrics collection to all extraction paths
3. Create admin endpoint for metrics dashboard

### Phase 5: Testing (4-6 hours)
1. Create test dataset with known companies (Stripe, Shopify, etc.)
2. Measure success rate improvements
3. Validate against user-reported issues

---

## Success Metrics

**Current State** (Estimated):
- Extraction success rate: ~60-70%
- Average meaningful fields per extraction: ~40%
- Retry capability: 0 (single attempt only)

**Target State**:
- Extraction success rate: >90%
- Average meaningful fields per extraction: >80%
- Retry capability: 3 attempts with exponential backoff
- Fallback URL exploration: 2-3 alternatives per primary URL

---

## Next Steps

1. ✅ **COMPLETED**: Document current state and missing features
2. **IN PROGRESS**: Review agent-specific usage patterns
3. **TODO**: Implement Phase 1 (Validation Enhancement)
4. **TODO**: Test with known company dataset
5. **TODO**: Deploy and monitor success rates
