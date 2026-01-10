# Comprehensive Remediation Plan
**Date**: 2026-01-09
**Status**: In Progress

This plan addresses critical database schema mismatches, missing authentication, and data quality regressions.

---

## Phase 1: Security & Route Protection (✅ Complete)
**Goal:** Secure all API endpoints and fix schema mismatches.

1. **Fix `brand-recon` Route (✅ Done)**
   - Updated `INSERT` to match DB schema (`url` vs `input_url`).
   - Added auth check and `user_id` scoping to both POST and GET.

2. **Secure Feature Routes (✅ Done)**
   - Updated `api/scouts` (GET/POST) with auth & user scoping.
   - Updated `api/research` (GET/POST) with auth & user scoping.
   - Updated `api/monitors` (GET/POST) with auth & user scoping.

3. **Secure Sub-routes (✅ Done)**
   - Applied auth to `[id]` endpoints and action routes (`scouts/[id]`, `monitors/[id]`, `research/[id]/run`).

---

## Phase 2: Data Quality & Reliability (🚧 60% Complete - **Regressions Identified**)
**Goal:** Prevent bad data from entering the system and fix regression issues.

⚠️ **USER REPORTED ISSUES**: "Significant regressions in the form of missing data, wrong data and generally non robust agentic task payloads"

**See [DATA_QUALITY_REGRESSION_ANALYSIS.md](./DATA_QUALITY_REGRESSION_ANALYSIS.md) for comprehensive issue documentation.**

4. **LLM Response Validation (⚠️ Implemented but Issues Remain)**
   - **Status**: Basic fallback implemented, but format inconsistencies between Anthropic and OpenRouter persist
   - **Task**: Modify `lib/agents/llm-provider.ts`.
   - **Details**:
     - ✅ Basic fallback implemented (Anthropic → OpenRouter)
     - ⚠️ JSON schema validation needed for both providers
     - ⚠️ Retry logic for malformed JSON (OpenRouter responses inconsistent)
     - ⚠️ Markdown code block stripping not fully reliable

5. **Firecrawl Robustness (❌ Not Complete)**
   - **Status**: Extraction failures still occurring (empty data with success status)
   - **Task**: Update `lib/firecrawl/client.ts`.
   - **Details**:
     - ❌ Validate extractions (reject empty objects/nulls) - NOT IMPLEMENTED
     - ❌ Add fallback logic (if extract returns null, try alternative URL or method) - NOT IMPLEMENTED
     - ❌ Add retry mechanism with exponential backoff - NOT IMPLEMENTED

6. **Batch Data Mapping (⚠️ Partial)**
   - **Status**: Data mapping issues causing null/undefined in database
   - **Task**: Refactor `app/api/enrich/batch/stream/route.ts`.
   - **Details**:
     - ⚠️ Safe mapping partially implemented but `|| {}` pattern loses nulls
     - ❌ Zod schema validation for `EnrichedResult` NOT IMPLEMENTED
     - ❌ Explicit null handling strategy needed

---

## Phase 3: Intelligence Improvements (⚠️ 70% Complete - **Accuracy Concerns**)
**Goal:** Improve classification accuracy.

7. **Personal Site Detection (⚠️ Over-Corrected)**
   - **Status**: Logic updated but may now have false negatives
   - **Task**: Enhance `lib/agents/custom-fields.ts`.
   - **Details**:
     - ✅ Fixed over-broad detection (now requires employee_count === 1)
     - ⚠️ May miss legitimate personal sites without employee_count signal
     - ❌ Multi-signal detection NOT FULLY IMPLEMENTED (keywords, "hire me" language)
     - ❌ Unit tests/fixtures for known personal vs company sites NOT ADDED

---

## Execution Status

**Overall Progress: 77% Complete**

- ✅ **Phase 1: 100% Complete** (Security & Routes)
  - All API endpoints secured with authentication
  - Database schema mismatches fixed
  - User scoping implemented across all routes

- ⚠️ **Phase 2: 60% Complete** (Data Quality & Reliability) - **REGRESSIONS IDENTIFIED**
  - ✅ Basic LLM fallback implemented (Anthropic → OpenRouter)
  - ❌ LLM response format validation NOT COMPLETE (inconsistencies remain)
  - ❌ Firecrawl extraction validation NOT IMPLEMENTED (empty data issues persist)
  - ⚠️ Batch data mapping PARTIALLY COMPLETE (null handling issues remain)
  - **Evidence Required**: User reports "missing data, wrong data, non robust payloads"
  - **Action**: See DATA_QUALITY_REGRESSION_ANALYSIS.md for detailed remediation plan

- ⚠️ **Phase 3: 70% Complete** (Intelligence) - **ACCURACY CONCERNS**
  - ✅ Personal site detection logic updated (stricter rules)
  - ⚠️ May have over-corrected (potential false negatives)
  - ❌ Multi-signal detection NOT FULLY IMPLEMENTED
  - ❌ Unit tests for classification accuracy NOT ADDED

---

## Known Open Issues

See [DATA_QUALITY_REGRESSION_ANALYSIS.md](./DATA_QUALITY_REGRESSION_ANALYSIS.md) for detailed analysis.

**Critical Issues**:
1. LLM Response Format Inconsistency (Anthropic vs OpenRouter)
2. Firecrawl Extraction Reliability (empty data with success status)
3. Personal Site Detection Accuracy (potential false negatives)
4. Data Mapping Null/Undefined Handling (type mismatches)
5. Conductor Default Behavior (runs all agents on LLM failure)

**Evidence Requirements for Completion**:
- ✅ All tests passing with known company datasets (Stripe, Shopify, etc.)
- ✅ Extraction success rate >90% (currently estimated <70%)
- ✅ Zero null/undefined data in enriched results (currently present)
- ✅ Personal site detection accuracy >95% (currently untested)
- ✅ LLM response parsing success >99% (currently has failures)
