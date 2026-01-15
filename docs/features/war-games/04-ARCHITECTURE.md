# Phase 4: Architecture Design - War Games Feature

**Phase**: Architecture Design
**Date**: 2026-01-10
**Status**: ✅ Approved & Partially Implemented

---

## 🏗️ Architecture Approaches

This document will present 2-3 implementation approaches with different trade-offs once clarifying questions are answered.

---

## Approach 1: Minimal Changes (Fastest to Market)

**Philosophy**: Maximum reuse, minimum custom code, leverage Cult UI heavily

### Key Decisions
- Use Cult UI Pro components as-is
- Minimal backend changes
- Cookie-based sessions only (no database)
- Single-provider LLM (fastest to configure)

### Trade-offs
- ✅ Fastest implementation (1-2 weeks)
- ✅ Less custom code to maintain
- ✅ Battle-tested components
- ❌ Less customization
- ❌ Limited analytics capability
- ❌ Harder to optimize conversion

### Timeline
- Week 1: Cult UI integration + basic rate limiting
- Week 2: Polish + launch

---

## Approach 2: Clean Architecture (Most Maintainable)

**Philosophy**: Proper abstractions, full database tracking, extensible design

### Key Decisions
- Custom components following DMG design system
- Full database schema for tracking
- Multi-provider LLM support from start
- Comprehensive analytics integration
- A/B testing framework built-in

### Trade-offs
- ✅ Full control and customization
- ✅ Rich analytics and optimization
- ✅ Easy to extend later
- ❌ Longer development time (4-6 weeks)
- ❌ More code to maintain
- ❌ Higher initial complexity

### Timeline
- Week 1: Database + rate limiting + session management
- Week 2: First 3 workflows + basic UI
- Week 3: Remaining workflows + full UI
- Week 4: Conversion optimization + analytics

---

## Approach 3: Pragmatic Balance (Recommended)

**Philosophy**: Hybrid approach - custom where it matters, Cult UI where it helps

### Key Decisions
- **Upstash Redis** for session tracking (10-20x faster than SQL, auto-cleanup)
- Custom Situation Room shell (brand alignment)
- Lab component integration (AgentSandbox, PromptLab, DocumentLab)
- Single primary LLM, easy to add others later
- Basic analytics, A/B testing deferred
- **Zero SQL tables** - lightweight, edge-optimized approach

### Trade-offs
- ✅ Balanced speed and quality (2-3 weeks)
- ✅ Good customization where it matters
- ✅ Professional UX with less effort
- ✅ Data-driven optimization possible
- ❌ Some technical debt to refactor later
- ❌ Not as fast as Approach 1

### Timeline
- Week 1: ✅ Upstash sessions + rate limiting + Situation Room UI
- Week 2: 🔄 Workflow integration + conversion gate
- Week 3: Polish + analytics

---

## 🔍 Detailed Architecture (Approach 3 - Recommended)

_This section will be expanded based on Phase 3 decisions_

### System Components

```
┌─────────────────────────────────────────────────────┐
│  Situation Room UI (Custom Shell)                   │
│  ┌────────────┬──────────────────┬───────────────┐ │
│  │ Status     │ Mission Center   │ Activity      │ │
│  │ Panel      │ (Cult UI Inside) │ Feed          │ │
│  └────────────┴──────────────────┴───────────────┘ │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  API Layer                                           │
│  /api/sandbox/session     → Session management      │
│  /api/sandbox/[workflow]  → Workflow execution      │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Business Logic                                      │
│  lib/sandbox/rate-limiter.ts                        │
│  lib/sandbox/workflows/[workflow].ts                │
│  lib/sandbox/conversion.ts                          │
└─────────────────────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────┐
│  Data Layer                                          │
│  Upstash Redis (Edge-optimized)                     │
│  - sandbox:session:{id}       → Session metadata    │
│  - sandbox:executions:{id}:{date} → Daily counter   │
│  - sandbox:cooldown:{id}      → 30s cooldown lock   │
│  - sandbox:history:{id}       → Last 10 executions  │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Custom Situation Room shell (React + Tailwind)
- Cult UI Pro workflow components
- Streaming AI responses via `ai` SDK

**Backend**:
- Next.js App Router API routes
- Upstash Redis for session management
- Better Auth for authenticated users (separate)
- Stripe for PRO conversions

**AI/Data**:
- Primary: Anthropic Claude 3.5 Sonnet
- Firecrawl for web search
- Rate limiting via Redis (optional) or database

**Analytics**:
- PostHog (recommended)
- Custom event tracking
- Conversion funnel analysis

---

## 📊 Comparison Matrix

| Criterion | Approach 1 | Approach 2 | Approach 3 |
|-----------|-----------|-----------|-----------|
| Time to Launch | 1-2 weeks | 4-6 weeks | 2-3 weeks |
| Customization | Low | High | Medium-High |
| Maintainability | Medium | High | Medium |
| Analytics Depth | Low | High | Medium |
| Future-Proof | Low | High | Medium-High |
| Brand Alignment | Medium | High | High |
| Code Complexity | Low | High | Medium |
| Initial Cost | Low | Medium | Low-Medium |

---

## 🎯 Recommendation

**Approach 3: Pragmatic Balance**

### Rationale
1. **Speed + Quality**: Faster than Approach 2, better than Approach 1
2. **Data Foundation**: Database enables future optimization
3. **Brand Consistency**: Custom shell maintains DMG aesthetic
4. **Component Reuse**: Cult UI workflows save development time
5. **Flexibility**: Easy to refactor parts later based on data

### What We Build Custom
- Situation Room layout and navigation
- System status panels
- Activity feed
- Conversion gate modal
- Usage indicators

### What We Use from Cult UI
- AI workflow execution interfaces
- Streaming response components
- Input/output handling
- Error states

---

## 🚧 Open Questions (From Phase 3)

These architectural decisions depend on answers from Phase 3:

1. **Cult UI Integration**: If Phase 1, simplifies approach; if Phase 5, increases custom work
2. **LLM Provider**: Affects workflow implementation details
3. **Analytics Platform**: Determines tracking code structure
4. **Rate Limits**: Impacts rate limiter design complexity
5. **Conversion Strategy**: Affects gate trigger logic

---

## ✅ Next Steps

**After Architecture Approval**:
1. Create detailed component breakdown
2. Define API contracts
3. Design database schema in detail
4. Create implementation task list
5. Proceed to Phase 5: Implementation

---

**Architecture Drafted**: 2026-01-10
**Recommendation**: Approach 3 (Pragmatic Balance) ✅ **APPROVED**
**Implementation Status**: UI Foundation Complete, Backend Pending

### Implementation Progress

**✅ Completed**:
- Custom Situation Room shell (UI foundation)
- Mission selector with 5 mission types
- System status panels (Threat Level, System Health, Core Modules)
- Activity Feed component
- Global Network visualization
- Lab component integration (AgentSandbox, PromptLab, DocumentLab)
- Dark tactical theme implementation
- Navigation updates (all `/arsenal` → `/field-report`)
- **Upstash Redis session management** (session-manager.ts)
- **Rate limiting service** (rate-limiter.ts with atomic operations)
- **Session API routes** (/api/sandbox/session)
- **Shared TypeScript types** (types.ts)

**⏳ In Progress**:
- Backend workflow execution APIs (agent-routing, prompt-eval, pdf, etc.)
- Lab component integration with session/rate limiting

**📋 Pending**:
- Conversion gate modal (trigger on rate limit)
- Analytics integration (PostHog recommended)
- Remaining lab components (Document Pipeline, Enrich Profile)
- Error handling and loading states

---

## 🚀 Upstash Redis Implementation (2026-01-14)

### Architecture Decision: Redis Over SQL

**Decision**: Use Upstash Redis for sandbox session tracking instead of PostgreSQL tables.

**Rationale**:
- **Performance**: 10-20x faster (<10ms vs 50-200ms latency)
- **Simplicity**: Zero SQL migrations, no foreign keys, no cleanup jobs
- **Isolation**: Anonymous sessions never touch user accounts
- **Cost**: Pay-per-request, edge-optimized, scales effortlessly
- **Developer Experience**: Already in stack, minimal code (~150 lines total)

### Implementation Files

```
src/lib/sandbox/
├── session-manager.ts    # Session lifecycle (create, get, validate, delete)
├── rate-limiter.ts       # Rate limiting with atomic Redis operations
└── types.ts              # Shared TypeScript interfaces

src/app/api/sandbox/
└── session/
    └── route.ts          # Session API (POST, GET, DELETE)
```

### Redis Data Structure

| Key Pattern | Value | TTL | Purpose |
|-------------|-------|-----|---------|
| `sandbox:session:{id}` | JSON metadata | 24h | Session tracking |
| `sandbox:executions:{id}:{date}` | Counter | 24h | Daily limit enforcement |
| `sandbox:cooldown:{id}` | Timestamp | 30s | Cooldown between runs |
| `sandbox:history:{id}` | List (last 10) | 24h | Execution history |

### Rate Limiting Rules

- **Daily Limit**: 10 executions per 24h (resets midnight UTC)
- **Cooldown**: 30 seconds between executions
- **Token Limits**: 1K input / 2K output tokens per execution
- **Enforcement**: Atomic Redis `INCR` operations (race-condition safe)

### Data Isolation

```
Anonymous Sandbox (Redis)          Authenticated Users (PostgreSQL)
─────────────────────────          ────────────────────────────────
session:abc123 → metadata          users → Better Auth accounts
executions:abc123:2026-01-14 → 7  subscriptions → Stripe data
cooldown:abc123 → timestamp        modules → Enrich/Brand/etc.
NO user_id, NO email               NO sandbox session reference
```

**Zero Coupling**: Sandbox sessions expire after 24h, never linked to user accounts.

### Documentation

**Comprehensive Guide**: `docs/features/war-games/UPSTASH_IMPLEMENTATION.md`

Contains:
- Complete architecture diagrams
- API usage examples
- Performance benchmarks
- Security & privacy considerations
- Testing strategies
- Migration notes from SQL approach

---

**Last Updated**: 2026-01-14
**Status**: Session infrastructure complete, ready for workflow integration
