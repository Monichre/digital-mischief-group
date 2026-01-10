# Digital Mischief Group - Claude Code Configuration

## Project Identity

**Name**: Digital Mischief Group - Firecrawl Intelligence Suite
**Type**: Next.js 16 Full-Stack SaaS Platform
**Domain**: AI-powered web intelligence, brand analysis, lead enrichment
**Stack**: TypeScript, Next.js App Router, PostgreSQL, Firecrawl API, Multi-LLM

---

## Source Repositories - Canonical Behavior Patterns

**🔴 CRITICAL FOR ALL AI AGENTS**: This project is NOT a greenfield build. It's a unified suite integrating patterns from **source-of-truth repositories**. These repos define the canonical behavior and implementation patterns for each module:

### Firecrawl / Core Apps (Primary Sources)

| Repository | Module | What to Learn |
|------------|--------|---------------|
| [fire-enrich](https://github.com/firecrawl/fire-enrich) | **Enrich** | Multi-phase agent orchestration, discovery → profile → funding → tech stack patterns, source attribution per field |
| [open-scouts](https://github.com/Monichre/open-scouts) | **Scouts** | Scheduled Firecrawl search, URL deduplication via `seen_urls`, email notification patterns |
| [firecrawl-observer](https://github.com/firecrawl/firecrawl-observer) | **Observe** | Content hash comparison, diff generation, AI change summarization, webhook patterns |
| [firegeo](https://github.com/firecrawl/firegeo) | **Auth/Billing** | Better Auth setup, Stripe + Autumn integration, usage tracking, plan gating |
| [open-researcher](https://github.com/firecrawl/open-researcher) | **Research** | Split-view UI (thinking/answer/sources), streaming reasoning, Firecrawl search integration |
| [Firecrawl Docs](https://docs.firecrawl.dev/features/scrape#extract-brand-identity) | **Brand** | Brand identity extraction API, formats, schema definitions |

### Digital Mischief Group (Design Reference)

| Repository | Purpose | What to Learn |
|------------|---------|---------------|
| [DMG Marketing Site](https://www.digitalmischiefgroup.com/) | **Design System** | Brand archetypes, tone, visual language, content patterns |
| [DMG Repo](https://github.com/Monichre/digital-mischief-group) | **Integration** | This repository - customer zero implementation |

### Implementation Principles

1. **DO NOT REINVENT**: When implementing a feature, FIRST review the source repository for existing patterns
2. **ADAPT, DON'T COPY**: Integrate patterns into the unified architecture (shared auth, DB, UI)
3. **PRESERVE BEHAVIOR**: Core functionality should match source repo behavior unless explicitly changing
4. **DOCUMENT DEVIATIONS**: If you must deviate from source patterns, document why in code comments or ADRs

**Reference**: See [PRD.md](./PRD.md) Section 0 for complete source repository list and [PLAN.md](./PLAN.md) for implementation guidance.

---

## Architecture Overview

### Core Modules (5 Main Products in One)

1. **Enrich** - CSV lead enrichment with multi-phase AI agents
2. **Brand Recon** - Brand identity extraction + competitive intelligence + market positioning
3. **Scouts** - AI-powered web monitoring with scheduled searches
4. **Observe** - URL change detection and content diffing
5. **Research** - Visual AI research assistant with streaming reasoning

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

### Key Directories

```
/app                    → Next.js App Router (routes, API endpoints, UI)
  /api                  → API routes (auth, billing, AI, scraping)
    /ai                 → AI-powered endpoints (scrape, enrich, research)
    /brand-recon        → Brand analysis endpoints
    /enrich             → Lead enrichment endpoints
    /monitors           → URL monitoring endpoints
    /research           → Research assistant endpoints
    /scouts             → Web scout endpoints
  /(authenticated)      → Protected dashboard routes
  /(marketing)          → Public marketing pages

/lib                    → Core business logic and utilities
  /agents               → Multi-phase AI enrichment agents
  /db                   → Database client and utilities
  /firecrawl            → Firecrawl API client wrapper
  /utils                → Shared utilities

/components             → React components
  /ui                   → Radix + shadcn/ui primitives
  /dashboard            → Dashboard-specific components

/scripts                → Database migrations and utilities
/docs                   → Project documentation and analysis
```

---

## Development Patterns

### Database Access

```typescript
// Always use Kysely for type-safe queries
import { db } from '@/lib/db/kysely'

// Prefer prepared statements and proper error handling
try {
  const result = await db
    .selectFrom('table_name')
    .where('user_id', '=', userId)
    .execute()
} catch (error) {
  console.error('Database error:', error)
  return { error: 'Failed to fetch data' }
}
```

### AI Provider Pattern

```typescript
// Use unified LLM provider abstraction from lib/agents/llm-provider.ts
import { createLLMProvider } from '@/lib/agents/llm-provider'

const provider = createLLMProvider({
  provider: 'anthropic', // or 'openai', 'groq', 'perplexity'
  model: 'claude-3-5-sonnet-20241022',
  apiKey: process.env.ANTHROPIC_API_KEY
})

const response = await provider.generateText(prompt, schema)
```

### Firecrawl Integration

```typescript
// Use centralized Firecrawl client from lib/firecrawl/client.ts
import { firecrawlClient } from '@/lib/firecrawl/client'

// Scraping with brand extraction
const brandData = await firecrawlClient.scrape(url, {
  formats: ['markdown', 'html'],
  actions: [{ type: 'screenshot' }],
  onlyMainContent: true
})
```

### Authentication & Authorization

```typescript
// Server-side auth check (API routes)
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Continue with authenticated logic
}

// Client-side auth hook (components)
'use client'
import { useSession } from '@/lib/auth-client'

export function Component() {
  const { data: session, isPending } = useSession()
  if (isPending) return <LoadingSpinner />
  if (!session) return <SignInPrompt />
  // Render authenticated UI
}
```

### API Route Patterns

```typescript
// Streaming responses for AI operations
import { streamText } from 'ai'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    prompt,
    system: 'You are a helpful assistant...'
  })

  return result.toDataStreamResponse()
}

// Standard JSON responses with error handling
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const result = await processData(data)
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('API error:', error)
    return Response.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Code Conventions

### TypeScript Standards

- **Strict Mode**: Enabled - all type checks enforced
- **Naming**:
  - Components: PascalCase (`BrandReconCard.tsx`)
  - Functions/variables: camelCase (`getUserProfile`)
  - Constants: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
  - Database: snake_case (`user_id`, `created_at`)
- **Imports**: Absolute imports with `@/` alias
- **Types**: Define inline for simple types, separate `.types.ts` files for complex schemas

### Component Architecture

```typescript
// Server Components (default)
import { ComponentProps } from './types'

export default async function ServerComponent({ id }: ComponentProps) {
  const data = await fetchData(id)
  return <div>{data.title}</div>
}

// Client Components (with 'use client')
'use client'
import { useState } from 'react'

export function ClientComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(prev => !prev)}>Toggle</button>
}
```

### Error Handling

- Always wrap async operations in try-catch
- Log errors with context: `console.error('Operation failed:', error)`
- Return user-friendly error messages
- Use Zod for input validation at API boundaries

### Security Practices

- Never commit `.env.local` or secrets
- Validate all user inputs with Zod schemas
- Use parameterized queries (Kysely handles this)
- Implement rate limiting on expensive operations
- Sanitize all user-generated content before display

---

## Module-Specific Guidance

### Enrich Module

**Location**: `/app/api/enrich/*`, `/lib/agents/*`

**Core Pattern**: Multi-phase agent orchestration
1. Discovery Agent (web search for company info)
2. Company Profile Agent (firmographics)
3. Funding Agent (investment data)
4. Tech Stack Agent (technical infrastructure)
5. Custom Fields Agent (user-defined enrichment)

**Key Files**:
- `lib/agents/conductor.ts` - Agent orchestration logic
- `lib/agents/company-profile.ts` - Company data extraction
- `lib/agents/funding.ts` - Funding/investment data
- `lib/agents/tech-stack.ts` - Technology detection

**Pattern**:
```typescript
// Each agent follows this structure
export async function agentName(input: InputType): Promise<OutputType> {
  const searchResults = await firecrawlClient.search(query)
  const analysis = await llmProvider.generateText(prompt, schema)
  return { ...analysis, sources: searchResults.urls }
}
```

### Brand Recon Module

**Location**: `/app/api/brand-recon/*`

**Core Pattern**: Brand extraction + competitive analysis + positioning

**Key Features**:
- Firecrawl brand identity extraction (logo, colors, fonts, voice)
- Competitive neighborhood discovery
- Market segmentation analysis
- Opportunity mapping (white space identification)
- Automated asset generation (emails, landing pages, social posts)

**Pattern**:
```typescript
// Brand analysis workflow
1. Extract brand identity via Firecrawl
2. Discover competitors via search
3. Analyze positioning and opportunities
4. Generate branded assets (optional)
```

### Scouts Module

**Location**: `/app/api/scouts/*`

**Core Pattern**: Scheduled web monitoring with deduplication

**Key Features**:
- Create scouts with search queries and schedule
- Run Firecrawl search on intervals
- Deduplicate via `seen_urls` tracking
- Email notifications via Resend
- Dashboard feed integration

### Observe Module

**Location**: `/app/api/monitors/*`

**Core Pattern**: URL content change detection

**Key Features**:
- Monitor specific URLs for changes
- Content hash comparison + diff generation
- AI-powered change summarization
- Webhook + email notifications
- Integration with brand/scout modules

### Research Module

**Location**: `/app/api/research/*`

**Core Pattern**: Visual research assistant with streaming

**Key Features**:
- Split-view UI (thinking, answer, sources)
- Streaming AI reasoning with citations
- Firecrawl search integration for live web data
- Pre-seeded queries from other modules

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

1. Create route file in `/app/api/[module]/route.ts`
2. Implement GET/POST handlers with auth check
3. Validate inputs with Zod
4. Use try-catch for error handling
5. Return JSON responses with proper status codes

### Adding a New Agent

1. Create agent file in `/lib/agents/[agent-name].ts`
2. Define input/output Zod schemas
3. Implement search → analysis → synthesis pattern
4. Add to conductor orchestration if multi-phase
5. Include source URLs in responses

### Adding a New Dashboard Page

1. Create route in `/app/(authenticated)/[page]/page.tsx`
2. Fetch data server-side when possible
3. Use client components only when needed (interactivity)
4. Implement loading states with Suspense
5. Add to navigation in layout

### Database Migrations

1. Create SQL file in `/scripts/[number]-[description].sql`
2. Test locally against dev database
3. Apply with: `psql $DATABASE_URL -f scripts/[file].sql`
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

## Source Repositories (Reference Only)

This project integrates patterns from:

- **fire-enrich** - Lead enrichment agents
- **open-scouts** - Web monitoring scouts
- **firecrawl-observer** - URL change detection
- **firegeo** - Auth, billing, brand monitoring
- **open-researcher** - Visual research assistant

**Important**: These are reference implementations. All code is unified in this repository.

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

- [Implementation Status](./docs/IMPLEMENTATION_STATUS.md) - Module completion tracking
- [PRD](./PRD.md) - Canonical product requirements
- [Firecrawl Docs](https://docs.firecrawl.dev) - API reference
- [Better Auth Docs](https://www.better-auth.com/docs) - Authentication guide
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation

---

## Session Patterns

### Starting a New Feature

1. Review relevant module documentation above
2. Check existing patterns in codebase
3. Create database migrations if needed
4. Implement API routes with proper auth
5. Add UI components following existing conventions
6. Test locally before committing

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
- [ ] UI is accessible (ARIA, keyboard nav)
- [ ] No secrets in code or commits
- [ ] Code follows project conventions

---

## Notes for Claude Code

- **Prefer existing patterns** over creating new abstractions
- **Reuse agents** from `lib/agents/*` for enrichment logic
- **Follow module boundaries** - keep concerns separated
- **Use streaming** for AI responses in user-facing features
- **Implement proper loading states** - never leave users waiting without feedback
- **Document complex logic** - especially multi-phase agents
- **Test database changes** locally before applying to production
- **Security first** - always validate inputs, check auth, sanitize outputs
