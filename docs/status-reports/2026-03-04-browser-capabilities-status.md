# Browser Capabilities Status — 2026-03-04

## Requested Scope (from task prompt)

1. Firecrawl Browser Sandbox integration.
2. Firecrawl Agent integration.
3. Hyper Browser integration for trend summary, competitor analysis, company research, and Hyper Train dataset workflows.

## Source Docs Reviewed

- Firecrawl Browser: https://docs.firecrawl.dev/features/browser
- Firecrawl Agent: https://docs.firecrawl.dev/features/agent
- Hyper examples:
  - Trend Summary
  - Competitor Analyzer Bot
  - Company Researcher
  - Hyper Train

## Confirmed Technical Requirements

### Firecrawl Browser
- Browser session lifecycle: create, execute, list, close.
- Execution modes: Node and Bash (`agent-browser`) in sandbox.
- Session controls: `ttl`, `activityTtl`, optional persistent `profile`.
- Optional operator visibility: `liveViewUrl`, `interactiveLiveViewUrl`, `cdpUrl`.

### Firecrawl Agent
- Support both sync and async execution patterns.
- Typed support for `prompt`, optional `urls`, optional `schema`, `model`, `maxCredits`.
- Persist run status/metadata for observability and cost governance.

### Hyper Browser
- High-concurrency browsing workflows for market/trend/competitor/company research.
- Normalize outputs into Daedalus scout + sentinel pipelines.
- Add guarded/feature-flagged provider fallback so core workflows still run when unavailable.

### Hyper Train
- URL-list ingestion for dataset creation.
- LLM-ready outputs (JSONL/Markdown), plus optional embeddings and QA-generation steps.

## Current Codebase Status

- `src/platform/firecrawl/service.ts` already supports scrape/search/map/crawl and agent start/status/run.
- No Firecrawl Browser session methods are implemented yet (no browser create/execute/list/delete wrappers).
- No Hyper Browser client/dependency integration exists in app code.
- Scout stream currently uses Serper + Exa + Firecrawl search in `src/app/api/scouts/[id]/run/stream/route.ts`.

## Backlog Updates Completed

Added four new backlog tickets in `TODOS.md`:

- Ticket #21 — Firecrawl Browser Sandbox Integration
- Ticket #22 — Firecrawl Agent Deep Research Integration
- Ticket #23 — Hyper Browser Parallel Scout Runs
- Ticket #24 — Hyper Train Dataset Pipeline

## Implementation Readiness

Status: **Ready for implementation planning**.

Required preconditions before coding:
- Confirm env keys for `FIRECRAWL_API_KEY` and `HYPERBROWSER_API_KEY` in target environments.
- Confirm desired rollout strategy (feature flag + fallback behavior).
- Confirm which scout paths should route to Firecrawl Browser vs Hyper Browser by default.
