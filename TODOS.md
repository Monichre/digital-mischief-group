## Todos Backlog Alignment — Daedalus

### Overview

This document records the changes made to `TODOS.md` to align the ticket backlog with the Daedalus PRD (`PRD.md`), structured PRD JSON (`prd.json`), and the high-level project overview (`README.md`).

The goals of this pass were:

- Ensure each core user story in the PRD has explicit or clearly mapped coverage in the ticket backlog.
- Introduce a consistent, non-time-based effort sizing scheme (t‑shirt sizes) instead of day estimates.
- Keep the backlog structure (priority sections, ticket format) intact while minimizing churn.

---

### Mapping PRD User Stories to Tickets

The PRD defines user stories `US-001` through `US-007` (see `PRD.md` and `prd.json`). The updated `TODOS.md` maps them as follows:

- **US-001 — Enrich a CSV of leads**
  - Covered by:
    - `Ticket #3: Enrich Workflow Guardrails`
    - `Ticket #8: CSV Enrichment Flow`
- **US-002 — Enrich a single lead**
  - Now explicitly covered by:
    - `Ticket #19: Single Lead Enrichment Flow`
- **US-003 — Extract brand identity from a URL**
  - Now explicitly covered by:
    - `Ticket #20: Brand Identity Extract Core`
  - Downstream asset generation remains in:
    - `Ticket #10: Brand Asset Generation`
- **US-004 — Monitor critical pages for changes**
  - Covered by:
    - `Ticket #5: Observe Reliability`
- **US-005 — Run scouts to discover new signals**
  - Covered by:
    - `Ticket #6: Scout Dedup & Scheduling`
- **US-006 — Run research sessions with agents**
  - Covered by:
    - `Ticket #11: Research Split-View Reliability`
- **US-007 — Manage plans, usage, and billing (GEO)**
  - Covered by:
    - `Ticket #12: Settings & Billing (GEO)`
    - `Ticket #16: Usage-Based Credits (Optional Layer)`

This ensures that each canonical user story in the PRD has at least one concrete ticket in the backlog.

---

### New Tickets Added

Two new tickets were added under the `🟡 P1: Experience & Conversion` section to close explicit gaps between the PRD and the backlog:

- **Ticket #19: Single Lead Enrichment Flow**
  - **Primitive/Module**: `enrich`
  - **Purpose**: Provide a first-class, single-lead enrichment UX that matches `US-002`, including input (email, name, domain), validation, and consistent persistence with CSV jobs.
- **Ticket #20: Brand Identity Extract Core**
  - **Primitive/Module**: `extract`
  - **Purpose**: Implement the core brand identity extraction pipeline and schema described in `US-003`, independent of downstream asset generation.

The header in `TODOS.md` was updated from `Total Tickets: 18` to `Total Tickets: 20` to reflect these additions.

---

### Effort Sizing Changes

`TODOS.md` previously used day-based estimates (`2 days`, `3 days`, `4 days`). These were converted to t‑shirt sizes to avoid time-based commitments and to match the requested estimation style:

- **Mapping applied**:
  - `2 days` → `S`
  - `3 days` → `M`
  - `4 days` → `L`
  - `TBD` values were left unchanged.

All tickets now use this scheme, and the **Legend** in `TODOS.md` was extended with:

- `S` = Small effort
- `M` = Medium effort
- `L` = Large effort
- `TBD` = To be determined

---

### Files Touched

- **`TODOS.md`**
  - Updated `Last Updated` date.
  - Updated `Total Tickets` from 18 → 20.
  - Added effort sizing legend.
  - Converted all day-based effort estimates to t‑shirt sizes.
  - Added:
    - `Ticket #19: Single Lead Enrichment Flow`
    - `Ticket #20: Brand Identity Extract Core`
- **`TODOS_PSUEDOCODE.md`**
  - Captures the step-by-step pseudocode for how to read the PRD, map user stories, and modify `TODOS.md`.

This brings the backlog into explicit alignment with the current PRD while preserving the existing ticket structure and priority model.

# Project Tickets - Daedalus Platform

**Last Updated:** 2026-01-21

This is the canonical ticket backlog for Digital Mischief Group. All active work is tracked here with checkboxes for manual progress tracking.

**Total Tickets:** 20

**Legend:**

- `🔴 P0` = Critical / Immediate
- `🟡 P1` = High Priority / Short-term
- `🟢 P2` = Medium Priority / Medium-term
- `⚪ P3` = Low Priority / Long-term
- `S` = Small effort
- `M` = Medium effort
- `L` = Large effort
- `TBD` = To be determined

---

## 📋 Active Sprint — Stabilize Core Primitives

### 🔴 P0: Platform Foundations

#### US-003: Firecrawl Adapter Consolidation (Ticket #1)

**Priority:** P0 | **Effort:** M | **Module:** platform/firecrawl

- [ ] Move all Firecrawl calls into `platform/firecrawl-service` with centralized logging, retries, and rate limiting
- [ ] Add fallback URL attempts (primary → /about → /team → /company) with exponential backoff
- [ ] Reject empty/erroneous extractions with structured error reporting
- [ ] Add unit tests for success/empty/error paths

**Acceptance Criteria:**

- All routes/workflows call the shared adapter only
- Empty responses are treated as failures and logged with context
- Backoff and fallback order verified in tests

---

#### US-006: Unified LLM Provider (Ticket #2)

**Priority:** P0 | **Effort:** M | **Module:** platform/llm-service

- [ ] Centralize provider creation with Anthropic/OpenAI/Groq support and streaming
- [ ] Add schema validation + markdown fence stripping for all model outputs
- [ ] Implement retry and Safe Mode fallbacks on validation failure
- [ ] Add harness comparing providers against shared schemas

**Acceptance Criteria:**

- All LLM calls use the unified provider
- Responses validated against Zod schemas with retries
- Safe Mode path exercised in tests

---

#### US-001: Enrich Workflow Guardrails (Ticket #3)

**Priority:** P0 | **Effort:** M | **Module:** daedalus/enrich

- [ ] Enforce distinct entry points for profile vs company enrichment with explicit competitive toggle
- [ ] Add Safe Mode plan (discovery + profile only) on planning failure
- [ ] Validate all API inputs/outputs via schemas before DB writes
- [ ] Add CSV path checks: job state, row-level errors, export parity

**Acceptance Criteria:**

- Default company enrichment excludes competitive analysis unless flagged
- Safe Mode never crashes and logs degraded runs
- Stored rows are schema-validated; CSV exports match dashboard

---

#### US-007: API Thin Adapter Audit (Ticket #4)

**Priority:** P0 | **Effort:** S | **Module:** app/api

- [ ] Verify `/api/enrich`, `/api/enrich/stream`, `/api/extract`, `/api/observe`, `/api/scouts`, `/api/agent` use auth + Zod + usage gating
- [ ] Remove or redirect any prototype/legacy endpoints outside the canonical surface
- [ ] Add consistent error responses and logging

**Acceptance Criteria:**

- All canonical routes follow auth → validate → enforce limits → dispatch pattern
- No dead prototype endpoints reachable
- Error formats consistent across primitives

---

#### US-004: Observe Reliability (Ticket #5)

**Priority:** P0 | **Effort:** S | **Module:** daedalus/observe

- [ ] Persist content hashes and before/after snapshots for monitors
- [ ] Generate diffs and AI summaries on change
- [ ] Deliver notifications (email/webhook) with guardrails for noise

**Acceptance Criteria:**

- Monitor runs store hash + content per execution
- Diffs and summaries generated for changes only
- Notifications fire once per detected change with suppression controls

---

#### US-005: Scout Dedup & Scheduling (Ticket #6)

**Priority:** P0 | **Effort:** S | **Module:** daedalus/scout

- [ ] Enforce `seen_urls` deduplication per user
- [ ] Ensure scheduled runs persist findings and emit only new results
- [ ] Add tests for query variants and pagination

**Acceptance Criteria:**

- No duplicate URLs emitted across runs for the same scout
- Scheduled jobs produce stored findings and notifications
- Tests cover dedup and pagination edge cases

---

#### US-001: Data Quality Metrics & Alerts (Ticket #7)

**Priority:** P0 | **Effort:** S | **Module:** monitoring

- [ ] Track extraction success rate, enrichment field population, and LLM fallback usage
- [ ] Define thresholds and alert channels (Slack/email)
- [ ] Build lightweight dashboard for real-time metrics

**Acceptance Criteria:**

- Metrics emitted per primitive with 1h rolling windows
- Alerts trigger below thresholds with low false positives
- Dashboard shows per-domain/per-user breakdowns

---

### 🟡 P1: Experience & Conversion

#### US-001: CSV Enrichment Flow (Ticket #8)

**Priority:** P1 | **Effort:** M | **Module:** enrich

- [ ] Improve CSV upload → job status → export UX
- [ ] Validate row-level errors and surface them in UI
- [ ] Ensure exports match stored enrichment results

**Acceptance Criteria:**

- Users can upload, monitor progress, and export in one session
- Row errors visible with actionable messages
- Export fidelity ≥ dashboard display

---

#### US-005: Cross-Primitive CTAs (Ticket #9)

**Priority:** P1 | **Effort:** S | **Module:** integration

- [ ] Add "Create Scout" and "Create Monitor" from Enrich and Brand views with prefilled context
- [ ] Add "Generate Asset Pack" from brand/enrich outputs

**Acceptance Criteria:**

- One-click CTA opens prefilled forms; user can edit before save
- Scout/monitor creations persist and schedule correctly
- Asset pack generation respects brand identity inputs

---

#### US-003: Brand Asset Generation (Ticket #10)

**Priority:** P1 | **Effort:** L | **Module:** brand (extract + enrich)

- [ ] Use extracted brand identity (colors, fonts, voice) to generate email, landing, and social templates
- [ ] Provide preview + export (HTML/Markdown/text)

**Acceptance Criteria:**

- 3+ asset types generated with brand-consistent styling
- Exports downloadable and match previews

---

#### US-006: Research Split-View Reliability (Ticket #11)

**Priority:** P1 | **Effort:** M | **Module:** agent/research

- [ ] Ensure streaming "thinking/answer/sources" stays in sync across providers
- [ ] Add citation tracking and fallback when a tool fails

**Acceptance Criteria:**

- Streams remain aligned; no orphaned tool results
- Sources list maps to cited text; fallback path logged

---

#### US-007: Settings & Billing (GEO) (Ticket #12)

**Priority:** P1 | **Effort:** L | **Module:** platform/auth/billing

---

#### US-002: Single Lead Enrichment Flow (Ticket #19)

**Priority:** P1 | **Effort:** S | **Module:** enrich

- [ ] Implement single-lead input UX (email, name, or domain) wired into enrich workflow
- [ ] Validate inputs and surface inline errors for invalid or incomplete data
- [ ] Ensure single-lead enrichment writes to the same tables as CSV jobs with consistent schemas
- [ ] Expose single-lead enrichment entry points from relevant UI surfaces (e.g., dashboards or detail views)

**Acceptance Criteria:**

- Users can enrich a single lead from email, name, or domain without leaving the app
- Single-lead enrich results match CSV enrich behavior and schemas
- Errors are clearly surfaced and do not break the overall session

---

#### US-003: Brand Identity Extract Core (Ticket #20)

**Priority:** P1 | **Effort:** M | **Module:** extract

- [ ] Implement core brand identity extraction pipeline from a URL (logo, colors, fonts, voice, key messages)
- [ ] Define and validate a Zod schema for structured brand identity output
- [ ] Wire extraction to a UI surface that displays structured brand identity for a given URL
- [ ] Ensure extract behavior is stateless and does not couple to enrichment or scouting flows

**Acceptance Criteria:**

- Given a valid brand URL, users can see a structured brand identity (logo, colors, fonts, voice, key messages)
- Brand identity output conforms to the defined schema with no critical fields silently omitted
- Extract runs are stateless and do not alter enrichment, observe, or scout primitives

- [ ] Implement settings page for account, notifications, API keys
- [ ] Integrate Stripe customer portal and usage display
- [ ] Enforce plan gating across primitives using usage_events

**Acceptance Criteria:**

- Users can self-serve account + billing updates
- Usage and limits visible per plan tier
- Gating enforced consistently on API routes

---

### 🟢 P2: Platform & Observability

#### US-007: End-to-End Tracing (Ticket #13)

**Priority:** P2 | **Effort:** M | **Module:** monitoring

- [ ] Add request-level tracing from API → LLM → DB → Firecrawl
- [ ] Publish latency/error dashboards per primitive

**Acceptance Criteria:**

- Traces available for all canonical routes
- P95 latency and error rates visible with alerts

---

#### US-007: Feature Flags & Gradual Rollouts (Ticket #14)

**Priority:** P2 | **Effort:** S | **Module:** devops

- [ ] Integrate feature flag provider
- [ ] Add percentage rollouts for risky remediation features
- [ ] Provide admin override UI

**Acceptance Criteria:**

- Flags controllable without redeploy
- 1%→10%→50%→100% rollout supported
- Flag state visible to admins

---

#### US-001: Segmentation & ICP Scoring (Ticket #15)

**Priority:** P2 | **Effort:** L | **Module:** enrich/research

- [ ] Integrate external data (Exa/Clearbit) for ICP signals
- [ ] Add scoring model and surface scores in enrich results

**Acceptance Criteria:**

- Scores computed with source attribution
- Toggleable enrichment step; does not block core run

---

#### US-007: Usage-Based Credits (Optional Layer) (Ticket #16)

**Priority:** P2 | **Effort:** L | **Module:** billing

- [ ] Design credits schema and deduction rules per primitive
- [ ] Add top-up flow via Stripe and balance display

**Acceptance Criteria:**

- Credits deducted predictably per operation
- Webhook updates balance; UI reflects real-time state

---

### ⚪ P3: Future Considerations

#### US-006: Counter Ops Response Tools (Ticket #17)

**Priority:** P3 | **Effort:** TBD | **Module:** agent

- [ ] Prototype agent-driven response playbooks when competitors ship changes

**Acceptance Criteria:**

- Draft responses generated with sources and safety checks

---

#### US-007: Marketplace Extensions (Ticket #18)

**Priority:** P3 | **Effort:** TBD | **Module:** platform

- [ ] Define governance for third-party modules using extract/observe/scout primitives
- [ ] Pilot one external module with sandboxed execution

**Acceptance Criteria:**

- Clear contract for third-party tools; sandbox boundaries enforced

---
