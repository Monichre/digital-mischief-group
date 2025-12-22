# Homepage Conversion Optimization - Action Plan

**Created**: 2025-01-XX
**Goal**: Transform homepage from "cool vibe" to "conversion machine" without losing brand soul
**Timeline**: Critical fixes today, high priority this week, medium priority next 2-4 weeks

---

## Executive Summary

**Problem**: Successfully built a Brand, but obscured the Business.
**Solution**: Pivot from "Edgy Hacker" to "High-Performance Engineer"
**Outcome**: Keep tactical aesthetic, add clarity and proof

---

## 🚨 CRITICAL FIXES (Ship Today)

### 1. Fix Invisible Daedalus Section
**Issue**: Dark grey text on black background - completely unreadable
**Impact**: Product reveal is invisible. If they can't see it, they don't know what you're selling.

**Actions**:
- [ ] Change "Introducing Daedalus" to **White** or **Bright Orange**
- [ ] Change "Your Personal Military-Industrial Complex" to **White** or **Bright Orange**
- [ ] Test readability from 6 feet away

**File**: `app/page.tsx` around line 550
**Priority**: CRITICAL
**Time**: 5 minutes

---

### 2. Add Opaque Cards Behind All Text Blocks
**Issue**: Text floating in void looks cool but reads poorly
**Impact**: On normal monitors, it's mud. CTOs bounce.

**Actions**:
- [ ] Wrap all major text sections in semi-transparent containers
- [ ] Use `rgba(10,10,10, 0.8)` background with `1px solid #333` border
- [ ] Apply to:
  - Problem section ("AI Everywhere")
  - Solution section (Daedalus description)
  - Process section (5-step protocol)
  - Team section introduction

**CSS Pattern**:
```tsx
<div className="p-6 bg-black/80 border border-zinc-800/50 backdrop-blur-sm">
  {/* existing text content */}
</div>
```

**Priority**: CRITICAL
**Time**: 30 minutes

---

### 3. Increase Body Font Size
**Issue**: Body copy too small for 40+ decision makers
**Impact**: Reduces readability, increases bounce rate

**Actions**:
- [ ] Bump all paragraph text from `text-lg` (18px) to `text-xl` (20px)
- [ ] Increase line height to `leading-relaxed` (1.625) minimum
- [ ] Test on laptop screen at normal viewing distance

**Files**: `app/page.tsx`, `globals.css`
**Priority**: CRITICAL
**Time**: 15 minutes

---

## ⚡ HIGH PRIORITY (Ship This Week)

### 4. Add Capabilities Ticker Below Hero
**Issue**: No immediate proof of what you build
**Impact**: Technical buyers need receipts in first 3 seconds

**Actions**:
- [ ] Create horizontal strip immediately after hero paragraph
- [ ] Add 3 high-contrast capability statements:
  ```
  [ SHIP ] PRODUCTION RAG PIPELINES
  [ SHIP ] AUDITABLE AGENT SWARMS
  [ SHIP ] GOVERNED DATA LAKES
  ```
- [ ] Style with monospace font, high contrast, subtle animation

**Component**: New component or section in `app/page.tsx`
**Priority**: HIGH
**Time**: 45 minutes

---

### 5. Update Process Section Headline
**Current**: "The DMG Ignition Protocol"
**Problem**: Cool but vague. No concrete promise.

**Actions**:
- [ ] Change headline to: **"From Lab to Live in 4 Weeks"**
- [ ] Keep the 5-step cards below
- [ ] Consider adding subhead: "The DMG Deployment Protocol"

**File**: `app/page.tsx` around line 618
**Priority**: HIGH
**Time**: 5 minutes

---

### 6. Update Team Section Headline
**Current**: "Meet The Team" (dark, hard to read)
**Problem**: Generic headline, poor visibility

**Actions**:
- [ ] Brighten text to white
- [ ] Change headline to: **"You Have To Break It To Understand It."**
- [ ] Change subhead to: **"Meet the team that breaks it."**

**File**: `app/page.tsx` around line 704
**Priority**: HIGH
**Time**: 5 minutes

---

### 7. Add Deliverable Promise to System Audit CTA
**Issue**: "System Audit" is vague - what is it?
**Impact**: Unclear value proposition reduces clicks

**Actions**:
- [ ] Add micro-copy under primary CTA button:
  ```
  // Deliverable: Full Architecture Map + Friction Report in 48 Hours
  ```
- [ ] Style as small monospace text, zinc-500 color
- [ ] Consider adding to all instances of System Audit CTA

**Files**: `app/page.tsx` (multiple CTAs around lines 374, 685, 748)
**Priority**: HIGH
**Time**: 15 minutes

---

### 8. Sharpen "End Is Near" Copy
**Current**: "The Specialist Class is dying."
**Problem**: Edgy but not grounded in business value

**Actions**:
- [ ] Add financial framing after strikethrough list:
  ```
  Manual operations are a tax on your valuation.
  While your competitors hire more humans to do the same work,
  we install the infrastructure that makes headcount optional.
  ```
- [ ] Keep existing "Stop hiring Guys" punchline

**File**: `app/page.tsx` around line 512
**Priority**: HIGH
**Time**: 10 minutes

---

## 🎯 MEDIUM PRIORITY (Next 2-4 Weeks)

### 9. Add 3-Bullet "We Build" Strip Under Hero
**Purpose**: Scannable proof points in first viewport

**Actions**:
- [ ] Add below hero paragraph, before first CTA
- [ ] Content:
  ```
  Most AI pilots die in the lab. We engineer the production systems that survive the real world.
    > Governed RAG Pipelines
    > Auditable Agent Workflows
    > Zero-Hallucination Architecture
  ```
- [ ] Style with chevrons, high contrast, spacing

**Component**: Hero section update in `app/page.tsx`
**Priority**: MEDIUM
**Time**: 30 minutes

---

### 10. Add Trust Strip / Proof Element
**Purpose**: Credibility without case study (yet)

**Options** (choose one):
- [ ] "10+ years shipping production AI systems"
- [ ] "Built for [industry/client type]"
- [ ] "Trusted by engineering teams at [tier]"
- [ ] "Case studies incoming - [link to early access]"

**Location**: Below primary CTA or in nav bar
**Priority**: MEDIUM
**Time**: 20 minutes

---

### 11. Polish Problem Cards
**Issue**: Data Silos / Zero Trust / Compliance cards blend into background

**Actions**:
- [ ] Add `1px` orange border on hover
- [ ] Add subtle glow effect: `shadow-orange-500/20`
- [ ] Increase contrast on hover

**File**: `app/page.tsx` around line 444
**Priority**: MEDIUM
**Time**: 10 minutes

---

### 12. Improve Arsenal/Daedalus Component Cards
**Issue**: Components described poetically, not practically

**Actions**:
- [ ] For each component (Sentience, Cortex, Autopilot, Relay), add:
  - What it does (concrete)
  - What you get (deliverable)
  - Example output or metric

**Example for "Sentience (Recon)"**:
```
Autonomous surveillance and threat detection.

WHAT YOU GET:
→ 50+ competitor sites monitored daily
→ Pricing changes, feature launches, hiring signals
→ Custom alert rules and daily digest

EXAMPLE: Caught 3 competitor launches before your sales team
```

**File**: `app/page.tsx` IntelCard components around line 573
**Priority**: MEDIUM
**Time**: 60 minutes

---

## 📦 FUTURE WORK (Strategic, Not Urgent)

### 13. Create Arsenal/Products Page
- Clear product tiers with pricing
- Specific deliverables per tier
- Timeline and ROI statements
- "Book Now" CTAs with calendly/form

### 14. Add Mini Case Study
- One solid example with metrics
- Problem → Solution → Outcome format
- Real company name OR "Stealth Mode Client"

### 15. Create "System Audit" Landing Page
- 3-line promise (what/how long/cost)
- Clear deliverables checklist
- Sample output or template
- Direct booking form

---

## 🎨 Design Principles to Maintain

### Keep These
✅ Military/tactical aesthetic and language
✅ Strikethrough treatment in "End Is Near"
✅ Monospace fonts and terminal feel
✅ Orange accent color and glow effects
✅ Grid patterns and scan lines
✅ "Ideas lab with matches" personality

### Add These
➕ Opaque backgrounds for text readability
➕ Concrete timelines (4 weeks, 48 hours)
➕ Specific deliverables (Architecture Map)
➕ Proof points and capabilities
➕ Financial/business value framing

### Avoid These
❌ Softening the edge
❌ Corporate speak
❌ Removing personality
❌ Generic "enterprise" design

---

## Success Metrics (Track After Implementation)

### Immediate Metrics
- [ ] Readability: All text passes WCAG AA contrast
- [ ] Above fold: Can identify what DMG does in 3 seconds
- [ ] CTA clarity: Understand what System Audit delivers

### Conversion Metrics
- [ ] Bounce rate (target: <60%)
- [ ] Time on page (target: >90 seconds)
- [ ] System Audit booking rate (baseline → +X%)
- [ ] Secondary CTA clicks (View Capabilities)

---

## Implementation Order (Recommended)

### Day 1 (Critical)
1. Fix Daedalus visibility (5 min)
2. Add opaque cards to text (30 min)
3. Increase font sizes (15 min)

**Total**: ~50 minutes
**Impact**: Site becomes readable and professional

### Day 2-3 (High Priority)
4. Add Capabilities Ticker (45 min)
5. Update Process headline (5 min)
6. Update Team headline (5 min)
7. Add CTA deliverable promise (15 min)
8. Sharpen "End Is Near" copy (10 min)

**Total**: ~80 minutes
**Impact**: Clear value proposition emerges

### Week 2-4 (Medium Priority)
9. Add "We Build" bullets (30 min)
10. Add trust strip (20 min)
11. Polish problem cards (10 min)
12. Improve component cards (60 min)

**Total**: ~120 minutes
**Impact**: Professional credibility established

---

## Review Checklist Before Going Live

- [ ] All text readable from 6 feet on laptop screen
- [ ] Daedalus section clearly visible
- [ ] At least 3 concrete capability statements above fold
- [ ] System Audit CTA explains deliverable
- [ ] Timeline promises present (4 weeks, 48 hours)
- [ ] No dark-on-dark text anywhere
- [ ] Mobile responsive (check all breakpoints)
- [ ] Focus states visible for accessibility

---

**Next Step**: Start with Day 1 critical fixes (50 minutes total). Test, deploy, then proceed to high priority changes.
