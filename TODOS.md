# Project Tickets - Firecrawl Intelligence Suite

**Last Updated:** 2026-01-10

This is the canonical ticket backlog for Digital Mischief Group. All active work is tracked here with checkboxes for manual progress tracking.

**Total Tickets:** 27

**Legend:**
- `🔴 P0` = Critical / Immediate
- `🟡 P1` = High Priority / Short-term
- `🟢 P2` = Medium Priority / Medium-term
- `⚪ P3` = Low Priority / Long-term

---

## 📋 Active Sprint - Data Quality & Reliability

### 🔴 P0: LLM Integration & Validation

#### Ticket #1: LLM Response Validation
**Priority:** P0 | **Effort:** 3 days | **Module:** Core/Agents

- [ ] Add strict JSON schema validation in `lib/agents/llm-provider.ts`
- [ ] Implement markdown fence stripping with error handling
- [ ] Add retry logic for malformed JSON responses with guardrails
- [ ] Update conductor to handle validation failures gracefully

**Acceptance Criteria:**
- All LLM responses validated against Zod schemas
- Malformed responses retry up to 3 times
- Clear error messages logged for debugging

---

#### Ticket #2: Multi-LLM Compatibility Testing
**Priority:** P0 | **Effort:** 2 days | **Module:** Core/Agents

- [ ] Create `scripts/test-llm-compatibility.ts` test harness
- [ ] Run identical prompts through Anthropic (Claude 3.5 Sonnet)
- [ ] Run identical prompts through OpenRouter (GPT-4)
- [ ] Validate both responses against `DiscoveryResultSchema`
- [ ] Document expected JSON shape and edge cases

**Acceptance Criteria:**
- Test harness covers all agent types (discovery, profile, funding, tech)
- Both providers return valid, schema-compliant responses
- Edge cases documented in `/docs/code/llm-compatibility.md`

---

### 🔴 P0: Firecrawl Robustness

#### Ticket #3: Firecrawl Extraction Validation
**Priority:** P0 | **Effort:** 2 days | **Module:** Firecrawl Client

- [ ] Add extraction validation in `lib/firecrawl/client.ts`
- [ ] Reject empty or null extractions as errors
- [ ] Log extraction failures with context (domain, job ID)
- [ ] Add structured logging for success/empty/error cases

**Acceptance Criteria:**
- Empty extractions never treated as success
- All failures logged with structured data
- Metrics available for monitoring extraction success rate

---

#### Ticket #4: URL Fallback Strategy
**Priority:** P0 | **Effort:** 3 days | **Module:** Firecrawl Client

- [ ] Implement fallback URL attempts when primary fails
- [ ] Try `{url}/about` on primary failure
- [ ] Try `{url}/team` if about fails
- [ ] Try `{url}/company` as final fallback
- [ ] Add retry mechanism with exponential backoff

**Acceptance Criteria:**
- Up to 4 URLs attempted per domain (primary + 3 fallbacks)
- Exponential backoff: 1s, 2s, 4s between retries
- First successful extraction returned immediately
- All attempts logged for analysis

---

#### Ticket #5: Firecrawl Monitoring & Alerts
**Priority:** P0 | **Effort:** 2 days | **Module:** Monitoring

- [ ] Define extraction success rate threshold (target: >70%)
- [ ] Define field population rate threshold (target: >75%)
- [ ] Implement threshold-based alerts
- [ ] Create dashboard for real-time extraction metrics
- [ ] Set up alert channels (Slack/email)

**Acceptance Criteria:**
- Alerts trigger when success rate drops below 70% over 1-hour window
- Dashboard shows extraction metrics by domain and agent
- Alert fatigue minimized with proper thresholds

---

### 🔴 P0: Enrich Data Quality

#### Ticket #6: Batch Data Mapping Refactor
**Priority:** P0 | **Effort:** 3 days | **Module:** Enrich

- [ ] Remove `|| {}` pattern from `app/api/enrich/batch/stream/route.ts`
- [ ] Create `EnrichedResultSchema` Zod schema
- [ ] Validate all payloads before database writes
- [ ] Define null vs undefined strategy in docs
- [ ] Add unit tests for mapping function

**Acceptance Criteria:**
- No unexpected null/undefined in stored rows
- All writes validated against schema
- Backwards compatible with existing CSV exports
- >95% test coverage for mapping logic

---

#### Ticket #7: Personal Site Detection Enhancement
**Priority:** P0 | **Effort:** 3 days | **Module:** Agents/Custom Fields

- [ ] Implement multi-signal detection in `lib/agents/custom-fields.ts`
- [ ] Add employee count heuristic (1-2 = likely personal)
- [ ] Add URL pattern matching (portfolio, hire-me, etc.)
- [ ] Add content keyword detection
- [ ] Add social/profile link analysis
- [ ] Create test fixtures in `tests/fixtures/personal-sites.ts`
- [ ] Add `tests/personal-site-detection.test.ts`

**Acceptance Criteria:**
- False positive rate <5%
- Personal site detection accuracy ≥90%
- 20+ test cases covering edge cases

---

#### Ticket #8: Conductor Planning Fallbacks
**Priority:** P0 | **Effort:** 2 days | **Module:** Conductor

- [ ] Add fallback logic when LLM planning fails in `lib/agents/conductor.ts`
- [ ] Define "Safe Mode" plan (discovery + profile only)
- [ ] Skip expensive/non-critical agents in Safe Mode
- [ ] Add unit tests for planning error paths
- [ ] Document fallback behavior

**Acceptance Criteria:**
- Never crashes on planning failure
- Safe Mode runs essential agents only
- Clear logs when fallback triggered
- User notified of degraded enrichment

---

### 🔴 P0: Testing & Verification

#### Ticket #9: Comprehensive Regression Tests
**Priority:** P0 | **Effort:** 4 days | **Module:** Testing

- [ ] Add response validation guards for all conductor LLM calls
- [ ] Test both Anthropic and OpenRouter providers
- [ ] Add unit tests for data mapping (enrichment -> DB)
- [ ] Add unit tests for Firecrawl client (success/empty/error)
- [ ] Add unit tests for multi-phase orchestration
- [ ] Run test suite on staging before production deploy

**Acceptance Criteria:**
- >80% code coverage for critical paths
- All tests pass on both LLM providers
- Staging validation completes successfully

---

#### Ticket #10: Enrich Smoke Tests
**Priority:** P0 | **Effort:** 1 day | **Module:** Enrich

- [ ] Run enrichment on Stripe, Shopify, 5 other known companies
- [ ] Verify expected fields populated correctly
- [ ] Implement CSV export from dashboard
- [ ] Test export with 10, 100, 1000 row datasets

**Acceptance Criteria:**
- Known companies return >75% field population
- CSV export works for all dataset sizes
- Exported data matches dashboard display

---

#### Ticket #11: Security Audit
**Priority:** P0 | **Effort:** 1 day | **Module:** Security

- [ ] Rotate any compromised API keys (xAI, Stripe test, etc.)
- [ ] Verify `.env*` excluded in `.gitignore`
- [ ] Add pre-commit hook for secret scanning
- [ ] Create auth/billing test checklist or Playwright test

**Test Coverage:**
- [ ] Sign-up flow
- [ ] Upgrade to Pro
- [ ] Verify DB and Stripe state sync
- [ ] Downgrade/cancellation flow

**Acceptance Criteria:**
- No secrets in git history
- Pre-commit hook catches common secret patterns
- Auth/billing E2E test passes

---

## 🟡 Short-Term Tickets (2-4 Weeks)

### 🟡 P1: Product Features

#### Ticket #12: Brand Asset Generation
**Priority:** P1 | **Effort:** 5 days | **Module:** Brand

- [ ] Design asset generation UI in brand recon results
- [ ] Implement email template generation using brand data
- [ ] Implement landing page generation using brand data
- [ ] Implement social post generation using brand data
- [ ] Add preview and export functionality

**Acceptance Criteria:**
- Users can generate 3+ asset types from brand recon
- Assets reflect extracted brand identity (colors, fonts, voice)
- Export as HTML, Markdown, or plain text

---

#### Ticket #13: Cross-Module Integration
**Priority:** P1 | **Effort:** 3 days | **Module:** Integration

- [ ] Add "Create Scout" CTA from Enrich results
- [ ] Add "Create Monitor" CTA from Enrich results
- [ ] Add "Create Scout" CTA from Brand Recon results
- [ ] Add "Create Monitor" CTA from Brand Recon results
- [ ] Pre-fill scout/monitor forms with context

**Acceptance Criteria:**
- One-click creation from all result pages
- Context (company name, URL) pre-populated
- User can customize before saving

---

#### Ticket #14: Settings Page
**Priority:** P1 | **Effort:** 4 days | **Module:** Dashboard

- [ ] Design Settings page layout
- [ ] Implement Account section (email, name, password)
- [ ] Implement Billing section (plan, usage, invoices)
- [ ] Implement Notifications section (email preferences)
- [ ] Implement API Keys section (if applicable)
- [ ] Add Stripe Customer Portal integration

**Acceptance Criteria:**
- Users can update account details
- Users can view billing history
- Users can manage notification preferences
- Self-serve subscription changes via Stripe portal

---

#### Ticket #15: API Performance
**Priority:** P1 | **Effort:** 3 days | **Module:** API

- [ ] Implement response caching for enrichment API
- [ ] Implement response caching for research API
- [ ] Implement response caching for brand recon API
- [ ] Add rate limiting to expensive endpoints
- [ ] Add cache invalidation strategy

**Acceptance Criteria:**
- Identical requests return cached responses (5min TTL)
- Rate limits: 10 req/min for free, 100 req/min for pro
- Cache hit rate >60% after 1 week

---

#### Ticket #16: E2E Test Suite
**Priority:** P1 | **Effort:** 5 days | **Module:** Testing

- [ ] Set up Playwright test environment
- [ ] CSV upload → enrichment → export test
- [ ] Brand recon job → report view test
- [ ] Scout creation → scheduled run → notification test
- [ ] Monitor creation → change detection → notification test
- [ ] Research assistant session with streaming test

**Acceptance Criteria:**
- All critical user journeys covered
- Tests run in CI/CD pipeline
- <5 minute total test execution time

---

#### Ticket #17: Exa SDK Integration
**Priority:** P1 | **Effort:** 2 days | **Module:** Research/Integration

- [ ] Install `exa-js` official TypeScript SDK
- [ ] Create `lib/exa/client.ts` wrapper following Firecrawl pattern
- [ ] Refactor `app/api/research/[id]/run/route.ts` to use SDK
- [ ] Remove raw `fetch` calls to Exa API (lines 73-110)
- [ ] Add proper error handling and retry logic
- [ ] Update type definitions for Exa responses
- [ ] Document usage in `docs/rules/EXA_TYPESCRIPT_SDK_RULES.md`

**Acceptance Criteria:**
- Exa SDK installed and configured
- All Exa API calls use SDK instead of raw fetch
- Error handling matches Firecrawl client pattern
- Type safety for all Exa operations
- Existing research functionality unchanged

---

#### Ticket #18: Remove Dead Enrich Prototype Code
**Priority:** P1 | **Effort:** 1 day | **Module:** Code Quality/Cleanup

- [ ] Delete `src/app/api/ai/enrich/route.ts` (prototype endpoint)
- [ ] Delete `src/components/ai/EnrichForm.tsx` (unused component)
- [ ] Verify no other references to `/api/ai/enrich` exist
- [ ] Update DIRECTORY_TREE.md if needed
- [ ] Document removal in cleanup notes

**Context**: Duplicate enrich systems exist from early prototyping:
- `/api/ai/enrich` - Simple prototype (68 lines, no auth, no DB, dead code)
- `/api/enrich` - Production system (243 lines, multi-agent, Firecrawl, persistence)

The prototype endpoint and its unused React component (`EnrichForm.tsx`) are never imported or used anywhere in the application.

**Acceptance Criteria:**
- Both dead files removed from codebase
- No broken imports or references
- Production `/api/enrich` system unaffected
- Code coverage improved (less dead code)

---

#### Ticket #19: Repository Restructure
**Priority:** P1 | **Effort:** 3-4 weeks | **Module:** Architecture/Code Quality

**Goal**: Transform flat `src/lib/` structure into layered, domain-driven architecture

- [ ] **Phase 1: Platform Foundation** (Week 1)
  - [ ] Create `platform/auth/`, `platform/db/`, `platform/billing/`, `platform/cache/`
  - [ ] Move auth files from `lib/` to `platform/auth/`
  - [ ] Move database from `lib/db/` to `platform/db/`
  - [ ] Move billing from `lib/stripe/` to `platform/billing/`
  - [ ] Move cache from `lib/redis.ts` to `platform/cache/`
  - [ ] Update all imports for platform layer
  - [ ] Verify builds and tests pass

- [ ] **Phase 2: Shared Utilities** (Week 1)
  - [ ] Create `shared/utils/`, `shared/types/`, `shared/schemas/`
  - [ ] Move `lib/utils.ts` to `shared/utils/`
  - [ ] Extract common types to `shared/types/`
  - [ ] Update imports for shared layer
  - [ ] Verify builds and tests pass

- [ ] **Phase 3: Services Layer** (Week 2)
  - [ ] Create `services/enrichment/` structure
  - [ ] Move all agent files from `lib/agents/` to `services/enrichment/`
  - [ ] Organize agents into `services/enrichment/agents/`
  - [ ] Update all imports for services layer
  - [ ] Verify enrichment workflow works end-to-end

- [ ] **Phase 4: Features Migration** (Week 2-3)
  - [ ] Migrate Enrich feature (components, hooks, types)
  - [ ] Migrate Research feature (components, types)
  - [ ] Migrate Scouts feature (components, types)
  - [ ] Migrate Brand Recon feature (components, types)
  - [ ] Update imports for each feature
  - [ ] Verify each feature works end-to-end

- [ ] **Phase 5: Cleanup** (Week 3)
  - [ ] Delete empty `lib/` subdirectories
  - [ ] Clean up `components/` (remove feature-specific)
  - [ ] Clean up `hooks/` (move to features or platform)
  - [ ] Update documentation (CLAUDE.md, PRD.md, PLAN.md)
  - [ ] Run full test suite across all modules
  - [ ] Remove dead code identified during migration

**Context**: Current `src/lib/` is a mixed bag of platform code, third-party adapters, feature logic, and orchestration. New structure provides clear separation:

```
src/
  app/          # Next.js router (thin wiring)
  features/     # Product modules (enrich, scouts, observe, etc.)
  services/     # Shared behaviors (enrichment orchestration)
  lib/          # Third-party adapters (firecrawl, exa, vercel-ai)
  platform/     # Foundations (auth, db, billing, cache, config)
  components/   # Shared UI primitives + effects
  shared/       # Cross-runtime types/schemas/utils (no React)
  hooks/        # Truly global hooks (rare)
  context/      # Truly global providers (rarer)
```

**Acceptance Criteria:**
- All platform code in `platform/` (auth, db, billing, cache)
- All third-party adapters in `lib/` (firecrawl, exa, vercel-ai)
- All feature code self-contained in `features/[feature]/`
- Enrichment orchestration in `services/enrichment/`
- Cross-runtime utilities in `shared/`
- Only shared UI in `components/`
- All imports updated and TypeScript compiles
- All tests passing
- Documentation updated with new structure
- No dead code or empty directories

**Documentation**: Full migration plan at `/docs/code/REPO_RESTRUCTURE_PLAN.md`

**Risk Mitigation:**
- Work in feature branch with frequent commits
- Run TypeScript check after each phase
- Test each feature after migration
- Keep rollback plan ready
- Update docs immediately after each phase

---

## 🟢 Medium-Term Tickets (1-2 Months)

### 🟢 P2: Platform Features

#### Ticket #19: Usage-Based Credits System
**Priority:** P2 | **Effort:** 1 week | **Module:** Billing

- [ ] Design credits schema (user_credits table)
- [ ] Implement credits deduction on usage
- [ ] Implement credits top-up via Stripe
- [ ] Add credits balance display in dashboard
- [ ] Add low-balance warnings
- [ ] Integrate with existing subscription tiers

**Acceptance Criteria:**
- Credits deducted correctly per operation type
- Stripe webhook updates credits on purchase
- Users can see real-time balance and history

---

#### Ticket #20: Enhanced Authentication
**Priority:** P2 | **Effort:** 3 days | **Module:** Auth

- [ ] Add email verification flow
- [ ] Implement Google OAuth sign-in
- [ ] Implement GitHub OAuth sign-in
- [ ] Add LinkedIn OAuth sign-in (optional)
- [ ] Update Better Auth configuration

**Acceptance Criteria:**
- Email verification required for new signups
- 3+ OAuth providers available
- Existing users can link OAuth accounts

---

#### Ticket #21: CRM Integration
**Priority:** P2 | **Effort:** 1 week | **Module:** Integration

- [ ] Design CRM export UI
- [ ] Implement HubSpot connector (OAuth + API)
- [ ] Implement Salesforce connector (OAuth + API)
- [ ] Add field mapping configuration
- [ ] Add sync status tracking
- [ ] Add error handling and retries

**Acceptance Criteria:**
- Users can export enriched leads to HubSpot/Salesforce
- Field mapping saved per user
- Sync errors displayed with actionable messages

---

#### Ticket #22: Observability Platform
**Priority:** P2 | **Effort:** 1 week | **Module:** Monitoring

- [ ] Implement request-level tracing for enrichment flows
- [ ] Implement request-level tracing for research flows
- [ ] Set up latency dashboards
- [ ] Set up error rate dashboards
- [ ] Add custom metrics for business KPIs
- [ ] Integrate with Sentry or similar APM

**Acceptance Criteria:**
- Full request traces from API → LLM → database
- P95 latency visible per endpoint
- Error rate alerts configured

---

## 📊 Monitoring & Metrics

### ⚪ P3: KPIs & Dashboards

#### Ticket #23: Data Quality KPIs
**Priority:** P3 | **Effort:** 3 days | **Module:** Analytics

- [ ] Define KPI tracking schema
- [ ] Implement Field Population Rate metric (target ≥75%)
- [ ] Implement Data Accuracy metric (target ≥90%)
- [ ] Implement Personal Site Detection metric (target ≥90%)
- [ ] Implement Enrichment Success Rate metric (target ≥85%)
- [ ] Implement LLM Fallback Success metric (target ≥95%)
- [ ] Implement Firecrawl Extraction Rate metric (target ≥80%)
- [ ] Build dashboard to display all KPIs

**Acceptance Criteria:**
- All 6 KPIs tracked in real-time
- Historical trends visible (7d, 30d, 90d)
- Exportable reports for stakeholders

---

#### Ticket #24: Regression Alerts
**Priority:** P3 | **Effort:** 2 days | **Module:** Monitoring

- [ ] Configure alerts for Field Population Rate <75%
- [ ] Configure alerts for Data Accuracy <90%
- [ ] Configure alerts for Enrichment Success <85%
- [ ] Configure alerts for Extraction Rate <80%
- [ ] Set rolling window thresholds (1h, 6h, 24h)
- [ ] Test alert channels (Slack/email)

**Acceptance Criteria:**
- Alerts fire within 5 minutes of threshold breach
- False positive rate <10%
- Clear actionable guidance in alert messages

---

#### Ticket #25: Feature Flags & Gradual Rollouts
**Priority:** P3 | **Effort:** 2 days | **Module:** DevOps

- [ ] Integrate feature flag system (LaunchDarkly or Flagsmith)
- [ ] Add feature flags for major remediation changes
- [ ] Implement percentage-based rollouts
- [ ] Add flag override UI for testing
- [ ] Document flag usage in runbooks

**Acceptance Criteria:**
- New features deployable to 1% → 10% → 50% → 100%
- Flags can be toggled without redeployment
- Flag status visible in admin dashboard

---

#### Ticket #26: Incident Runbooks
**Priority:** P3 | **Effort:** 3 days | **Module:** Documentation

- [ ] Document LLM parsing error runbook
- [ ] Document Firecrawl extraction failure runbook
- [ ] Document data mapping issue runbook
- [ ] Document personal site misclassification runbook
- [ ] Add runbooks to `/docs/code/runbooks/`
- [ ] Include diagnostic steps and resolution procedures

**Acceptance Criteria:**
- 4+ runbooks covering common failure modes
- Each includes: symptoms, diagnosis, resolution, prevention
- Runbooks tested during incident drills

---

#### Ticket #27: Lessons Learned Documentation
**Priority:** P3 | **Effort:** Ongoing | **Module:** Documentation

- [ ] Create post-mortem template
- [ ] Document data quality regression analysis findings
- [ ] Document Firecrawl reliability improvements
- [ ] Update runbooks based on real incidents
- [ ] Share learnings in team reviews

**Acceptance Criteria:**
- Post-mortem within 1 week of major incidents
- Action items tracked as tickets
- Runbooks updated within 2 weeks of learnings

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
