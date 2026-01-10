# Data Quality Regression Analysis

**Date**: 2026-01-09
**Status**: 🔴 Critical - Significant data quality issues reported
**Scope**: Missing data, incorrect data, non-robust agentic payloads

---

## Executive Summary

Recent changes to the enrichment system have introduced potential regressions in data quality. This analysis identifies **5 critical areas** of concern and provides actionable remediation steps.

### Impact Areas
1. ❌ **Missing Data**: Fields returning null when data should exist
2. ❌ **Incorrect Data**: Wrong information being extracted or mapped
3. ❌ **Non-Robust Payloads**: Agent payloads failing validation or missing required fields
4. ⚠️ **Inconsistent Extraction**: Firecrawl API returning empty/incomplete data
5. ⚠️ **LLM Response Variations**: Different models producing incompatible response formats

---

## Critical Issues Identified

### 🔴 Issue #1: LLM Response Format Inconsistency

**Location**: `lib/agents/llm-provider.ts`, `lib/agents/conductor.ts`

**Problem**:
- Switched from direct Anthropic SDK to fallback system (Anthropic → OpenRouter)
- Different models: `claude-sonnet-4-5-20241022` vs `openai/gpt-5.2`
- Response parsing in conductor expects specific JSON format
- No validation that OpenRouter responses match Anthropic format

**Evidence**:
```typescript
// conductor.ts:108 - Expects JSON in text response
const jsonMatch = response.text.match(/\{[\s\S]*\}/)

// Different models may format JSON differently:
// - Claude: Often wraps in markdown code blocks
// - GPT: More consistent JSON but different verbosity
```

**Impact**:
- ❌ Conductor planning fails silently → all agents run regardless of relevance
- ❌ JSON parsing errors → default behavior (run all agents)
- ⚠️ Wrong agent decisions due to model behavior differences

**Affected Functions**:
- `analyzeDiscoveryAndPlan()` - Agent orchestration decisions
- `reflectOnProgress()` - Progress insights
- `generateFinalSynthesis()` - Final briefing generation

**Remediation**:
1. Add response format validation before JSON parsing
2. Test both Anthropic and OpenRouter responses with same prompts
3. Add structured output schema enforcement
4. Log raw responses for debugging
5. Implement retry with format clarification if JSON invalid

---

### 🔴 Issue #2: Firecrawl Extraction Failures

**Location**: `lib/firecrawl/client.ts`, all agent extraction calls

**Problem**:
- Firecrawl API returning empty/null data even when content exists
- No validation that extracted data matches schema
- Silent failures - agents proceed with null data
- Debug logging added but not actively monitored

**Evidence**:
```typescript
// lib/agents/company-profile.ts:55-62
if (mainResult.success && mainResult.data) {
  extractedData = mainResult.data.extract || mainResult.data
  // No validation that extractedData has required fields
}

// Result can have "success: true" but data is empty {}
```

**Impact**:
- ❌ Missing company profiles (industry, employee count, HQ)
- ❌ Empty tech stacks (no technologies detected)
- ❌ Missing funding data (no investors, stages, amounts)
- ❌ No leadership extracted (CEO, executives)

**Common Failure Scenarios**:
1. Website blocks Firecrawl crawler → returns empty HTML
2. Dynamic/JavaScript-heavy sites → content not rendered
3. Rate limiting → partial extractions
4. Schema mismatch → extraction succeeds but misses fields
5. Invalid prompts → LLM extracts wrong content

**Affected Agents**:
- `company-profile` - All firmographic data
- `tech-stack` - Technology detection
- `funding` - Investment information
- `custom-fields` - Leadership extraction

**Remediation**:
1. **Add extraction validation**:
   ```typescript
   if (!extractedData || Object.keys(extractedData).length === 0) {
     throw new Error("Firecrawl returned empty data")
   }
   ```

2. **Implement fallback strategies**:
   - Try multiple URLs (about, company, team pages)
   - Use Firecrawl Agent for dynamic navigation
   - Fall back to web search for key data points
   - Try Crunchbase/LinkedIn as alternative sources

3. **Enhanced error handling**:
   ```typescript
   try {
     const result = await firecrawl.extract(...)
     validateExtraction(result, requiredFields)
   } catch (error) {
     logExtraction({ url, error, rawResponse })
     // Try alternative approach
   }
   ```

4. **Monitor extraction success rates**:
   - Track empty extractions per URL
   - Alert on patterns (specific domains always fail)
   - A/B test different prompt strategies

---

### 🔴 Issue #3: Personal Site Detection Over-Correction

**Location**: `lib/agents/custom-fields.ts:20-61`

**Problem**:
- Previous logic: `if (employee_count === null)` → marked as personal
- New logic: Only marks with strong positive evidence
- May now miss legitimate personal sites
- Could also still misclassify small startups

**Evidence**:
```typescript
// OLD (line 37 comment in ANTHROPIC_FALLBACK_UPDATE.md):
// if (employee_count === null) → personal site

// NEW (line 38):
if (profile?.employee_count === 1) {
  // Still needs company evidence to avoid personal classification
}

// RISK: employee_count = 2-5 → NOT marked personal even if solo consultant
// RISK: employee_count = null → NOT marked personal (data missing, not personal)
```

**False Positive Examples** (OLD):
- ✅ Fixed: Stripe (employee_count = null) → Was marked personal, now correctly company

**False Negative Examples** (NEW):
- ❌ Risk: Solo consultant with 1 employee + basic website → Might classify as company
- ❌ Risk: Portfolio site with 2-3 team members → Treated as company
- ❌ Risk: Freelancer network (5 people) → Could bypass personal detection

**Impact**:
- ❌ Personal sites entering sales pipeline
- ❌ Wasted resources enriching non-viable leads
- ⚠️ ICP fit scores calculated for non-companies

**Remediation**:
1. **Multi-signal approach**:
   ```typescript
   function isPersonalSite(context: EnrichmentContext): boolean {
     const signals = {
       explicitIndicators: checkExplicitIndicators(context), // "portfolio", "freelance"
       companyStructure: checkCompanyStructure(context),     // funding, investors, HQ
       businessActivity: checkBusinessActivity(context),     // B2B products, services
       onlinePresence: checkOnlinePresence(context),         // social, Crunchbase
     }

     // Weighted scoring
     const personalScore = calculatePersonalScore(signals)
     return personalScore > PERSONAL_THRESHOLD
   }
   ```

2. **Enhanced indicators**:
   - Check for "Contact Me", "Hire Me" language
   - Look for portfolio/resume keywords in URLs
   - Detect single-person pronouns (I, my, me)
   - Check for services vs products

3. **Test dataset**:
   - Create test suite with known personal/company sites
   - Validate detection accuracy before deployment

---

### 🔴 Issue #4: Data Mapping to Database Payload

**Location**: `app/api/enrich/batch/stream/route.ts:169-188`

**Problem**:
- Complex nested data structure mapping from enrichment result
- Potential null/undefined mismatches
- Schema validation failures not caught
- Optional chaining may hide data access errors

**Evidence**:
```typescript
// Line 173-187 - Cached result construction
result = {
  company_name: cached[0].company_name,           // Direct field
  segment: cached[0].profile_data?.segment,       // Nested optional
  funding_stage: cached[0].funding_data?.funding_stage,  // Could be undefined
  tech_signals: cached[0].tech_stack_data?.signals || { ... }, // Deep nesting
}

// RISK: If cached[0].tech_stack_data is null → signals becomes {}
// RISK: If profile_data exists but segment is null → loses null info
```

**Potential Issues**:
1. **Null vs Undefined vs Missing**:
   - Database: `null` = explicitly no data
   - Code: `undefined` = field doesn't exist
   - Result: Type mismatches and validation errors

2. **Nested Object Access**:
   - `?.` operator hides errors
   - Deep nesting fragile to schema changes
   - No validation that nested structure exists

3. **Default Values**:
   - Using `|| {}` for objects loses null information
   - Empty arrays `[]` vs `null` have different meanings
   - Default values may not match schema expectations

**Affected Data**:
- Tech signals (ai_adoption, modern_stack, cloud_native)
- ICP fit (score, reasons, buying signals)
- Leadership (CEO, executives)
- Funding (investors array, stages)

**Remediation**:
1. **Type-safe mapping**:
   ```typescript
   function mapToEnrichedResult(cached: CachedRow): EnrichedResult {
     const profile = cached.profile_data
     const funding = cached.funding_data
     const techStack = cached.tech_stack_data

     return {
       company_name: cached.company_name ?? null,
       segment: profile?.segment ?? null,
       tech_signals: techStack?.signals ?? {
         ai_adoption: false,
         modern_stack: false,
         cloud_native: false,
       },
       // ... explicit handling
     }
   }
   ```

2. **Schema validation**:
   ```typescript
   import { z } from "zod"

   const EnrichedResultSchema = z.object({
     company_name: z.string().nullable(),
     tech_signals: z.object({
       ai_adoption: z.boolean(),
       modern_stack: z.boolean(),
       cloud_native: z.boolean(),
     }),
     // ... full schema
   })

   const validated = EnrichedResultSchema.parse(result)
   ```

3. **Error logging**:
   ```typescript
   try {
     result = constructEnrichedResult(cached)
   } catch (error) {
     console.error("[Batch] Data mapping failed:", {
       cached_keys: Object.keys(cached[0]),
       error: error.message,
       row_id: row.id,
     })
     throw error
   }
   ```

---

### ⚠️ Issue #5: Conductor Default Behavior on Failure

**Location**: `lib/agents/conductor.ts:146-151`

**Problem**:
- If LLM planning fails → runs all agents by default
- No differentiation between personal sites, B2C companies, non-targets
- Wastes resources and API credits on non-viable leads
- Can't skip irrelevant agents

**Evidence**:
```typescript
// Line 146-150
// Default: run all agents
return [
  { phase: "company_profile", action: "run", reason: "Default behavior" },
  { phase: "funding", action: "run", reason: "Default behavior" },
  { phase: "tech_stack", action: "run", reason: "Default behavior" },
  { phase: "custom_fields", action: "run", reason: "Default behavior" },
]
```

**Impact**:
- ❌ Personal sites get full enrichment (expensive)
- ❌ B2C companies enriched for B2B pipeline
- ❌ Non-profits, government sites waste resources
- ⚠️ No cost optimization when LLM unavailable

**Current Fallback Trigger**:
- LLM API failure (credits, network, rate limits)
- JSON parsing failure
- Response format mismatch

**Remediation**:
1. **Rule-based fallback**:
   ```typescript
   function ruleBasedPlanning(discovery: DiscoveryResult): ConductorDecision[] {
     // Simple heuristics when AI unavailable
     const indicators = analyzeDiscoveryBasic(discovery)

     if (indicators.likelyPersonal) {
       return [
         { phase: "company_profile", action: "run", reason: "Verify if personal" },
         { phase: "funding", action: "skip", reason: "Likely personal site" },
         { phase: "tech_stack", action: "skip", reason: "Not relevant" },
         { phase: "custom_fields", action: "run", reason: "ICP check needed" },
       ]
     }

     // More heuristics for B2C, non-profit, etc.
     return defaultPlan
   }
   ```

2. **Confidence-based execution**:
   - If discovery.confidence < 0.8 → skip expensive agents
   - If website returns error → skip extraction agents
   - If domain is known personal (github.io, wordpress.com) → minimal enrichment

3. **Cost monitoring**:
   ```typescript
   const ENRICHMENT_COST = {
     discovery: 0.01,
     company_profile: 0.05,
     funding: 0.03,
     tech_stack: 0.03,
     custom_fields: 0.08,
   }

   function shouldRunAgent(phase: AgentPhase, context: Context): boolean {
     const confidence = context.discovery.confidence
     const estimatedValue = calculateLeadValue(context)
     const cost = ENRICHMENT_COST[phase]

     return estimatedValue > cost * 2 // 2x ROI threshold
   }
   ```

---

## Testing Plan

### Phase 1: LLM Response Compatibility (Priority: 🔴 Critical)

**Test Cases**:
1. Run conductor with Anthropic only → capture JSON responses
2. Run conductor with OpenRouter only → capture JSON responses
3. Compare response formats and parsing success rates
4. Test edge cases (malformed JSON, non-JSON responses, timeouts)

**Success Criteria**:
- ✅ Both providers parse successfully ≥95% of time
- ✅ Decisions identical between providers for same input
- ✅ Graceful handling of JSON parsing failures

**Script**:
```bash
# Test with known domains
curl -X POST http://localhost:3000/api/enrich/batch/stream \
  -H "Content-Type: application/json" \
  -d '{"rows": [{"id": "test-1", "domain": "stripe.com"}]}'

# Check logs for [LLM Fallback] messages
# Verify final enrichment result quality
```

---

### Phase 2: Firecrawl Extraction Validation (Priority: 🔴 Critical)

**Test Cases**:
1. **Test known-good domains**:
   - Stripe.com → Should extract full profile
   - Vercel.com → Should detect tech stack
   - Shopify.com → Should find funding data

2. **Test edge cases**:
   - GitHub Pages (username.github.io) → Should detect personal
   - Portfolio sites → Should skip expensive agents
   - Dynamic SPAs → Should handle JS rendering

3. **Test failure modes**:
   - Non-existent domains → Should fail gracefully
   - Rate-limited domains → Should retry appropriately
   - Blocked crawlers → Should log and fallback

**Success Criteria**:
- ✅ Known companies: ≥80% field population rate
- ✅ Personal sites: ≥90% detection accuracy
- ✅ Failed extractions: Clear error messages and fallback behavior

**Script**:
```typescript
// Test extraction reliability
const testDomains = [
  { domain: "stripe.com", expected: { industry: "Financial Services", employees: ">1000" }},
  { domain: "vercel.com", expected: { technologies: ["Next.js", "React"], funding: "Series C" }},
]

for (const test of testDomains) {
  const result = await orchestrateEnrichment({ domain: test.domain })
  validateAgainstExpected(result, test.expected)
}
```

---

### Phase 3: Data Mapping Integrity (Priority: 🔴 Critical)

**Test Cases**:
1. Enrich 20 diverse companies → Check all fields populated correctly
2. Compare fresh enrichment vs cached data → Verify no data loss
3. Test null handling → Ensure nulls preserved (not converted to undefined/"")
4. Test nested object access → Verify no optional chaining issues

**Success Criteria**:
- ✅ Fresh vs cached: 100% field match
- ✅ Null preservation: All nulls stored as null (not undefined)
- ✅ Required fields: Never null/undefined for successful enrichments

---

### Phase 4: Personal Site Detection (Priority: ⚠️ High)

**Test Cases**:
Create test dataset with known classifications:

**Confirmed Personal Sites**:
- john-doe-portfolio.com
- freelance-developer.io
- consultant-jane.github.io

**Confirmed Companies**:
- stripe.com
- shopify.com
- vercel.com

**Edge Cases**:
- 2-person startups
- Consulting firms (3-5 people)
- Solo founders with product

**Success Criteria**:
- ✅ Personal detection: ≥90% accuracy
- ✅ Company detection: ≥95% accuracy (no false positives)
- ✅ Edge cases: Clear documentation of classification logic

---

### Phase 5: End-to-End Validation (Priority: ⚠️ High)

**Test Cases**:
1. Batch enrichment of 50 companies → Measure quality metrics
2. Compare pre-regression vs post-regression data quality
3. User acceptance testing with sales team

**Quality Metrics**:
- Field population rate (% of non-null fields)
- Data accuracy (manual spot checks)
- Personal site false positive rate
- Enrichment success rate (completed without errors)

**Success Criteria**:
- ✅ Field population: ≥75% for priority fields
- ✅ Accuracy: ≥90% on manual spot checks
- ✅ Personal false positives: <5%
- ✅ Success rate: ≥85% without critical errors

---

## Immediate Actions Required

### Today (Jan 9, 2026)

1. **🔴 Commit pending changes** (17 files) - MUST review before committing
2. **🔴 Add response format validation** to conductor LLM calls
3. **🔴 Add extraction validation** to all Firecrawl calls
4. **🔴 Test Anthropic vs OpenRouter** response compatibility

### This Week

1. **🔴 Create test dataset** for personal site detection
2. **🔴 Implement data mapping validation** with Zod schemas
3. **🔴 Add monitoring** for extraction success rates
4. **⚠️ Run comprehensive test suite** on staging environment

### Next Week

1. **⚠️ Deploy fixes** to production with feature flags
2. **⚠️ Monitor production metrics** for data quality
3. **🟢 Document lessons learned** and update runbooks
4. **🟢 Create alerts** for data quality regressions

---

## Success Metrics (Post-Remediation)

**Data Quality KPIs**:
- Field Population Rate: **Target 75%+** (currently unknown)
- Data Accuracy: **Target 90%+** (manual validation)
- Personal Site Detection: **Target 90%+** accuracy
- Enrichment Success Rate: **Target 85%+** without errors

**Operational KPIs**:
- LLM Fallback Success: **Target 95%+** compatible responses
- Firecrawl Success: **Target 80%+** non-empty extractions
- Cache Hit Rate: **Target 30%+** (reduces costs)
- Average Enrichment Time: **Target <45 seconds**

**Cost Efficiency**:
- Reduce unnecessary enrichments by **30%** (better planning)
- Lower API costs by **20%** (fewer retries, better caching)
- Improve lead quality score by **25%** (better ICP fit accuracy)

---

## Related Documentation

- [ANTHROPIC_FALLBACK_UPDATE.md](./ANTHROPIC_FALLBACK_UPDATE.md) - Recent changes overview
- [lib/agents/llm-provider.ts](./lib/agents/llm-provider.ts) - Fallback implementation
- [lib/agents/conductor.ts](./lib/agents/conductor.ts) - Orchestration logic
- [app/api/enrich/batch/stream/route.ts](./app/api/enrich/batch/stream/route.ts) - Batch API

---

## Questions for Stakeholders

1. **What specific data fields are most critical for sales team?** (prioritize fixes)
2. **Are there specific companies where data is wrong/missing?** (test cases)
3. **What's the acceptable false positive rate for personal sites?** (detection threshold)
4. **What's the budget for API costs?** (cost optimization priority)
5. **Timeline for fixes?** (hot fix vs gradual rollout)
