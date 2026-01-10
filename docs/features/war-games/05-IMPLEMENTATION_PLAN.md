# Phase 5: Implementation Plan - War Games Feature

**Phase**: Implementation Planning
**Date**: 2026-01-10
**Status**: ⏳ Ready for Execution (Pending approval)

---

## 🎯 Implementation Strategy

This plan follows **Approach 3: Pragmatic Balance** from the Architecture phase.

**Duration**: 2-3 weeks
**Phases**: 4 progressive phases
**Deployment**: Incremental with feature flags

---

## 📋 Phase Breakdown

### Week 1: Foundation + First Workflow

**Goal**: Database, sessions, rate limiting, and one working workflow

#### Tasks

**Day 1-2: Database Setup**
- [ ] Create migration file `004-sandbox-tables.sql`
- [ ] Define tables: `sandbox_sessions`, `sandbox_executions`, `sandbox_conversions`
- [ ] Add Kysely types to `lib/db/types.ts`
- [ ] Test migrations locally
- [ ] Apply to staging database

**Day 2-3: Session Management**
- [ ] Create `/api/sandbox/session/route.ts`
- [ ] Implement POST (create session)
- [ ] Implement GET (get session + usage)
- [ ] Cookie management (httpOnly, secure)
- [ ] Test session creation + persistence

**Day 3-4: Rate Limiting**
- [ ] Create `lib/sandbox/rate-limiter.ts`
- [ ] Implement daily limit check
- [ ] Implement cooldown check
- [ ] Implement token limit validation
- [ ] Add usage tracking function
- [ ] Test rate limit enforcement

**Day 4-5: First Workflow (Agent Routing)**
- [ ] Create `lib/sandbox/workflows/agent-routing.ts`
- [ ] Implement classification with `generateObject`
- [ ] Implement agent routing with `streamText`
- [ ] Create `/api/sandbox/agent-routing/route.ts`
- [ ] Integrate rate limiting
- [ ] Test end-to-end execution

**Day 5: Basic UI Shell**
- [ ] Replace `/app/arsenal/page.tsx`
- [ ] Create `components/sandbox/SituationRoom.tsx`
- [ ] Create `components/sandbox/MissionSelector.tsx`
- [ ] Create `components/sandbox/UsageIndicator.tsx`
- [ ] Test agent routing in UI

**Deliverable**: Users can execute agent routing with rate limits via web UI

---

### Week 2: Remaining Workflows + Full UI

**Goal**: All 6 workflows functional with complete Situation Room interface

#### Tasks

**Day 1: Parallel Processing Workflow**
- [ ] Create `lib/sandbox/workflows/parallel-processing.ts`
- [ ] Implement multi-perspective analysis
- [ ] Create API route
- [ ] Test execution
- [ ] Add to mission selector

**Day 2: Web Search Workflow**
- [ ] Create `lib/sandbox/workflows/web-search.ts`
- [ ] Integrate Firecrawl search
- [ ] Implement AI synthesis
- [ ] Create API route
- [ ] Test with live searches
- [ ] Add to mission selector

**Day 3: PDF Ingest + Form Enrichment**
- [ ] Create `lib/sandbox/workflows/pdf-ingest.ts`
- [ ] Implement file upload handling
- [ ] OpenAI integration for PDF
- [ ] Create `lib/sandbox/workflows/form-enrichment.ts`
- [ ] Implement profile enrichment
- [ ] Create API routes for both
- [ ] Add to mission selector

**Day 4: Prompt Evaluation + Workflow Executor**
- [ ] Create `lib/sandbox/workflows/prompt-evaluation.ts`
- [ ] Implement few-shot testing
- [ ] Create API route
- [ ] Create `components/sandbox/WorkflowExecutor.tsx`
- [ ] Implement streaming UI
- [ ] Test all 6 workflows

**Day 5: UI Panels**
- [ ] Create `components/sandbox/SystemStatus.tsx` (left panel)
- [ ] Create `components/sandbox/ActivityFeed.tsx` (right panel)
- [ ] Create `components/sandbox/GlobalNetwork.tsx` (decorative)
- [ ] Implement responsive layouts
- [ ] Test mobile experience

**Deliverable**: All workflows functional with complete Situation Room UI

---

### Week 3: Conversion + Polish

**Goal**: Conversion optimization, analytics, and launch preparation

#### Tasks

**Day 1-2: Conversion Gate**
- [ ] Create `components/sandbox/ConversionGate.tsx`
- [ ] Implement trigger detection logic
- [ ] Add conversion tracking to database
- [ ] Test multiple trigger scenarios
- [ ] Integrate Stripe checkout flow

**Day 2-3: Analytics Integration**
- [ ] Install PostHog (or chosen platform)
- [ ] Create event tracking utils
- [ ] Instrument key events:
  - Session created
  - Workflow executed
  - Rate limit hit
  - Conversion gate shown
  - Signup clicked
  - Payment completed
- [ ] Test event firing
- [ ] Create basic dashboard

**Day 3-4: Error Handling + Loading States**
- [ ] Implement comprehensive error handling
- [ ] Add retry logic for failed executions
- [ ] Create loading states for all workflows
- [ ] Add timeout handling (30s limit)
- [ ] Test error scenarios

**Day 4-5: Final Polish**
- [ ] Performance optimization
  - Code splitting
  - Image optimization
  - Streaming optimization
- [ ] Accessibility audit
  - Keyboard navigation
  - ARIA labels
  - Screen reader testing
- [ ] Cross-browser testing
- [ ] Mobile optimization
- [ ] Documentation updates

**Deliverable**: Production-ready War Games sandbox

---

### Week 4 (Optional): Advanced Features

**Goal**: Enhancements based on initial data

#### Tasks

**If Time Permits**:
- [ ] A/B testing framework
- [ ] Email capture flow
- [ ] Referral system
- [ ] Social sharing
- [ ] Admin dashboard
- [ ] Advanced analytics

---

## 🗂️ File Structure

### New Files to Create

```
lib/sandbox/
├── rate-limiter.ts                     # Rate limiting logic
├── usage-tracker.ts                    # Usage tracking utils
├── conversion.ts                       # Conversion tracking
└── workflows/
    ├── agent-routing.ts                # Agent routing workflow
    ├── parallel-processing.ts          # Parallel analysis
    ├── web-search.ts                   # Web search + AI
    ├── pdf-ingest.ts                   # PDF chat
    ├── form-enrichment.ts              # Profile enrichment
    └── prompt-evaluation.ts            # Few-shot testing

app/api/sandbox/
├── session/route.ts                    # Session management
├── agent-routing/route.ts              # Agent routing API
├── parallel-processing/route.ts        # Parallel processing API
├── web-search/route.ts                 # Web search API
├── pdf-ingest/route.ts                 # PDF ingest API
├── form-enrichment/route.ts            # Form enrichment API
└── prompt-evaluation/route.ts          # Prompt evaluation API

components/sandbox/
├── SituationRoom.tsx                   # Main container
├── MissionSelector.tsx                 # Workflow grid
├── WorkflowExecutor.tsx                # Execution interface
├── UsageIndicator.tsx                  # Credits display
├── ConversionGate.tsx                  # Paywall modal
├── SystemStatus.tsx                    # Left panel
├── ActivityFeed.tsx                    # Right panel activity
└── GlobalNetwork.tsx                   # Right panel visualization

scripts/
└── 004-sandbox-tables.sql              # Database migration
```

### Files to Modify

```
app/arsenal/page.tsx                    # Replace with SituationRoom
lib/db/types.ts                         # Add sandbox types
tsconfig.json                           # If needed for paths
```

---

## 🧪 Testing Strategy

### Unit Tests
- Rate limiting logic (various scenarios)
- Session management (creation, expiry)
- Workflow execution (success, failure, timeout)

### Integration Tests
- End-to-end workflow execution
- Rate limit enforcement across requests
- Conversion tracking through funnel
- Analytics event firing

### Manual QA Checklist
- [ ] All 6 workflows execute successfully
- [ ] Rate limits enforce correctly
- [ ] Streaming responses work smoothly
- [ ] Conversion gate triggers appropriately
- [ ] Mobile experience is usable
- [ ] Error states display properly
- [ ] Analytics events fire correctly
- [ ] Performance meets targets (<2s p95)

---

## 🚀 Deployment Plan

### Pre-Launch Checklist
- [ ] Database migrations applied to production
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Stripe webhook tested
- [ ] Error monitoring active (Sentry)
- [ ] Performance monitoring enabled
- [ ] ToS/Privacy Policy updated
- [ ] Rollback plan ready

### Launch Sequence
1. **Soft Launch** (10% traffic)
   - Deploy to production with feature flag
   - Enable for 10% of visitors
   - Monitor metrics for 24-48 hours
   - Check error rates, conversion rates

2. **Staged Rollout** (50% traffic)
   - Increase to 50% if metrics look good
   - Monitor for 48 hours
   - Optimize based on data

3. **Full Launch** (100% traffic)
   - Remove feature flag
   - Announce publicly
   - Monitor closely for first week

### Rollback Plan
If critical issues occur:
1. Disable feature flag immediately
2. Investigate root cause
3. Fix in staging
4. Re-deploy with fix
5. Resume rollout

---

## 📊 Success Metrics (Revisited)

### Week 1 Targets
- [ ] 1 workflow executing successfully
- [ ] Rate limiting working
- [ ] 0 critical bugs

### Week 2 Targets
- [ ] All 6 workflows executing
- [ ] UI complete and responsive
- [ ] Error rate <1%

### Week 3 Targets
- [ ] Conversion gate implemented
- [ ] Analytics tracking all events
- [ ] Performance <2s p95

### Post-Launch Targets (30 days)
- [ ] 100+ daily active users
- [ ] 15%+ conversion rate
- [ ] 3.5+ workflows/session
- [ ] 60%+ return rate within 7 days

---

## 🔧 Development Environment Setup

### Prerequisites
```bash
# Already installed
- Node.js 18+ / Bun 1.2+
- PostgreSQL (Neon)
- Git

# New dependencies to install
npm install nanoid         # Session token generation
npm install @ai-sdk/anthropic @ai-sdk/openai
npm install ai             # Streaming AI SDK
```

### Environment Variables
```bash
# Already configured
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
FIRECRAWL_API_KEY=fc-...
STRIPE_SECRET_KEY=sk_...

# New (optional)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Local Development
```bash
# Run migrations
psql $DATABASE_URL -f scripts/004-sandbox-tables.sql

# Start dev server
bun dev

# Test workflows
curl -X POST http://localhost:3000/api/sandbox/agent-routing \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I reset my password?"}'
```

---

## 📝 Documentation Requirements

### Code Documentation
- [ ] JSDoc comments for all public functions
- [ ] README in `lib/sandbox/` explaining architecture
- [ ] API documentation for all endpoints
- [ ] Workflow documentation with examples

### User Documentation
- [ ] ToS addendum for sandbox usage
- [ ] FAQ for common questions
- [ ] Tutorial/walkthrough for first-time users
- [ ] Help text in UI for each workflow

### Internal Documentation
- [ ] Architecture decision records (ADRs)
- [ ] Database schema documentation
- [ ] Runbook for common issues
- [ ] Metrics dashboard guide

---

## ✅ Next Steps

**Ready to Start Implementation?**

1. **Review this plan** and confirm approach
2. **Approve Phase 3 decisions** (if not done yet)
3. **Set start date** and allocate time
4. **Begin Week 1, Day 1**: Create database migration

**Questions Before Starting**:
- [ ] Do you want to implement all 4 weeks, or stop at Week 3?
- [ ] Should we use feature flags for gradual rollout?
- [ ] Any specific workflows you want prioritized?
- [ ] Need help with any specific implementation details?

---

**Plan Created**: 2026-01-10
**Status**: Ready for Execution
**Estimated Duration**: 2-3 weeks (core), 4 weeks (complete)
