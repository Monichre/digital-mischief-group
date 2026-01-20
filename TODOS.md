# Project Tickets - Daedalus Platform

**Last Updated:** 2026-01-20

This is the canonical ticket backlog for Digital Mischief Group. All active work is tracked here with checkboxes for manual progress tracking.

**Total Tickets:** 18

**Legend:**
- `🔴 P0` = Critical / Immediate
- `🟡 P1` = High Priority / Short-term
- `🟢 P2` = Medium Priority / Medium-term
- `⚪ P3` = Low Priority / Long-term

---

## 📋 Active Sprint — Stabilize Core Primitives

### 🔴 P0: Platform Foundations

#### Ticket #1: Firecrawl Adapter Consolidation
**Priority:** P0 | **Effort:** 3 days | **Module:** platform/firecrawl

- [ ] Move all Firecrawl calls into `platform/firecrawl-service` with centralized logging, retries, and rate limiting
- [ ] Add fallback URL attempts (primary → /about → /team → /company) with exponential backoff
- [ ] Reject empty/erroneous extractions with structured error reporting
- [ ] Add unit tests for success/empty/error paths

**Acceptance Criteria:**
- All routes/workflows call the shared adapter only
- Empty responses are treated as failures and logged with context
- Backoff and fallback order verified in tests

---

#### Ticket #2: Unified LLM Provider
**Priority:** P0 | **Effort:** 3 days | **Module:** platform/llm-service

- [ ] Centralize provider creation with Anthropic/OpenAI/Groq support and streaming
- [ ] Add schema validation + markdown fence stripping for all model outputs
- [ ] Implement retry and Safe Mode fallbacks on validation failure
- [ ] Add harness comparing providers against shared schemas

**Acceptance Criteria:**
- All LLM calls use the unified provider
- Responses validated against Zod schemas with retries
- Safe Mode path exercised in tests

---

#### Ticket #3: Enrich Workflow Guardrails
**Priority:** P0 | **Effort:** 3 days | **Module:** daedalus/enrich

- [ ] Enforce distinct entry points for profile vs company enrichment with explicit competitive toggle
- [ ] Add Safe Mode plan (discovery + profile only) on planning failure
- [ ] Validate all API inputs/outputs via schemas before DB writes
- [ ] Add CSV path checks: job state, row-level errors, export parity

**Acceptance Criteria:**
- Default company enrichment excludes competitive analysis unless flagged
- Safe Mode never crashes and logs degraded runs
- Stored rows are schema-validated; CSV exports match dashboard

---

#### Ticket #4: API Thin Adapter Audit
**Priority:** P0 | **Effort:** 2 days | **Module:** app/api

- [ ] Verify `/api/enrich`, `/api/enrich/stream`, `/api/extract`, `/api/observe`, `/api/scouts`, `/api/agent` use auth + Zod + usage gating
- [ ] Remove or redirect any prototype/legacy endpoints outside the canonical surface
- [ ] Add consistent error responses and logging

**Acceptance Criteria:**
- All canonical routes follow auth → validate → enforce limits → dispatch pattern
- No dead prototype endpoints reachable
- Error formats consistent across primitives

---

#### Ticket #5: Observe Reliability
**Priority:** P0 | **Effort:** 2 days | **Module:** daedalus/observe

- [ ] Persist content hashes and before/after snapshots for monitors
- [ ] Generate diffs and AI summaries on change
- [ ] Deliver notifications (email/webhook) with guardrails for noise

**Acceptance Criteria:**
- Monitor runs store hash + content per execution
- Diffs and summaries generated for changes only
- Notifications fire once per detected change with suppression controls

---

#### Ticket #6: Scout Dedup & Scheduling
**Priority:** P0 | **Effort:** 2 days | **Module:** daedalus/scout

- [ ] Enforce `seen_urls` deduplication per user
- [ ] Ensure scheduled runs persist findings and emit only new results
- [ ] Add tests for query variants and pagination

**Acceptance Criteria:**
- No duplicate URLs emitted across runs for the same scout
- Scheduled jobs produce stored findings and notifications
- Tests cover dedup and pagination edge cases

---

#### Ticket #7: Data Quality Metrics & Alerts
**Priority:** P0 | **Effort:** 2 days | **Module:** monitoring

- [ ] Track extraction success rate, enrichment field population, and LLM fallback usage
- [ ] Define thresholds and alert channels (Slack/email)
- [ ] Build lightweight dashboard for real-time metrics

**Acceptance Criteria:**
- Metrics emitted per primitive with 1h rolling windows
- Alerts trigger below thresholds with low false positives
- Dashboard shows per-domain/per-user breakdowns

---

### 🟡 P1: Experience & Conversion

#### Ticket #8: CSV Enrichment Flow
**Priority:** P1 | **Effort:** 3 days | **Module:** enrich

- [ ] Improve CSV upload → job status → export UX
- [ ] Validate row-level errors and surface them in UI
- [ ] Ensure exports match stored enrichment results

**Acceptance Criteria:**
- Users can upload, monitor progress, and export in one session
- Row errors visible with actionable messages
- Export fidelity ≥ dashboard display

---

#### Ticket #9: Cross-Primitive CTAs
**Priority:** P1 | **Effort:** 2 days | **Module:** integration

- [ ] Add "Create Scout" and "Create Monitor" from Enrich and Brand views with prefilled context
- [ ] Add "Generate Asset Pack" from brand/enrich outputs

**Acceptance Criteria:**
- One-click CTA opens prefilled forms; user can edit before save
- Scout/monitor creations persist and schedule correctly
- Asset pack generation respects brand identity inputs

---

#### Ticket #10: Brand Asset Generation
**Priority:** P1 | **Effort:** 4 days | **Module:** brand (extract + enrich)

- [ ] Use extracted brand identity (colors, fonts, voice) to generate email, landing, and social templates
- [ ] Provide preview + export (HTML/Markdown/text)

**Acceptance Criteria:**
- 3+ asset types generated with brand-consistent styling
- Exports downloadable and match previews

---

#### Ticket #11: Research Split-View Reliability
**Priority:** P1 | **Effort:** 3 days | **Module:** agent/research

- [ ] Ensure streaming "thinking/answer/sources" stays in sync across providers
- [ ] Add citation tracking and fallback when a tool fails

**Acceptance Criteria:**
- Streams remain aligned; no orphaned tool results
- Sources list maps to cited text; fallback path logged

---

#### Ticket #12: Settings & Billing (GEO)
**Priority:** P1 | **Effort:** 4 days | **Module:** platform/auth/billing

- [ ] Implement settings page for account, notifications, API keys
- [ ] Integrate Stripe customer portal and usage display
- [ ] Enforce plan gating across primitives using usage_events

**Acceptance Criteria:**
- Users can self-serve account + billing updates
- Usage and limits visible per plan tier
- Gating enforced consistently on API routes

---

### 🟢 P2: Platform & Observability

#### Ticket #13: End-to-End Tracing
**Priority:** P2 | **Effort:** 3 days | **Module:** monitoring

- [ ] Add request-level tracing from API → LLM → DB → Firecrawl
- [ ] Publish latency/error dashboards per primitive

**Acceptance Criteria:**
- Traces available for all canonical routes
- P95 latency and error rates visible with alerts

---

#### Ticket #14: Feature Flags & Gradual Rollouts
**Priority:** P2 | **Effort:** 2 days | **Module:** devops

- [ ] Integrate feature flag provider
- [ ] Add percentage rollouts for risky remediation features
- [ ] Provide admin override UI

**Acceptance Criteria:**
- Flags controllable without redeploy
- 1%→10%→50%→100% rollout supported
- Flag state visible to admins

---

#### Ticket #15: Segmentation & ICP Scoring
**Priority:** P2 | **Effort:** 4 days | **Module:** enrich/research

- [ ] Integrate external data (Exa/Clearbit) for ICP signals
- [ ] Add scoring model and surface scores in enrich results

**Acceptance Criteria:**
- Scores computed with source attribution
- Toggleable enrichment step; does not block core run

---

#### Ticket #16: Usage-Based Credits (Optional Layer)
**Priority:** P2 | **Effort:** 4 days | **Module:** billing

- [ ] Design credits schema and deduction rules per primitive
- [ ] Add top-up flow via Stripe and balance display

**Acceptance Criteria:**
- Credits deducted predictably per operation
- Webhook updates balance; UI reflects real-time state

---

### ⚪ P3: Future Considerations

#### Ticket #17: Counter Ops Response Tools
**Priority:** P3 | **Effort:** TBD | **Module:** agent

- [ ] Prototype agent-driven response playbooks when competitors ship changes

**Acceptance Criteria:**
- Draft responses generated with sources and safety checks

---

#### Ticket #18: Marketplace Extensions
**Priority:** P3 | **Effort:** TBD | **Module:** platform

- [ ] Define governance for third-party modules using extract/observe/scout primitives
- [ ] Pilot one external module with sandboxed execution

**Acceptance Criteria:**
- Clear contract for third-party tools; sandbox boundaries enforced

---

## ✅ Completed Tickets

_Completed tickets will be moved here with completion dates_

---

## 📝 Ticket Workflow

**Creating Tickets:**
1. Add new ticket under appropriate priority section
2. Include: Title, Priority, Effort estimate, Module, Description, Acceptance Criteria
3. Assign ticket number sequentially

**Working on Tickets:**
1. Check box when starting work
2. Move to "In Progress" section if needed
3. Update with blockers or notes inline

**Completing Tickets:**
1. Verify all acceptance criteria met
2. Move to "Completed Tickets" section
3. Add completion date
4. Update related documentation

**Ticket States:**
- Unchecked `[ ]` = To Do
- Checked `[x]` = In Progress or Done (clarify with section)
- Moved to Completed = Done with date

---

**Next Review:** Weekly sprint planning
**Last Sprint Completion:** TBD
