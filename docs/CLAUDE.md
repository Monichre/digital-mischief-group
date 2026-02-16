# Daedalus - Claude Code Configuration

## Project Identity

**Name**: Daedalus
**Type**: Next.js 16 Full-Stack AI Intelligence Platform
**Domain**: Web intelligence collection and synthesis through clear primitives
**Stack**: TypeScript, Next.js App Router, PostgreSQL, Firecrawl API, Multi-LLM

---

## Core Design Principles

**🔴 CRITICAL FOR ALL AI AGENTS**: This project is built on **stable primitives**, not marketing terms.

### 1. Metal Names in Code, Domain Names in UI
- **Codebase**: Stable, boring names (`extract`, `observe`, `scout`, `enrich`, `agent`)
- **Database**: Tables use primitive names (`scouts`, `monitors`, `enrichment_jobs`)
- **APIs**: Routes stay fixed (`/api/extract`, `/api/observe`, `/api/scouts`)
- **UI**: Can display friendly terminology via translation layer

### 2. No Big-Bang Refactors
- Existing routes, tables, APIs remain intact
- New work adheres to canonical structure
- Old modules migrate only when touched

### 3. Explicit Intent Over Implicit Expansion
- Each workflow does one thing clearly
- No automatic feature expansion (e.g., profile enrichment ≠ competitive analysis)

### 4. Shared Primitives, Separate Workflows
- Firecrawl and LLM integrations are centralized
- Business logic lives in domain-specific workflows

---

## The Five Primitives

Daedalus defines **five core primitives**. All functionality maps onto one of these:

| Primitive | Purpose | Key Characteristics |
|-----------|---------|---------------------|
| **Extract** | One-off snapshot of a URL | Stateless, immediate output (brand colors, fonts, copy) |
| **Observe** | Monitor a URL for changes over time | Stateful, scheduled runs, produces diffs and summaries |
| **Scout** | Scheduled web search with deduplication | Query-based, deduplicates via `seen_urls`, emits new findings |
| **Enrich** | Generate structured dossier for person/company | Multi-step workflow, outputs consolidated JSON |
| **Agent** | Interactive, tool-using sessions | Session-based, orchestrates tools, logs actions for research |

**Important**: Agents are infrastructure for orchestration, not a product category.

---

## Source Repositories - Canonical Behavior Patterns

**Reference implementations** that define how each primitive should behave:

| Repository | Maps to Primitive | What to Learn |
|------------|-------------------|---------------|
| [fire-enrich](https://github.com/firecrawl/fire-enrich) | **Enrich** | Multi-phase orchestration, discovery → profile → funding → tech stack, source attribution |
| [open-scouts](https://github.com/Monichre/open-scouts) | **Scout** | Scheduled Firecrawl search, URL deduplication via `seen_urls`, email notifications |
| [firecrawl-observer](https://github.com/firecrawl/firecrawl-observer) | **Observe** | Content hash comparison, diff generation, AI change summarization |
| [firegeo](https://github.com/firecrawl/firegeo) | **Platform** | Better Auth, Stripe + Autumn integration, usage tracking, plan gating |
| [open-researcher](https://github.com/firecrawl/open-researcher) | **Agent** | Split-view UI (thinking/answer/sources), streaming reasoning, tool orchestration |
| [Firecrawl Docs](https://docs.firecrawl.dev/features/scrape#extract-brand-identity) | **Extract** | Brand identity extraction API, formats, schema definitions |

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript 5
- **Runtime**: Bun 1.2.17 (preferred) / Node.js 18+
- **Database**: PostgreSQL (Neon) + Kysely ORM
- **UI**: Tailwind CSS 4 + Radix UI + shadcn/ui components
- **Auth**: Better Auth 1.4.7
- **Billing**: Stripe + Autumn
- **AI**: Multi-provider (OpenAI, Anthropic, Groq, Perplexity)
- **Scraping**: Firecrawl API (@mendable/firecrawl-js 4.9.3)
- **Notifications**: Resend
- **Deployment**: Vercel

### Canonical Folder Structure

```
src/
  app/           # Next.js routes (thin controllers)
    /api         # Stable API endpoints
      /extract   # POST /api/extract
      /observe   # POST /api/observe
      /scouts    # POST /api/scouts
      /enrich    # POST /api/enrich, /api/enrich/stream
      /agent     # POST /api/agent

  daedalus/      # Domain workflows (business logic)
    /extract/    # Brand extraction, market analysis workflows
    /observe/    # URL monitoring, change detection workflows
    /scout/      # Scheduled search, deduplication workflows
    /enrich/     # Profile enrichment, company enrichment workflows
    /agent/      # Research sessions, tool orchestration workflows

  ai/            # LLM provider, tools, schemas
    /providers/  # Unified LLM abstraction (OpenAI, Anthropic, Groq)
    /tools/     # Agent tool definitions
    /schemas/    # Zod schemas for AI outputs

  platform/      # Auth, DB, billing, jobs, telemetry
    /auth/      # Better Auth configuration
    /db/        # Kysely client, migrations
    /billing/    # Stripe integration, usage tracking
    /jobs/      # Background job processing

  components/    # Shared UI primitives only
    /ui/        # Radix + shadcn/ui components
```

---

## Development Patterns

### Database Access
Use Kysely for type-safe queries: `import { db } from '@/platform/db/kysely'`

### AI Provider Pattern
Use unified LLM provider: `import { createLLMProvider } from '@/ai/providers/llm-provider'`

### Firecrawl Integration
Use centralized service: `import { firecrawlService } from '@/platform/firecrawl/service'`

### Authentication & Authorization
- Server: `import { auth } from '@/platform/auth'`
- Client: `import { authClient } from '@/platform/auth/client'`

### API Route Pattern (Thin Adapter)
```typescript
// 1. Authenticate → 2. Validate → 3. Enforce limits → 4. Dispatch → 5. Return
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return new Response('Unauthorized', { status: 401 })
  const body = await req.json()
  const input = enrichInputSchema.parse(body)
  await checkUsageLimits(session.user.id, 'enrich')
  const result = await enrichWorkflow(input, session.user.id)
  return Response.json(result)
}
```

---

## Implementation Status

### Primitives
| Primitive | Status | Reference |
|----------|--------|-----------|
| **Platform** (Auth, Billing, DB) | 100% ✅ | US-007 |
| **Enrich** | 95% ✅ | US-001, US-002 |
| **Extract** | 90% ✅ | US-003 |
| **Agent** | 85% ✅ | US-006 |
| **Observe** | 85% ✅ | US-004 |
| **Scout** | 80% ✅ | US-005 |

### Key Achievements
- ✅ All 7 PRD user stories implemented and passing
- ✅ Proper architectural separation (app/api → daedalus → platform)
- ✅ Multi-provider AI support (OpenAI, Anthropic, Groq)
- ✅ Firecrawl integration with centralized service
- ✅ Better Auth authentication and session management
- ✅ Stripe + Autumn billing integration (GEO compliance)
- ✅ UI upgrades and hydration behavior stabilization

---

## Notes for Claude Code

- **Metal names everywhere**: Code, DB, APIs use `extract`, `observe`, `scout`, `enrich`, `agent`
- **No marketing terms in code**: "Brand Recon" is UI-only, code uses `extract` + `enrich`
- **Thin API routes**: Auth → validate → dispatch → return. Business logic goes in `/daedalus/`
- **Preserve source patterns**: Reference source repos for canonical behavior
- **Explicit workflows**: Profile enrichment ≠ company enrichment. No automatic expansions.
- **Security first**: Always validate inputs, check auth, sanitize outputs
- **No big refactors**: Migrate old code only when touched

---

## Additional Resources

- [README.md](../README.md) - User-facing documentation
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Detailed implementation progress
- [TESTING.md](./TESTING.md) - Testing guide and coverage
- [PRD.md](../PRD.md) - Product requirements
- [Firecrawl Docs](https://docs.firecrawl.dev) - API reference
- [Better Auth Docs](https://www.better-auth.com/docs) - Authentication guide

---

**Document Version:** 1.1
**Last Updated:** 2026-02-16
