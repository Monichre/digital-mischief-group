# Phase 1: Discovery - War Games Feature

**Phase**: Discovery
**Date**: 2026-01-10
**Status**: ✅ Complete

---

## 🎯 Feature Request

### Original Request
> "Help me plan a new public facing feature to allow users to experiment with the application before signing up for $30/month. I've attached a screenshot of how I want the root interface to look. Essentially the idea is this: I want to provide an AI sandbox arsenal or 'war games' that essentially bundles several contained AI workflows from Cult UI."

### Context Provided
- **Visual Reference**: Screenshot of tactical/military "Situation Room" interface
- **Cult UI Components**: 11 AI workflow components identified for integration
- **Current State**: `/arsenal` route exists but is placeholder content
- **Goal**: Freemium onboarding → value demonstration → $30/mo conversion

---

## 📝 Feature Requirements

### Primary Objectives

1. **Low-Friction Entry**
   - No signup required for initial access
   - Anonymous session tracking via cookies
   - Immediate value demonstration

2. **AI Workflow Showcase**
   - 6 core workflows available in sandbox:
     - Agent Routing (customer support routing)
     - Parallel Processing (multi-perspective analysis)
     - Web Search (Firecrawl + AI synthesis)
     - PDF Ingest (chat with PDFs)
     - Form Enrichment (AI profile enhancement)
     - Prompt Evaluation (few-shot testing)

3. **Conversion Optimization**
   - Rate limiting creates natural conversion pressure
   - Multiple conversion triggers (hard limits, soft engagement)
   - Clear value proposition at paywall moments

4. **Brand Alignment**
   - Military/tactical "Situation Room" aesthetic
   - Matches existing DMG positioning
   - Cyberpunk HUD elements and terminology

### Constraints

1. **Cost Control**
   - Free tier must be sustainable
   - Token limits per execution
   - IP-based abuse prevention

2. **Technical Integration**
   - Leverage existing auth system (Better Auth)
   - Use existing billing (Stripe $30/mo plan)
   - Integrate with Firecrawl client
   - Support multi-LLM providers (Anthropic, OpenAI, Groq)

3. **User Experience**
   - Mobile responsive
   - Streaming AI responses
   - Clear usage indicators
   - Graceful error handling

---

## 🎨 Visual Design Direction

### Screenshot Analysis

The provided screenshot shows:
- **3-column layout**: Status panel (left), mission center (center), activity panel (right)
- **HUD elements**: Corner accents, status indicators, threat levels
- **Data visualization**: Network maps, throughput metrics, activity feeds
- **Color scheme**: Dark background (zinc-950), orange accents, tactical green
- **Typography**: Monospace font, uppercase labels, technical terminology

### UI Components Needed
- System status dashboard
- Mission selector grid (6 workflow cards)
- Workflow execution interface with streaming
- Usage/credits indicator
- Conversion gate modal
- Activity feed (live execution log)
- Global network visualization (decorative)

---

## 📦 Cult UI Components Identified

### Confirmed Components for Integration

1. **@cult-ui-pro/ai-agents-sandbox**
   - Purpose: Container for multiple agent patterns
   - Relevance: Core framework for sandbox

2. **@cult-ui-pro/ai-chat-agent-routing-pattern**
   - Purpose: Customer support agent routing
   - Workflow: Agent Routing

3. **@cult-ui-pro/ai-agents-parallel-processing**
   - Purpose: Concurrent multi-perspective analysis
   - Workflow: Parallel Processing

4. **@cult-ui-pro/ai-websearch**
   - Purpose: Web search with AI synthesis
   - Workflow: Web Search

5. **@cult-ui-pro/ai-pdf-ingest**
   - Purpose: PDF chat interface
   - Workflow: PDF Ingest

6. **@cult-ui-pro/ai-sdk-enrich-form**
   - Purpose: AI-powered form enrichment
   - Workflow: Form Enrichment

7. **@cult-ui-pro/ai-sdk-prompt-few-shot**
   - Purpose: Few-shot prompt evaluation
   - Workflow: Prompt Evaluation

### Additional Components (Optional)
- **@cult-ui-pro/ai-document-processor** - Document processing workflows
- **@cult-ui-pro/ai-generate-audio** - Audio generation
- **@cult-ui-pro/ai-artifact-table** - Data table artifacts
- **@cult-ui-pro/ai-chat-agent-orchestrater-pattern** - Orchestrator-worker pattern

---

## 🔄 User Journey

### 1. Discovery
```
User lands on /arsenal
→ Sees "Situation Room" interface
→ No signup required
→ Session cookie created automatically
```

### 2. Exploration
```
Browse 6 available missions
→ Select a workflow
→ Execute with sample/custom input
→ See streaming AI results
→ View usage counter decrement
```

### 3. Engagement
```
Try multiple workflows
→ Hit rate limit or cooldown
→ See conversion gate
→ Decision point: signup or wait
```

### 4. Conversion
```
Click "Unlock PRO"
→ Redirect to Stripe checkout ($30/mo)
→ Complete payment
→ Return as authenticated PRO user
→ Unlimited access unlocked
```

---

## 💡 Key Insights

### Strategic Positioning
- **Unique Differentiator**: "War Games" positioning vs generic AI playgrounds
- **Brand Consistency**: Tactical theme reinforces DMG's "controlled burns" narrative
- **Technical Showcase**: Demonstrates real platform capabilities, not demos

### Competitive Analysis
- Most AI tools require signup before any interaction
- Free tiers often don't show real capabilities (toy examples)
- War Games sandbox shows production-grade workflows

### Risk Mitigation
- Anonymous sessions limit abuse potential
- Rate limiting controls costs
- Session tracking enables conversion attribution
- Clear ToS for sandbox usage

---

## ✅ Discovery Summary

### What We're Building
A public-facing AI sandbox that lets users execute real AI workflows without signup, with strategic rate limiting that drives conversion to $30/mo PRO plans.

### What We're NOT Building
- A toy/demo interface with fake results
- A full-featured product without limits
- A marketing landing page without interactive elements

### Success Criteria
- Conversion rate >15%
- Engagement >3 workflows/session
- Cost per free user <$0.50
- User satisfaction score >4.5/5

---

## 📊 Next Steps

**Phase 2**: Codebase Exploration
- Analyze existing `/arsenal` implementation
- Review similar features (auth flow, billing integration)
- Identify reusable patterns and components
- Map integration points

---

**Discovery Completed**: 2026-01-10
**Approved By**: Liam Ellis
**Next Phase**: Codebase Exploration
