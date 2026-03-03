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

### Firecrawl / Core Apps

| Repository | Maps to Primitive | What to Learn |
|------------|-------------------|---------------|
| [fire-enrich](https://github.com/firecrawl/fire-enrich) | **Enrich** | Multi-phase orchestration, discovery → profile → funding → tech stack, source attribution |
| [open-scouts](https://github.com/Monichre/open-scouts) | **Scout** | Scheduled Firecrawl search, URL deduplication via `seen_urls`, email notifications |
| [firecrawl-observer](https://github.com/firecrawl/firecrawl-observer) | **Observe** | Content hash comparison, diff generation, AI change summarization |
| [firegeo](https://github.com/firecrawl/firegeo) | **Platform** | Better Auth, Stripe + Autumn integration, usage tracking, plan gating |
| [open-researcher](https://github.com/firecrawl/open-researcher) | **Agent** | Split-view UI (thinking/answer/sources), streaming reasoning, tool orchestration |
| [Firecrawl Docs](https://docs.firecrawl.dev/features/scrape#extract-brand-identity) | **Extract** | Brand identity extraction API, formats, schema definitions |

### Implementation Principles

1. **DO NOT REINVENT**: Review source repository for existing patterns first
2. **ADAPT, DON'T COPY**: Integrate patterns into unified architecture (shared auth, DB, UI)
3. **PRESERVE BEHAVIOR**: Core functionality matches source repo unless explicitly changing
4. **DOCUMENT DEVIATIONS**: Comment or create ADRs for any deviations from source patterns

**Reference**: See [PRD.md](./PRD.md) for complete primitive definitions and architecture.

---

## Architecture Overview

### Technology Stack

```yaml
Framework: Next.js 16.0.8 (App Router)
Language: TypeScript 5
Runtime: Bun 1.2.17 (preferred) / Node.js 18+
Database: PostgreSQL (Neon) + Kysely ORM
UI: Tailwind CSS 4 + Radix UI + shadcn/ui components
Auth: Better Auth 1.4.7
Billing: Stripe + Autumn
AI: Multi-provider (OpenAI, Anthropic, Groq, Perplexity)
Scraping: Firecrawl API (@mendable/firecrawl-js 4.9.3)
Notifications: Resend
Deployment: Vercel
```

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
    /tools/      # Agent tool definitions
    /schemas/    # Zod schemas for AI outputs

  platform/      # Auth, DB, billing, jobs, telemetry
    /auth/       # Better Auth configuration
    /db/         # Kysely client, migrations
    /billing/    # Stripe integration, usage tracking
    /jobs/       # Background job processing

  components/    # Shared UI primitives only
    /ui/         # Radix + shadcn/ui components
```

**Key Points**:

- `app/api/*` = thin adapters (auth, validation, dispatch)
- `daedalus/*` = business logic for each primitive
- `platform/*` = shared infrastructure (no business logic)
- Database tables use primitive names (e.g., `scouts`, `monitors`, not marketing terms)

---

## Development Patterns

### Database Access

```typescript
// Always use Kysely for type-safe queries
import { db } from '@/platform/db/kysely'

// Prefer prepared statements and proper error handling
try {
  const result = await db
    .selectFrom('scouts')
    .where('user_id', '=', userId)
    .execute()
} catch (error) {
  console.error('Database error:', error)
  return { error: 'Failed to fetch data' }
}
```

### AI Provider Pattern

```typescript
// Use unified LLM provider from ai/providers
import { createLLMProvider } from '@/ai/providers/llm-provider'

const provider = createLLMProvider({
  provider: 'anthropic', // or 'openai', 'groq', 'perplexity'
  model: 'claude-3-5-sonnet-20241022',
  apiKey: process.env.ANTHROPIC_API_KEY
})

const response = await provider.generateText(prompt, schema)
```

### Firecrawl Integration

```typescript
// Use centralized Firecrawl service from platform/firecrawl
import { firecrawlService } from '@/platform/firecrawl/service'

// Scraping with brand extraction
const brandData = await firecrawlService.scrape(url, {
  formats: ['markdown', 'html'],
  actions: [{ type: 'screenshot' }],
  onlyMainContent: true
})
```

### Authentication & Authorization

```typescript
// Server-side auth check (API routes)
import { auth } from '@/platform/auth'

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Continue with authenticated logic
}

// Client-side auth hook (components)
'use client'
import { authClient } from '@/platform/auth/client'

export function Component() {
  const { data: session, isPending } = authClient.useSession()
  if (isPending) return <LoadingSpinner />
  if (!session) return <SignInPrompt />
  // Render authenticated UI
}
```

### API Route Pattern (Thin Adapter)

```typescript
// app/api/enrich/route.ts - Thin controller
import { enrichWorkflow } from '@/daedalus/enrich/workflow'
import { auth } from '@/platform/auth'
import { checkUsageLimits } from '@/platform/billing/limits'
import { enrichInputSchema } from '@/ai/schemas/enrich'

export async function POST(req: Request) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Validate input
  const body = await req.json()
  const input = enrichInputSchema.parse(body)

  // 3. Enforce usage limits
  await checkUsageLimits(session.user.id, 'enrich')

  // 4. Dispatch to business logic
  const result = await enrichWorkflow(input, session.user.id)

  // 5. Return response
  return Response.json(result)
}
```

---

## Primitive-Specific Guidance

### Extract Primitive

**Location**: `/daedalus/extract/*`, `/app/api/extract`

**Purpose**: One-off snapshot extraction from URLs (brand identity, structured assets)

**Core Pattern**:

```typescript
// Single-run extraction, stateless
export async function extractBrand(url: string) {
  const scraped = await firecrawlService.scrape(url, { formats: ['markdown'] })
  const brandData = await llmProvider.generateText(brandPrompt, brandSchema)
  return { ...brandData, source: url }
}
```

**Key Features**:

- Brand identity (logo, colors, fonts, voice)
- Market segmentation (optional, explicit)
- Competitive analysis (optional, explicit)
- No state, no scheduling, immediate output

### Observe Primitive

**Location**: `/daedalus/observe/*`, `/app/api/observe`

**Purpose**: Monitor URLs for changes over time with diff generation

**Core Pattern**:

```typescript
// Stateful monitoring with content hashing
export async function checkMonitor(monitorId: string) {
  const monitor = await db.selectFrom('monitors').where('id', '=', monitorId).executeTakeFirst()
  const currentContent = await firecrawlService.scrape(monitor.url)
  const currentHash = hashContent(currentContent.markdown)

  if (currentHash !== monitor.last_hash) {
    const diff = generateDiff(monitor.last_content, currentContent.markdown)
    const summary = await llmProvider.generateText(summaryPrompt, summarySchema)
    await notifyChange(monitor.user_id, { diff, summary })
  }
}
```

**Key Features**:

- Content hash comparison
- Diff generation (before/after)
- AI-powered change summarization
- Webhook + email notifications

### Scout Primitive

**Location**: `/daedalus/scout/*`, `/app/api/scouts`

**Purpose**: Scheduled web searches with URL deduplication

**Core Pattern**:

```typescript
// Query-based search with deduplication
export async function runScout(scoutId: string) {
  const scout = await db.selectFrom('scouts').where('id', '=', scoutId).executeTakeFirst()
  const searchResults = await firecrawlService.search(scout.query)

  // Deduplicate against seen_urls
  const newUrls = searchResults.filter(url => !scout.seen_urls.includes(url))

  if (newUrls.length > 0) {
    await db.updateTable('scouts')
      .set({ seen_urls: [...scout.seen_urls, ...newUrls] })
      .where('id', '=', scoutId)
      .execute()

    await notifyNewFindings(scout.user_id, newUrls)
  }
}
```

**Key Features**:

- Scheduled Firecrawl searches
- URL deduplication via `seen_urls` array
- Email notifications for new findings
- Dashboard feed integration

### Enrich Primitive

**Location**: `/daedalus/enrich/*`, `/app/api/enrich`

**Purpose**: Multi-step workflow to generate structured person/company dossiers

**Two Entry Points** (not interchangeable):

1. **Profile Enrichment**
   - Input: Email, name, or LinkedIn URL
   - Output: Individual's role + basic company info
   - Explicitly NOT included: Competitive analysis, deep firmographics

2. **Company Enrichment**
   - Input: Company domain or name
   - Process: Sequential agents (discovery → firmographics → funding → tech stack)
   - Output: Structured company dossier (JSON)
   - Competitive analysis: Optional, must be explicitly toggled

**Core Pattern**:

```typescript
// Multi-phase orchestration
export async function enrichCompany(domain: string, options: EnrichOptions) {
  const discovery = await discoveryAgent(domain)
  const profile = await companyProfileAgent(discovery)
  const funding = await fundingAgent(profile.name)
  const techStack = await techStackAgent(domain)

  let competitive = null
  if (options.includeCompetitive) {
    competitive = await competitiveAnalysisAgent(profile)
  }

  return {
    company: profile,
    funding,
    techStack,
    competitive,
    sources: [...discovery.sources, ...profile.sources]
  }
}
```

### Agent Primitive

**Location**: `/daedalus/agent/*`, `/app/api/agent`

**Purpose**: Interactive sessions that orchestrate tools for research and synthesis

**Core Pattern**:

```typescript
// Session-based tool orchestration
export async function agentSession(sessionId: string, userPrompt: string) {
  const tools = [firecrawlSearchTool, extractTool, llmTool]

  const response = await llmProvider.generateText(userPrompt, {
    tools,
    onToolCall: async (toolName, args) => {
      // Log tool usage for transparency
      await logToolCall(sessionId, toolName, args)
      return await executeTool(toolName, args)
    }
  })

  return {
    thinking: response.reasoning,
    answer: response.content,
    sources: response.citations
  }
}
```

**Key Features**:

- Split-view UI (thinking, answer, sources)
- Streaming reasoning with citations
- Tool orchestration (Firecrawl, Extract, Observe)
- Session persistence for multi-turn research

---

## Code Conventions

### TypeScript Standards

- **Strict Mode**: Enabled - all type checks enforced
- **Naming**:
  - Components: PascalCase (`ExtractView.tsx`)
  - Functions/variables: camelCase (`enrichCompany`)
  - Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
  - Database: snake_case (`user_id`, `created_at`, `seen_urls`)
  - Primitives: lowercase (`extract`, `observe`, `scout`, `enrich`, `agent`)
- **Imports**: Absolute imports with `@/` alias
- **Types**: Inline for simple types, separate `.types.ts` files for complex schemas

### Component Architecture

```typescript
// Server Components (default)
export default async function ExtractPage({ params }: { params: { id: string } }) {
  const extraction = await db.selectFrom('extractions').where('id', '=', params.id).executeTakeFirst()
  return <ExtractView data={extraction} />
}

// Client Components (with 'use client')
'use client'
import { useState } from 'react'

export function ScoutRunner({ scoutId }: { scoutId: string }) {
  const [running, setRunning] = useState(false)

  const runScout = async () => {
    setRunning(true)
    await fetch(`/api/scouts/${scoutId}/run`, { method: 'POST' })
    setRunning(false)
  }

  return <button onClick={runScout} disabled={running}>Run Scout</button>
}
```

### Error Handling

- Always wrap async operations in try-catch
- Log errors with context: `console.error('Enrich workflow failed:', error)`
- Return user-friendly error messages
- Use Zod for input validation at API boundaries

### Security Practices

- Never commit `.env.local` or secrets
- Validate all user inputs with Zod schemas
- Use parameterized queries (Kysely handles this)
- Implement rate limiting on expensive operations
- Sanitize all user-generated content before display

---

## Testing & Quality

### Running Tests

```bash
# Lint check
bun run lint

# Type check
bunx tsc --noEmit

# Build verification
bun run build
```

### Quality Standards

- All API routes must have error handling
- All user inputs must be validated with Zod
- All database queries must use Kysely's type-safe API
- All AI operations should handle rate limits gracefully
- All components should be accessible (ARIA labels, keyboard nav)

---

## Common Tasks

### Adding a New API Endpoint

1. Create route file in `/app/api/[primitive]/route.ts`
2. Implement thin adapter (auth → validate → enforce limits → dispatch → return)
3. Validate inputs with Zod schemas from `/ai/schemas/`
4. Business logic goes in `/daedalus/[primitive]/`
5. Return JSON responses with proper status codes

### Adding a New Workflow

1. Create workflow file in `/daedalus/[primitive]/[workflow-name].ts`
2. Define input/output Zod schemas in `/ai/schemas/`
3. Implement business logic using platform services
4. Include source URLs in responses
5. Add to corresponding API route adapter

### Adding a New Dashboard Page

1. Create route in `/app/(authenticated)/[page]/page.tsx`
2. Fetch data server-side when possible
3. Use client components only when needed (interactivity)
4. Implement loading states with Suspense
5. Add to navigation in layout

### Database Migrations

1. Create SQL file in `/scripts/migrations/[timestamp]-[description].sql`
2. Test locally against dev database
3. Apply with: `psql $DATABASE_URL -f scripts/migrations/[file].sql`
4. Document in migration history

---

## Environment Variables

### Required

```env
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Better Auth
BETTER_AUTH_SECRET=32-character-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...

# Firecrawl
FIRECRAWL_API_KEY=fc-...

# AI Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
GROQ_API_KEY=gsk_...
```

### Optional

```env
# Admin access
ADMIN_EMAILS=admin@example.com,team@example.com

# Email notifications
RESEND_API_KEY=re_...

# Monitoring
SENTRY_DSN=...
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify schema
psql $DATABASE_URL -c "\dt"
```

### Auth Issues

- Check `BETTER_AUTH_SECRET` is set and 32+ characters
- Verify `BETTER_AUTH_URL` matches your deployment URL
- Clear cookies if session is stale

### Firecrawl Rate Limits

- Implement exponential backoff
- Cache results when possible
- Use batch operations for multiple URLs

### Build Failures

```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install

# Rebuild
bun run build
```

---

## Additional Resources

- [PRD](./PRD.md) - Canonical product requirements and primitive definitions
- [Firecrawl Docs](https://docs.firecrawl.dev) - API reference
- [Better Auth Docs](https://www.better-auth.com/docs) - Authentication guide
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

---

## Session Patterns

### Starting a New Feature

1. Identify which primitive(s) the feature belongs to
2. Check source repository for canonical patterns
3. Create database migrations if needed (use primitive names)
4. Implement workflow in `/daedalus/[primitive]/`
5. Create thin API adapter in `/app/api/[primitive]/`
6. Add UI components following existing conventions
7. Test locally before committing

### Debugging Issues

1. Check browser console for client errors
2. Check terminal output for server errors
3. Verify environment variables are set
4. Test API endpoints directly with curl/Postman
5. Check database state with psql

### Code Review Checklist

- [ ] TypeScript types are correct (no `any`)
- [ ] Error handling is comprehensive
- [ ] Auth checks are in place
- [ ] Input validation with Zod
- [ ] Database queries are type-safe (Kysely)
- [ ] Database tables use primitive names
- [ ] Business logic in `/daedalus/`, not `/app/api/`
- [ ] UI is accessible (ARIA, keyboard nav)
- [ ] No secrets in code or commits
- [ ] Code follows project conventions

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

## Cursor Cloud specific instructions

### Services overview

Daedalus is a single Next.js 16 application. All external services (PostgreSQL via Neon, Stripe, Firecrawl, AI providers) are remote APIs — no local Docker or database containers are needed.

### Runtime

The project uses **Bun 1.2.17** as its package manager (see `packageManager` field in `package.json`). Bun is installed at `~/.bun/bin/bun` and added to `PATH` via `~/.bashrc`. If Bun is not on `PATH`, run `export PATH="$HOME/.bun/bin:$PATH"`.

### Running the dev server

```bash
bun run dev   # starts Next.js on port 3000
```

The `.env` file in the repo root is loaded automatically by Next.js. A warning about `serverActions` in `next.config.mjs` is expected and non-blocking.

### Lint / Type check / Build

See `package.json` scripts; standard commands per CLAUDE.md:

```bash
bun run lint        # ESLint (0 errors expected; ~338 warnings are pre-existing)
bunx tsc --noEmit   # TypeScript type check
bun run build       # production build
```

### Gotchas

- **No `.env.local` required**: The repo ships a `.env` file with all necessary keys for the Neon-hosted DB, Stripe, OpenAI, Firecrawl, and other services.
- **Upstash Redis REST**: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are **not** set in `.env`. This is non-blocking — Redis-dependent features (sandbox rate limiting) will throw only if invoked, but the app starts and runs fine without them.
- **next.config.mjs warning**: `Unrecognized key(s) in object: 'serverActions'` is a benign config deprecation warning in Next.js 16; it does not prevent startup.
