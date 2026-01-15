# War Games Sandbox - Session Infrastructure

Lightweight, edge-optimized session management for anonymous sandbox users using Upstash Redis.

## Quick Start

### 1. Create Session (Client)

```typescript
// Client-side initialization
const response = await fetch('/api/sandbox/session', { method: 'POST' })
const { session_id, session, usage } = await response.json()
// Cookie automatically set: sandbox_session=abc123
```

### 2. Check Rate Limit (Server)

```typescript
// Before executing any workflow
import { checkRateLimit } from '@/lib/sandbox/rate-limiter'

const sessionId = cookies().get('sandbox_session')?.value
const check = await checkRateLimit(sessionId!)

if (!check.allowed) {
  // Show conversion gate or cooldown message
  return Response.json({ error: check.reason }, { status: 429 })
}
```

### 3. Execute & Record

```typescript
// After successful workflow execution
import { recordExecution } from '@/lib/sandbox/rate-limiter'

await recordExecution(sessionId, {
  workflow_type: 'agent-routing',
  timestamp: Date.now(),
  input_tokens: 150,
  output_tokens: 450,
  duration_ms: 2340,
})
```

### 4. Get Usage Stats

```typescript
// Show remaining executions to user
import { getUsageStats } from '@/lib/sandbox/rate-limiter'

const stats = await getUsageStats(sessionId)
// {
//   executions_today: 7,
//   remaining_executions: 3,
//   cooldown_seconds: 15,
//   reset_at: 1705276800000
// }
```

## Files

- **session-manager.ts** - Session lifecycle (create, get, validate, delete)
- **rate-limiter.ts** - Rate limiting with atomic Redis operations
- **types.ts** - Shared TypeScript interfaces

## Rate Limits

- **Daily**: 10 executions per 24h (resets midnight UTC)
- **Cooldown**: 30 seconds between executions
- **Tokens**: 1K input / 2K output per execution

## Redis Keys

| Pattern | TTL | Purpose |
|---------|-----|---------|
| `sandbox:session:{id}` | 24h | Session metadata |
| `sandbox:executions:{id}:{date}` | 24h | Daily counter |
| `sandbox:cooldown:{id}` | 30s | Cooldown lock |
| `sandbox:history:{id}` | 24h | Last 10 executions |

## Documentation

**Comprehensive Guide**: [UPSTASH_IMPLEMENTATION.md](../../../docs/features/war-games/UPSTASH_IMPLEMENTATION.md)

Includes:
- Complete architecture diagrams
- Performance benchmarks
- Security considerations
- Testing strategies
- API examples
