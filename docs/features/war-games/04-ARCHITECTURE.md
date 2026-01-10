# Phase 4: Architecture Design - War Games Feature

**Phase**: Architecture Design
**Date**: 2026-01-10
**Status**: ⏳ Pending (Awaiting Phase 3 decisions)

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
- Database for tracking (future-proof analytics)
- Custom Situation Room shell (brand alignment)
- Cult UI workflow components (speed + quality)
- Single primary LLM, easy to add others later
- Basic analytics, A/B testing deferred

### Trade-offs
- ✅ Balanced speed and quality (2-3 weeks)
- ✅ Good customization where it matters
- ✅ Professional UX with less effort
- ✅ Data-driven optimization possible
- ❌ Some technical debt to refactor later
- ❌ Not as fast as Approach 1

### Timeline
- Week 1: Database + sessions + agent routing workflow
- Week 2: Remaining workflows + basic Situation Room UI
- Week 3: Polish + conversion gate + analytics

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
│  PostgreSQL (Neon) + Kysely ORM                     │
│  - sandbox_sessions                                  │
│  - sandbox_executions                                │
│  - sandbox_conversions                               │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend**:
- Custom Situation Room shell (React + Tailwind)
- Cult UI Pro workflow components
- Streaming AI responses via `ai` SDK

**Backend**:
- Next.js App Router API routes
- Kysely for type-safe queries
- Better Auth for session detection
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
**Recommendation**: Approach 3 (Pragmatic Balance)
**Awaiting**: Phase 3 decisions + user approval
