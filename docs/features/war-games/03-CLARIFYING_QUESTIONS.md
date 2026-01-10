# Phase 3: Clarifying Questions - War Games Feature

**Phase**: Clarifying Questions
**Date**: 2026-01-10
**Status**: ⏳ Awaiting Answers

---

## 🤔 Critical Questions Before Architecture Design

These questions were identified during the planning phase. Your answers will directly inform the architecture and implementation approach.

---

## 1. Design & User Experience

### Q1.1: Situation Room UI Fidelity
**Question**: Does the planned "Situation Room" UI match your vision from the screenshot you provided?

**Context**: The plan includes a 3-column layout:
- Left: System status, threat level, credits remaining
- Center: Mission selector → workflow executor → results
- Right: Activity feed, network map, metrics

**Options**:
- [ ] Yes, this matches my vision exactly
- [ ] Close, but needs adjustments (please specify)
- [ ] No, I had something different in mind (please describe)

**Your Answer**: _[Pending]_

---

### Q1.2: Workflow Selection Priority
**Question**: Are these 6 workflows the right mix for the sandbox?

**Current Selection**:
1. Agent Routing (customer support)
2. Parallel Processing (multi-perspective analysis)
3. Web Search (Firecrawl + AI)
4. PDF Ingest (chat with PDFs)
5. Form Enrichment (AI profile enhancement)
6. Prompt Evaluation (few-shot testing)

**Options**:
- [ ] Perfect as-is
- [ ] Add: ___________ (which workflows?)
- [ ] Remove: ___________ (which workflows?)
- [ ] Replace: ___________ with ___________

**Your Answer**: _[Pending]_

---

### Q1.3: Mobile Experience Priority
**Question**: How important is mobile optimization for launch?

**Context**: The Situation Room has complex 3-column layout, streaming interfaces, and data visualizations.

**Options**:
- [ ] Critical - must be fully mobile-responsive at launch
- [ ] Important - desktop-first, mobile optimization in Phase 2
- [ ] Nice-to-have - desktop-only for v1, mobile later

**Your Answer**: _[Pending]_

---

## 2. Rate Limiting & Conversion Strategy

### Q2.1: Free Tier Generosity
**Question**: Are 10 free executions/day appropriate?

**Context**: This balances value demonstration with conversion pressure.

**Current Limits**:
- Daily: 10 executions
- Cooldown: 30s between runs
- Tokens: 1000 input / 2000 output per execution

**Options**:
- [ ] Too restrictive - increase to ___ executions/day
- [ ] Just right - 10 is perfect
- [ ] Too generous - decrease to ___ executions/day
- [ ] Different approach: ___________ (describe)

**Your Answer**: _[Pending]_

---

### Q2.2: Conversion Gate Timing
**Question**: Should we be more aggressive with conversion prompts?

**Current Strategy**:
- **Hard triggers**: Daily limit hit, repeated cooldown violations
- **Soft triggers**: 5+ workflows completed, 4+ different workflows tried
- **Return visitors**: Conversion gate on 2nd+ visit

**Options**:
- [ ] More aggressive - show gate earlier/more often
- [ ] Current strategy is good
- [ ] Less aggressive - focus on value demonstration first
- [ ] Custom approach: ___________ (describe)

**Your Answer**: _[Pending]_

---

### Q2.3: Post-Limit Behavior
**Question**: What should happen when users hit their daily limit?

**Options**:
- [ ] Hard stop - can't use any workflow until tomorrow
- [ ] Degraded mode - can view results but not execute new workflows
- [ ] Read-only access - can see examples/demos but not run custom inputs
- [ ] Trial extension - offer 1-time +5 executions after email signup
- [ ] Other: ___________ (describe)

**Your Answer**: _[Pending]_

---

## 3. Technical Integration

### Q3.1: Cult UI Integration Timing
**Question**: Should we integrate Cult UI components from the start or later?

**Context**: We can either:
- **Phase 1**: Use Cult UI components immediately (faster, less custom code)
- **Phase 5**: Build custom first, integrate Cult UI later (more control, polish later)

**Trade-offs**:
- Cult UI → Faster to market, less customization
- Custom → Full control, more development time

**Options**:
- [ ] Phase 1 - Use Cult UI from the start
- [ ] Phase 5 - Build custom, integrate later
- [ ] Hybrid - Use Cult UI for some, custom for others (specify which)

**Your Answer**: _[Pending]_

---

### Q3.2: LLM Provider Priority
**Question**: Which AI provider should be primary for sandbox workflows?

**Current Setup**: Multi-provider support (Anthropic, OpenAI, Groq, Perplexity)

**Considerations**:
- **Anthropic (Claude)**: Best reasoning, higher cost
- **OpenAI (GPT-4)**: Fast, good quality, moderate cost
- **Groq**: Fastest, lower cost, lower quality
- **Mixed**: Use different providers per workflow type

**Options**:
- [ ] Anthropic (Claude) for everything
- [ ] OpenAI (GPT-4) for everything
- [ ] Groq for speed-critical workflows
- [ ] Mixed strategy: ___________ (describe)

**Your Answer**: _[Pending]_

---

### Q3.3: Firecrawl Usage Scope
**Question**: Should Firecrawl be limited to the Web Search workflow only?

**Context**: Firecrawl API can be used for:
- Web search (planned)
- Brand extraction (used in Brand Recon)
- URL scraping (used in Observe)
- Crawling (used in Scouts)

**Options**:
- [ ] Web Search only - minimize costs
- [ ] Enable for other workflows too - show more capabilities
- [ ] User choice - let them pick Firecrawl vs standard search

**Your Answer**: _[Pending]_

---

## 4. Analytics & Optimization

### Q4.1: Analytics Platform
**Question**: Which analytics platform should we use for tracking?

**Options**:
- [ ] PostHog (recommended - open source, self-hosted option)
- [ ] Mixpanel (product analytics focused)
- [ ] Amplitude (behavioral analytics)
- [ ] Google Analytics 4 (free, familiar)
- [ ] Multiple platforms for different purposes
- [ ] Build custom analytics first

**Your Answer**: _[Pending]_

---

### Q4.2: A/B Testing Priority
**Question**: Should we build A/B testing capability from the start?

**Context**: We could A/B test:
- Conversion gate messaging
- Rate limit thresholds
- Workflow ordering/presentation
- UI variations

**Options**:
- [ ] Yes - build A/B testing framework in Phase 1
- [ ] No - launch first, optimize later with data
- [ ] Partial - simple feature flags, full A/B later

**Your Answer**: _[Pending]_

---

## 5. Compliance & Legal

### Q5.1: Data Retention Policy
**Question**: How long should we keep anonymous sandbox session data?

**Current Plan**: 30 days

**Considerations**:
- Longer = better analytics, worse privacy
- Shorter = better privacy, less optimization data

**Options**:
- [ ] 7 days - minimal retention
- [ ] 30 days - current plan
- [ ] 90 days - extended analytics
- [ ] 1 year - full historical data
- [ ] Until user converts or deletes

**Your Answer**: _[Pending]_

---

### Q5.2: Email Capture Strategy
**Question**: Should we capture emails before users hit rate limits?

**Context**: We could offer bonus credits in exchange for email.

**Options**:
- [ ] No email capture - fully anonymous until paid signup
- [ ] Optional email - bonus credits offered but not required
- [ ] Mandatory email - required after 3 executions to continue
- [ ] Progressive - start anonymous, offer email for more credits

**Your Answer**: _[Pending]_

---

### Q5.3: Terms of Service Acceptance
**Question**: When should users accept ToS for sandbox usage?

**Options**:
- [ ] On first visit - modal before any interaction
- [ ] On first execution - before running first workflow
- [ ] Implicit - link to ToS in footer, no explicit acceptance
- [ ] On conversion only - accept when signing up for paid

**Your Answer**: _[Pending]_

---

## 6. Marketing & Growth

### Q6.1: Launch Strategy
**Question**: How should we launch this feature?

**Options**:
- [ ] Soft launch - no promotion, just make it available
- [ ] Beta launch - invite existing users first
- [ ] Public launch - announce on Twitter, ProductHunt, etc.
- [ ] Staged rollout - % of traffic gradually

**Your Answer**: _[Pending]_

---

### Q6.2: Referral Program
**Question**: Should we add referral incentives?

**Context**: Give existing free users bonus credits for referring others.

**Options**:
- [ ] Yes - both referrer and referee get bonus credits
- [ ] No - keep it simple for v1
- [ ] Later - add after we validate core conversion

**Your Answer**: _[Pending]_

---

### Q6.3: Social Sharing
**Question**: Should results be shareable on social media?

**Context**: Users could share interesting AI outputs from workflows.

**Options**:
- [ ] Yes - add share buttons with branded cards
- [ ] No - keep outputs private
- [ ] Opt-in - users choose what to share

**Your Answer**: _[Pending]_

---

## 7. Edge Cases & Error Handling

### Q7.1: Session Expiry Behavior
**Question**: What happens when a sandbox session expires?

**Current Plan**: 30-day cookie expiry

**Options**:
- [ ] Hard reset - lose all history, start fresh with new limits
- [ ] Soft reset - keep execution history, reset daily limits
- [ ] Extend session - allow continuation with same limits
- [ ] Merge sessions - combine if user later creates account

**Your Answer**: _[Pending]_

---

### Q7.2: Workflow Failure Handling
**Question**: If an AI workflow fails mid-execution, should it count against the user's limit?

**Options**:
- [ ] No - only successful completions count
- [ ] Yes - all attempts count (prevents abuse)
- [ ] Partial - count if failure was user error, not if system error
- [ ] Retry once - first failure doesn't count, retries do

**Your Answer**: _[Pending]_

---

### Q7.3: Multi-Device Usage
**Question**: How should we handle users accessing from multiple devices?

**Context**: Session is cookie-based, not account-based.

**Options**:
- [ ] Independent - each device gets own 10 executions/day
- [ ] Shared - IP-based limits across devices
- [ ] Hybrid - per-device limits + IP-based abuse detection
- [ ] Require account - force signup for multi-device sync

**Your Answer**: _[Pending]_

---

## 📊 Question Summary

### Priority Levels
- **🔴 Critical** (blocks implementation): Q1.1, Q2.1, Q3.1
- **🟡 Important** (affects architecture): Q1.2, Q2.2, Q3.2, Q4.1
- **🟢 Nice to know** (can decide later): Q5.2, Q6.2, Q7.1

### Decision Impact
Answers to these questions will determine:
1. UI framework choice (Cult UI vs custom)
2. Rate limiting thresholds
3. Conversion funnel design
4. Technical architecture
5. Launch timeline

---

## ✅ Next Steps

**After Answers Received**:
1. Document decisions in this file
2. Update architecture design based on answers
3. Proceed to Phase 4: Architecture Design

---

**Questions Drafted**: 2026-01-10
**Awaiting Response From**: Liam Ellis
**Target Response Date**: Before Phase 4
