# Next Phase Implementation Plan: Validation, Monitoring & Hardening
> [!NOTE]
> **Superseded by `TODOS.md`**: This document is kept for background context. For the current, canonical backlog of work, see `TODOS.md`.

**Date**: 2026-01-09
**Status**: Planned
**Pre-requisites**: Completion of `REMEDIATION_PLAN_2026_01_09.md` (Security & Data Quality Fixes)

This plan outlines the next steps to validate the recent fixes, establish monitoring, and further harden the system against regressions.

---

## Phase 1: Testing & Verification (Immediate)
**Goal**: Verify that recent changes work as expected across different providers and scenarios.

1.  **LLM Provider Compatibility Testing**
    *   **Objective**: Ensure OpenRouter (GPT-5.2) and Anthropic (Claude 3.5 Sonnet) produce compatible JSON outputs for the Conductor agent.
    *   **Task**: Create a test script `scripts/test-llm-compatibility.ts`.
    *   **Details**: Run the same enrichment prompt through both providers and validate the output against `DiscoveryResultSchema`.

2.  **Personal Site Detection Fixtures**
    *   **Objective**: Validate the new multi-signal scoring logic in `custom-fields.ts`.
    *   **Task**: Create `tests/fixtures/personal-sites.ts` and `tests/personal-site-detection.test.ts`.
    *   **Details**: Test against known personal sites (portfolios, blogs) and small companies (1-2 employees) to ensure <5% false positive rate.

3.  **End-to-End Auth & Billing Test**
    *   **Objective**: Verify the `better-auth` integration and Stripe webhooks.
    *   **Task**: Manual verification checklist or automated Playwright test.
    *   **Details**: Sign up → Upgrade to Pro → Verify DB state → Downgrade.

---

## Phase 2: Monitoring & Observability
**Goal**: Detect data quality issues in production before users report them.

4.  **Extraction Success Monitoring**
    *   **Task**: Add structured logging to `lib/firecrawl/client.ts`.
    *   **Details**: Log `extraction_success`, `extraction_empty`, and `extraction_error` events with metadata (URL domain, retry count).
    *   **Tooling**: Use existing logging infrastructure or simple stdout for ingestion by monitoring tools.

5.  **Data Quality Alerts**
    *   **Task**: Implement threshold checks.
    *   **Details**: Alert if "Field Population Rate" drops below 70% for a batch.

---

## Phase 3: Advanced Hardening (Fallback Strategies)
**Goal**: Ensure the system works even when primary paths fail.

6.  **Firecrawl URL Fallbacks**
    *   **Task**: Update `lib/agents/custom-fields.ts` and `company-profile.ts`.
    *   **Details**: If the main URL extraction fails or returns empty data:
        *   Try `url + "/about"`
        *   Try `url + "/team"`
        *   Try `url + "/company"`

7.  **Conductor Rule-Based Fallback**
    *   **Task**: Update `lib/agents/conductor.ts`.
    *   **Details**: If the LLM planning step fails completely (after retries), fall back to a hardcoded "Safe Mode" plan (e.g., skip expensive agents, run only essentials) instead of crashing or running everything.

---

## Phase 4: Cleanup & Maintenance
8.  **Codebase Cleanup**
    *   **Task**: Remove unused files and legacy code.
    *   **Details**:
        *   Audit `lib/auth-legacy.ts` (if exists).
        *   Standardize on `zod` schemas in `lib/agents/schemas.ts`.
    *   **Commit**: Finalize all pending changes to git.
