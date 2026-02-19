---
title: feat: Make It Run operations release
type: feat
status: active
date: 2026-02-18
---

# feat: Make It Run operations release

## Overview

Ship a focused operations-first release that makes Daedalus run autonomously and reliably by completing scheduler orchestration, strengthening notification consistency, finishing agent research UX fidelity, and extending cross-primitive CTAs across remaining surfaces.

This plan uses the approved brainstorm (`docs/brainstorms/2026-02-17-make-it-run-brainstorm.md`) and current repo state. Most foundations already exist; this release is primarily integration hardening and gap closure.

## Problem Statement

Daedalus already has implemented primitives, but key product behaviors remain fragmented:

1. Scheduled routes and workflow processors exist, but there is no pg_cron + pg_net dispatcher migration.
2. Email notifications exist in primitive modules, but there is no unified platform layer or complete testability surface.
3. Split-view research UI exists, but it lacks provider-agnostic reasoning token UX, inline citations, and conversational continuity.
4. Cross-primitive CTA components exist, but they are only wired in selected pages and miss some high-value transitions.
5. TypeScript is currently green (`bunx tsc --noEmit` reports `0` errors), so this item becomes a quality gate to preserve.

## Research Summary (Local)

- Scheduler API adapters already present:
  - `src/app/api/scouts/run-scheduled/route.ts:11`
  - `src/app/api/monitors/check-due/route.ts:11`
  - `CRON_SECRET` guard in both files (`:5` in each).
- Scheduler workflow processors already present:
  - `src/daedalus/scout/workflow.ts:295` (`processScheduledScouts`)
  - `src/daedalus/observe/workflow.ts:114` (`processDueMonitors`)
- No pg_cron/pg_net SQL yet in `scripts/migrations/`.
- Vercel cron is not configured (`vercel.json` has no `crons` key).
- Notifications are implemented:
  - Scout email sender: `src/daedalus/scout/notifications.ts:42`
  - Observe email/webhook sender: `src/daedalus/observe/notifications.ts:190`
- Split-view research page exists:
  - `src/app/(core)/research/live/page.tsx` with `ThinkingPanel`, `SourcePanel`, `SynthesisPanel`.
- Agent SSE pipeline already emits citation events:
  - `src/app/api/agent/route.ts:537` onward.
- Cross-primitive CTA component exists:
  - `src/components/cross-primitive-ctas/CrossPrimitiveCTAs.tsx`
  - Used in enrich and brand recon pages only.

## Scope

### In Scope

1. Neon pg_cron + pg_net dispatcher migration for Scout and Observe scheduled runs.
2. Notification system consolidation and completeness for Scout + Observe.
3. Agent split-view UX enhancements (reasoning/citations/multi-turn readiness via AI Gateway abstraction).
4. Cross-primitive CTA expansion to Scout, Observe, and Research surfaces.
5. TypeScript quality gate automation and regression prevention.

### Out of Scope

- New primitive creation.
- Billing/plan model redesign.
- CTA analytics instrumentation (explicitly deferred).
- Large visual redesign beyond required UX changes.

## SpecFlow Analysis (Gap and Edge Cases)

### 1) Scheduler Gap Analysis

- Gap: no DB-native dispatcher orchestration despite existing route/process code.
- Edge cases:
  - duplicate dispatch if cron overlaps.
  - hanging jobs with no terminal state.
  - CRON secret mismatch causing silent no-op.
  - Neon compute sleep misconfiguration.
- Required safeguards:
  - idempotent dispatcher query window.
  - stuck-run cleanup cron.
  - structured run metrics logging.

### 2) Notification Gap Analysis

- Gap: logic is spread across primitive modules; testing and consistency surface is uneven.
- Edge cases:
  - missing `RESEND_API_KEY` in production.
  - repeated noise notifications without cooldown.
  - notification payload too large for webhook consumers.
- Required safeguards:
  - central platform email client wrapper.
  - per-channel retry policy and failure logs.
  - payload normalization.

### 3) Agent UX Gap Analysis

- Gap: split layout exists, but lacks true provider-agnostic reasoning-token rendering and citation-linked UX.
- Edge cases:
  - provider stream shape mismatch.
  - source dedup collisions across tools.
  - partial stream completion.
- Required safeguards:
  - normalized stream event contract.
  - stable citation ID mapping.
  - recoverable UI state on stream interruption.

### 4) CTA Gap Analysis

- Gap: CTA entry points are incomplete across core result pages.
- Edge cases:
  - missing context fields (domain/url) for prefill.
  - creating duplicate monitors/scouts from repeated clicks.
  - navigation state loss after modal submit.
- Required safeguards:
  - context fallback resolution rules.
  - dedup checks at API layer.
  - consistent success/error toasts and redirects.

### 5) Type Safety Gap Analysis

- Current status: no TS compile errors.
- Gap: no standard typecheck script in package scripts.
- Required safeguards:
  - add `typecheck` script.
  - enforce on pre-merge CI.

## Proposed Solution

Implement this release in five phases with explicit verification gates.

## Technical Approach

### Architecture

```mermaid
flowchart LR
  A[pg_cron schedule] --> B[dispatch_due_scouts/dispatch_due_monitors SQL]
  B --> C[pg_net HTTP POST]
  C --> D[/api/scouts/run-scheduled]
  C --> E[/api/monitors/check-due]
  D --> F[daedalus/scout/workflow processScheduledScouts]
  E --> G[daedalus/observe/workflow processDueMonitors]
  F --> H[notification adapter]
  G --> H
  H --> I[Resend/Webhook]
```

### Implementation Phases

#### Phase 1: Scheduler Foundation (Scout + Observe)

Deliverables:

- `scripts/migrations/<timestamp>-add-pg-cron-dispatchers.sql`
  - enable extension checks
  - create dispatcher SQL functions
  - create cron schedule registrations
  - create stuck-run cleanup schedule
- Align scheduler constants and type definitions where inconsistent (e.g., schedule enum alignment).
- Add operational run logging for cron-triggered dispatches.

Pseudocode (file-scoped):

```sql
-- scripts/migrations/<timestamp>-add-pg-cron-dispatchers.sql
SELECT cron.schedule(
  'dispatch-due-scouts-every-minute',
  '* * * * *',
  $$SELECT net.http_post(
      url := current_setting('app.base_url') || '/api/scouts/run-scheduled',
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.cron_secret'))
  )$$
);
```

Acceptance criteria:

- [ ] Scheduled scouts dispatch without manual invocation.
- [ ] Scheduled monitors dispatch without manual invocation.
- [ ] Cleanup job marks stale running executions safely.
- [ ] Unauthorized dispatcher requests are rejected.

#### Phase 2: Notification Consolidation

Deliverables:

- Introduce platform notification adapter:
  - `src/platform/notifications/client.ts`
  - `src/platform/notifications/templates/*.ts`
  - `src/platform/notifications/types.ts`
- Migrate scout/observe notification senders to shared adapter while preserving existing behavior.
- Add explicit test endpoints for scout/observe notification checks (mirroring radar test route pattern).

Pseudocode (file-scoped):

```ts
// src/platform/notifications/client.ts
export async function sendEmailNotification(input: EmailNotificationInput): Promise<SendResult> {
  // provider-agnostic wrapper for Resend REST call
  // normalize template output, retries, and error mapping
}
```

Acceptance criteria:

- [ ] Scout notifications send only on new findings.
- [ ] Observe notifications respect cooldown and channel settings.
- [ ] Shared template system is used by both primitives.
- [ ] Notification failures are logged with structured context.

#### Phase 3: Agent Split-View Completion (AI Gateway)

Deliverables:

- Normalize reasoning token streams into a provider-agnostic event contract.
- Render true reasoning/thinking segments (not only status text) in `ThinkingPanel`.
- Bind inline synthesis citations to source panel anchors.
- Add multi-turn session continuity contract for `/research/live` (without breaking current single-run UX).

Pseudocode (file-scoped):

```ts
// src/daedalus/agent/research/stream-normalizer.ts
export function normalizeProviderReasoningEvent(raw: unknown): ResearchStreamEvent {
  // map Claude/OpenAI/AI Gateway reasoning formats to unified event payload
}
```

Acceptance criteria:

- [ ] Thinking panel displays normalized reasoning tokens.
- [ ] Citation markers in synthesis map to source panel entries.
- [ ] Stream interruptions preserve recoverable UI state.
- [ ] Existing `/api/agent` SSE contract remains backward-compatible.

#### Phase 4: Cross-Primitive CTA Expansion

Deliverables:

- Wire CTA surface into:
  - `src/app/(core)/scouts/[id]/page.tsx`
  - `src/app/(core)/observe/[id]/MonitorDetailClient.tsx`
  - `src/app/(core)/research/live/page.tsx`
- Add missing “Enrich this company” CTA path where context permits.
- Keep CTA analytics deferred.

Pseudocode (file-scoped):

```tsx
// src/app/(core)/scouts/[id]/page.tsx
<CrossPrimitiveCTAs
  context={{
    companyName: inferredCompany,
    website: topResultUrl,
    domain: inferredDomain,
  }}
/>
```

Acceptance criteria:

- [ ] Scout detail supports Monitor + Enrich transitions with prefill.
- [ ] Observe detail supports Scout + Enrich transitions where context exists.
- [ ] Research results support quick handoff into Extract/Enrich/Observe/Scout flows.
- [ ] CTA flows show success/failure feedback and preserve user context.

#### Phase 5: Typecheck Gate + Regression Guard

Deliverables:

- Add `typecheck` script to `package.json`.
- Update project validation checklist to include `bunx tsc --noEmit`.
- Ensure lint + typecheck pass for changed modules before merge.

Acceptance criteria:

- [ ] `bun run typecheck` passes in CI/local.
- [ ] No new TS regressions introduced while shipping phases 1-4.

## Alternative Approaches Considered

1. Vercel cron-only scheduling:
   - Rejected for now due approved canonical pg_cron + pg_net path on Neon.
2. Keep notification logic per primitive:
   - Rejected because it increases drift and testing fragmentation.
3. Agent UX rewrite from scratch:
   - Rejected because existing split-view foundation is strong and should be evolved, not replaced.

## Acceptance Criteria

### Functional Requirements

- [ ] Scheduler runs Scout and Observe automatically via pg_cron + pg_net.
- [ ] Notification delivery is reliable and shared through platform adapter.
- [ ] Agent split-view supports reasoning token rendering and citation linking.
- [ ] CTA coverage includes Scout, Observe, and Research pages.
- [ ] Typecheck remains green and enforced.

### Non-Functional Requirements

- [ ] Scheduler pathways are idempotent and auditable.
- [ ] No secret leakage in cron dispatch logs.
- [ ] Notification and stream errors are structured and traceable.
- [ ] Existing API contracts remain backward compatible.

### Quality Gates

- [ ] `bun run lint`
- [ ] `bunx tsc --noEmit`
- [ ] Targeted integration checks for:
  - scheduler dispatch auth and execution
  - notification send paths
  - agent streaming + citation mapping
  - CTA prefill and submit flows

## Success Metrics

- Scheduler reliability: >= 99% successful dispatch for due jobs over 7 days.
- Notification reliability: >= 98% successful email/webhook sends for eligible events.
- Agent UX: >= 95% completed research streams without orphaned state.
- CTA utility: >= 1 successful downstream action from each newly enabled surface in internal validation.
- Type safety: 0 TS errors on main branch.

## Dependencies & Prerequisites

1. Neon configuration (outside repo):
   - 24/7 compute enabled
   - `cron.database_name` configured
   - extension permissions for `pg_cron` and `pg_net`
2. Runtime secrets:
   - `CRON_SECRET`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
3. AI Gateway provider normalization contract for reasoning events.

## Risk Analysis & Mitigation

1. Risk: Duplicate scheduled executions.
   - Mitigation: lock-safe selection windows + execution status checks.
2. Risk: Notification fatigue/noise.
   - Mitigation: cooldown enforcement and payload relevance checks.
3. Risk: Provider stream incompatibility.
   - Mitigation: single normalization layer and contract tests.
4. Risk: CTA misuse causing duplicate entities.
   - Mitigation: server-side dedup and client-side guard states.

## Resource Requirements

- Backend engineer: scheduler + notifications consolidation.
- Frontend engineer: agent UX + CTA integration.
- QA support: scheduler/notification/stream regression scenarios.
- Infra access: Neon settings + secret management.

## Implementation Checklist (Trackable)

- [ ] Add scheduler migration file in `scripts/migrations/`.
- [ ] Add/adjust scheduler runtime config in `src/platform` if needed.
- [ ] Add notification adapter files in `src/platform/notifications/`.
- [ ] Refactor scout/observe notification modules to shared adapter.
- [ ] Add scout/observe notification test endpoints.
- [ ] Add stream normalization for reasoning events in `src/daedalus/agent/research/`.
- [ ] Add citation anchor mapping in `SynthesisPanel` + `SourcePanel` flow.
- [ ] Integrate CTAs into Scout detail page file.
- [ ] Integrate CTAs into Observe detail page file.
- [ ] Integrate CTAs into Research live page file.
- [ ] Add `typecheck` script in `package.json`.
- [ ] Run lint + typecheck + targeted validations.

## References & Research

### Internal References

- Scheduler API adapters:
  - `src/app/api/scouts/run-scheduled/route.ts:5`
  - `src/app/api/scouts/run-scheduled/route.ts:11`
  - `src/app/api/monitors/check-due/route.ts:5`
  - `src/app/api/monitors/check-due/route.ts:11`
- Scheduler processors:
  - `src/daedalus/scout/workflow.ts:280`
  - `src/daedalus/scout/workflow.ts:295`
  - `src/daedalus/observe/workflow.ts:97`
  - `src/daedalus/observe/workflow.ts:114`
- Notification implementations:
  - `src/daedalus/scout/notifications.ts:42`
  - `src/daedalus/observe/notifications.ts:28`
  - `src/daedalus/observe/notifications.ts:190`
- Agent streaming and citations:
  - `src/app/(core)/research/live/page.tsx:6`
  - `src/app/(core)/research/live/page.tsx:184`
  - `src/app/api/agent/route.ts:216`
  - `src/app/api/agent/route.ts:537`
- Cross-primitive CTA surface:
  - `src/components/cross-primitive-ctas/CrossPrimitiveCTAs.tsx:28`
  - `src/components/cross-primitive-ctas/CrossPrimitiveCTAs.tsx:664`
  - `src/app/(core)/brand-recon/page.tsx:213`
  - `src/app/(core)/enrich/page.tsx:830`
- Validation scripts:
  - `package.json:7`
  - `package.json:9`

### External References

- open-scouts scheduler pattern: `https://github.com/firecrawl/open-scouts`
- firecrawl-observer notifications pattern: `https://github.com/firecrawl/firecrawl-observer`
- open-researcher split-view pattern: `https://github.com/firecrawl/open-researcher`

### AI-Era Notes

- Planning inputs synthesized from:
  - approved brainstorm context
  - local repository pattern analysis
  - compile-state verification (`bunx tsc --noEmit`)
- Implementation should use rapid AI-assisted development with strict validator gates after each phase.
