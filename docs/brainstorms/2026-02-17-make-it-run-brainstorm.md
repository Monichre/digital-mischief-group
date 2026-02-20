# Brainstorm: Make It Run -- Next Release

**Date**: 2026-02-17
**Status**: Approved
**Approach**: A -- Operations-First

---

## What We're Building

Five high-impact improvements that take Daedalus from "manually triggered demo" to "autonomously operating platform." Every item maps directly to canonical behavior in the source repositories.

### 1. Scheduled Execution Infrastructure (pg_cron on Neon)

**Source**: [open-scouts](https://github.com/firecrawl/open-scouts) -- `pg_cron + pg_net + Edge Functions` dispatcher pattern

**What**: Adapt open-scouts' scalable dispatcher architecture to Neon + Vercel:
- Enable 24/7 Neon compute (disable scale-to-zero)
- Install `pg_cron` extension, set `cron.database_name`
- Create `dispatch_due_scouts()` SQL function that queries for due scouts and POSTs to `/api/scouts/run-scheduled` via `pg_net` (or Vercel Cron as fallback if pg_net is unavailable on Neon)
- Create `dispatch_due_monitors()` for Observe primitive
- Add stuck execution cleanup cron (every 5 minutes, per open-scouts)

**Neon-Specific Constraints**:
- pg_cron only runs while compute is active -- requires 24/7 compute
- `cron.schedule_in_database()` is NOT supported on Neon -- all cron jobs must target the same database
- Must set `cron.database_name` via compute endpoint settings and restart before enabling

**Confirmed**: pg_net IS available on Neon. Full canonical pattern: pg_cron (per-minute dispatch) + pg_net (HTTP POST to Vercel routes) + 24/7 compute enabled.

**Affected Primitives**: Scout, Observe

### 2. Email Notifications via Resend

**Source**: [open-scouts](https://github.com/firecrawl/open-scouts) -- HTML email alerts on scout findings; [firecrawl-observer](https://github.com/firecrawl/firecrawl-observer) -- email + webhook notifications on change detection

**What**: Complete the notification delivery pipeline:
- **Scout**: Send branded HTML email when a scout run finds new URLs (after deduplication)
- **Observe**: Send diff summary email when a monitor detects content changes
- **Templates**: Create HTML email templates in `src/platform/notifications/` using React Email or inline HTML (match open-scouts' approach)
- **User preferences**: Respect notification settings (email on/off, per-scout/monitor toggle)
- **Resend integration**: Already configured in env, wire up the `send()` calls

**Key Behavior from Source Repos**:
- Emails only sent when there ARE new findings (not on every run)
- Rich HTML with scout results, links, and AI summaries
- Test email button in Settings (open-scouts pattern)

**Affected Primitives**: Scout, Observe

### 3. Agent Split-View UI

**Source**: [open-researcher](https://github.com/firecrawl/open-researcher) -- `thinking-chat.tsx` component, split-view with thinking/answer/sources panels

**What**: Implement the canonical research agent UI:
- **Left panel**: Chat interface with user queries and AI responses
- **Right panel**: Sources panel showing scraped URLs, extracted content, tool calls
- **Thinking display**: Real-time streaming of AI reasoning (thinking tokens visible)
- **Citations**: Inline `[1]` style citations in answers that link to sources panel
- **Session persistence**: Multi-turn research sessions saved to database

**Architecture from open-researcher**:
- `components/thinking-chat.tsx` -- main chat interface
- API route streams thinking + answer + tool calls as SSE
- Sources tracked per-message and displayed in collapsible panel
- Claude with extended thinking enabled for reasoning display

**Affected Primitive**: Agent

### 4. Cross-Primitive CTAs

**Source**: Unique to Daedalus -- no single source repo has this. This is the platform's differentiator.

**What**: Connect primitive outputs to other primitive inputs:
- **Extract -> Enrich**: "Enrich this company" button on Extract results (brand identity -> full company dossier)
- **Extract -> Observe**: "Monitor this URL" button (extracted URL -> new Observe monitor)
- **Scout -> Observe**: "Monitor this finding" on new Scout URLs (discovered URL -> new monitor)
- **Scout -> Enrich**: "Enrich this company" on Scout findings that identify companies
- **Enrich -> Observe**: "Monitor [company website]" on Enrich dossier results
- **Agent -> Any**: Agent research can trigger Extract, Enrich, Scout, or Observe as tools

**Implementation Pattern**:
- Shared `<PrimitiveCTA>` component that renders contextual action buttons
- Each CTA pre-fills the target primitive's input form with relevant data
- Track CTA usage for analytics (which connections users actually use)

**Affected Primitives**: All five

### 5. TypeScript Compilation Fixes

**What**: Fix `bunx tsc --noEmit` so the type system validates every change.

**Known Issues** (from repo research):
- Type errors accumulated across multiple feature additions
- Some `any` types in AI provider abstractions
- Possible Zod v4 migration issues (project uses Zod 4.3.5)
- React 19.2.4 type changes may affect component props

**Approach**:
- Run `bunx tsc --noEmit`, catalog all errors
- Fix in order of dependency (types -> platform -> ai -> daedalus -> app -> components)
- Add `tsc --noEmit` to CI/pre-commit to prevent regression

**Affected**: Entire codebase

---

## Why This Approach

1. **Scheduling is the #1 gap**: Two of five primitives (Scout, Observe) are inert without it. The canonical source repos both have sophisticated scheduling. Without it, Daedalus is a collection of manual API calls.

2. **Notifications close the loop**: Scheduling without notifications is pointless -- users need to know when things are found/changed. Both source repos deliver email alerts as a core feature.

3. **Agent UI is the flagship experience**: The split-view with thinking display is what makes the Agent primitive visually compelling. It's directly from open-researcher and is the most differentiated user-facing feature.

4. **Cross-primitive CTAs are the moat**: No individual source repo connects primitives together. This is what makes Daedalus more than the sum of its parts.

5. **TypeScript fixes are table stakes**: Can't ship reliable features on a broken type system.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scheduling approach | pg_cron + pg_net on Neon (24/7 compute confirmed) | Canonical fidelity to open-scouts; pg_net confirmed available; 24/7 compute approved |
| Agent provider | AI Gateway -- provider-agnostic thinking display | Supports Claude extended thinking, OpenAI reasoning, and future providers |
| CTA analytics | Skip for now | Ship functional CTAs first, add analytics later |
| Email templates | React Email or inline HTML in `src/platform/notifications/` | Matches open-scouts pattern; keeps templates in platform layer |
| Agent UI framework | Adapt open-researcher's `thinking-chat.tsx` pattern | Proven UX; streaming + thinking + citations already battle-tested |
| Cross-primitive CTA approach | Shared `<PrimitiveCTA>` component with pre-fill | Single component, composable across all primitive result views |
| TypeScript fix strategy | Bottom-up (types -> platform -> ai -> daedalus -> app) | Fix foundations first so downstream fixes cascade |

---

## Resolved Questions

1. **Neon pg_net availability**: **Yes, pg_net is available.** Full canonical dispatcher pattern: pg_cron fires every minute, pg_net POSTs to Vercel API routes for each due scout/monitor individually.

2. **24/7 Neon compute**: **Approved.** Enable always-on compute (disable scale-to-zero) so pg_cron jobs fire reliably.

3. **Agent provider support**: **AI Gateway approach.** Route agent requests through a unified AI gateway/provider abstraction so the split-view UI works with any provider that supports reasoning/thinking tokens (Claude extended thinking, OpenAI o1/o3, etc.). The UI renders thinking tokens generically regardless of provider.

4. **Cross-primitive CTA analytics**: **Skip for now.** Just make the CTAs functional. Analytics can be added later when there's usage data to inform what to track.

---

## Source Repository Reference

| Feature | Source Repo | Key Files/Patterns to Adapt |
|---------|-------------|---------------------------|
| Scheduling dispatcher | [open-scouts](https://github.com/firecrawl/open-scouts) | `scripts/setup-db.sql`, `supabase/functions/scout-cron/` |
| Email notifications | [open-scouts](https://github.com/firecrawl/open-scouts) | Resend integration, HTML templates |
| Change detection notifications | [firecrawl-observer](https://github.com/firecrawl/firecrawl-observer) | `convex/firecrawl.ts`, notification system |
| Split-view agent UI | [open-researcher](https://github.com/firecrawl/open-researcher) | `components/thinking-chat.tsx`, `app/api/` |
| Multi-agent enrichment | [fire-enrich](https://github.com/firecrawl/fire-enrich) | `lib/agent-architecture/agents/`, orchestrator |
