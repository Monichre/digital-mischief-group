# Database Analysis - War Games Feature

**Date**: 2026-01-10
**Question**: Do we need new tables or can we use existing infrastructure?

---

## 🔍 Existing Database Infrastructure

### Current Tables (From Migrations)

#### 1. `usage_events` (Already Exists ✅)
```sql
CREATE TABLE usage_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,      -- 'brand_extraction', 'enrichment', etc.
  module TEXT NOT NULL,           -- 'brand', 'enrich', 'scouts', 'observe'
  input_value TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  metadata JSONB,                 -- Flexible storage
  created_at TIMESTAMPTZ
);
```

**Can we use this?**
- ✅ YES - Can track sandbox executions
- ✅ Already has `module` field (add 'sandbox')
- ✅ Already has `event_type` (add workflow names)
- ✅ Already has `metadata` JSONB (store session_token, user_agent, etc.)
- ✅ Already indexed on `event_type`, `module`, `created_at`

#### 2. `session` (Already Exists ✅)
```sql
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,         -- Requires authenticated user
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

**Can we use this?**
- ❌ NO - Requires `user_id` (authenticated users only)
- ❌ Designed for Better Auth sessions, not anonymous
- 🤔 We need anonymous session tracking

#### 3. `user` (Already Exists ✅)
```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  credits INTEGER DEFAULT 0,     -- Already has credits system!
  stripe_customer_id TEXT,
  subscription_status TEXT
);
```

**Can we use this?**
- ✅ Already has `credits` field
- ✅ Already has `subscription_status`
- ⚠️ Only for authenticated users (not anonymous sandbox)

---

## 💡 Proposed Approach: Minimal Database Changes

### Option 1: Use Existing Tables (Recommended)

**No new tables needed!** Just leverage what exists:

#### Track Anonymous Sessions
```typescript
// Use encrypted cookie for session tracking
// No database needed - just cookie + in-memory rate limiting
const sessionToken = nanoid(32) // Store in httpOnly cookie
```

#### Track Executions in `usage_events`
```sql
-- Just insert into existing table
INSERT INTO usage_events (
  event_type,     -- 'agent_sandbox', 'prompt_sandbox', etc.
  module,         -- 'sandbox'
  input_value,    -- User's query/input
  status,         -- 'success', 'error', 'rate_limited'
  duration_ms,
  metadata        -- { session_token, ip, user_agent, tokens_used }
) VALUES (...);
```

#### Rate Limiting Strategy
```typescript
// Option A: In-memory (simplest, works for single server)
const rateLimits = new Map<sessionToken, {
  executions: number,
  lastExecution: Date
}>()

// Option B: Redis (if you have it, scales across servers)
await redis.incr(`sandbox:${sessionToken}:count`)

// Option C: Database query (slower, but no new infra)
const count = await db
  .selectFrom('usage_events')
  .where('module', '=', 'sandbox')
  .where('metadata->session_token', '=', sessionToken)
  .where('created_at', '>=', startOfDay)
  .select(db.fn.count('id').as('count'))
```

**Pros**:
- ✅ No schema changes needed
- ✅ Reuses existing infrastructure
- ✅ Simple to implement
- ✅ Works immediately

**Cons**:
- ⚠️ In-memory rate limiting doesn't scale across servers
- ⚠️ Less detailed session analytics (no dedicated table)
- ⚠️ Harder to track conversion funnel (no session→user link)

---

### Option 2: Add Minimal Tables (Better Analytics)

If you want better analytics and conversion tracking:

#### New Table: `sandbox_sessions` (Minimal)
```sql
CREATE TABLE sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,  -- Cookie value
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_executions INT DEFAULT 0,

  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  user_id TEXT REFERENCES "user"(id)   -- NULL until conversion
);

CREATE INDEX idx_sandbox_sessions_token ON sandbox_sessions(session_token);
CREATE INDEX idx_sandbox_sessions_ip ON sandbox_sessions(ip_address);
```

**Then still use `usage_events` for execution tracking** (no additional table needed).

**Pros**:
- ✅ Better conversion analytics (session → user journey)
- ✅ Easier rate limiting (query session table)
- ✅ Can link anonymous sessions to users after signup
- ✅ Better abuse detection (IP tracking)

**Cons**:
- ❌ One new table to maintain
- ❌ Slightly more complex

---

## 🎯 My Recommendation

### Use **Option 1** (No New Tables) for MVP

**Why?**
1. **Faster to launch** - No schema changes needed
2. **Existing infrastructure** - `usage_events` already perfect for this
3. **Simple rate limiting** - Start with in-memory, add Redis if needed
4. **Easy to upgrade** - Can add `sandbox_sessions` table later if analytics prove valuable

### Implementation
```typescript
// lib/sandbox/rate-limiter.ts
import { db } from '@/lib/db/kysely'

export async function checkRateLimit(sessionToken: string) {
  // Get today's executions from existing usage_events table
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const result = await db
    .selectFrom('usage_events')
    .where('module', '=', 'sandbox')
    .where('created_at', '>=', today)
    .where(sql`metadata->>'session_token' = ${sessionToken}`)
    .select(db.fn.count('id').as('count'))
    .executeTakeFirst()

  const count = Number(result?.count || 0)
  return {
    allowed: count < 10,
    remaining: Math.max(0, 10 - count)
  }
}

export async function trackExecution(
  sessionToken: string,
  workflowType: string,
  input: unknown,
  status: string
) {
  await db
    .insertInto('usage_events')
    .values({
      event_type: workflowType,
      module: 'sandbox',
      input_value: JSON.stringify(input),
      status,
      metadata: {
        session_token: sessionToken,
        ip: getIP(),
        user_agent: getUserAgent()
      }
    })
    .execute()
}
```

**No migration needed!** Works immediately with existing tables.

---

## 📊 Comparison

| Feature | Option 1 (Existing) | Option 2 (New Table) |
|---------|---------------------|----------------------|
| Schema changes | None | 1 table |
| Development time | Fastest | +1 day |
| Rate limiting | Query or in-memory | Query session table |
| Analytics depth | Basic | Detailed |
| Conversion tracking | Via usage_events | Dedicated session tracking |
| Abuse prevention | IP in metadata | IP indexed |
| Scalability | Good (with Redis) | Better |

---

## 🔥 Firecrawl Clarification

### "No Firecrawl needed for MVP"

**What I meant**:

The original plan included a **Web Search workflow** that would have required Firecrawl API calls:
```typescript
// This workflow was in the original 6
const searchResults = await firecrawlClient.search(query) // Costs $ per search
```

By removing the Web Search workflow, we don't need to make Firecrawl API calls **from the sandbox**.

**You still use Firecrawl elsewhere:**
- ✅ Brand Recon module (brand extraction)
- ✅ Observe module (URL monitoring)
- ✅ Scouts module (scheduled searches)
- ✅ Research module (web data)

**But for the 4-5 sandbox workflows:**
- Agent Sandbox → No external API needed (just LLM)
- Prompt Sandbox → No external API needed (just LLM)
- PDF Analysis → Just LLM (OpenAI handles PDF)
- Document Pipeline → Just LLM
- Enrich Profile → No external API needed (just LLM)

**Cost savings**: No additional Firecrawl API calls for sandbox usage = lower cost per free user.

---

## ✅ Final Recommendation

### For War Games MVP:

**Database**: Use Option 1 (existing `usage_events` table)
- No migration needed
- Launch faster
- Can always add `sandbox_sessions` later if analytics prove valuable

**Rate Limiting**:
- Start with database queries (simple)
- Add Redis if traffic grows
- In-memory for development

**Firecrawl**:
- Not needed for sandbox workflows
- Still used in your other modules
- Saves cost on free tier users

### If You Want Better Analytics Later:

Add `sandbox_sessions` table in Phase 2 after validating the feature works and people use it.

---

**Analysis Complete**: 2026-01-10
**Recommendation**: Start with existing tables, add dedicated tables only if needed
**Migration Required**: None for MVP ✅
