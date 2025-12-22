# Review 02: Pivot from "Edgy Hacker" to "High-Performance Engineer"

**Date**: 2025-01-XX
**Source**: Internal Review of Review 01
**Summary**: Feedback is accurate. Built a **Brand** but obscured the **Business**. Need to pivot from "Cool" to "Clarity."

---

## Core Problem

**Currently optimizing for**: "Cool"
**Need to optimize for**: "Clarity"

**Danger**: If a CTO lands here and can't read the text or thinks you're just "vibing," they bounce.

---

## The Pivot

**From**: "Edgy Hacker"
**To**: "High-Performance Engineer"

Keep the soul of the brand while fixing legibility and trust issues.

---

## 1. The Legibility Fix (Design Directive)

### Action
Add **Opaque Cards** behind text blocks

### Why
Right now, text is floating in the void. Looks cool but reads poorly.

### The Fix
- Put "Problem" and "Solution" text inside semi-transparent black boxes
- Use `rgba(10,10,10, 0.8)` with subtle 1px border (`#333`)
- Preserves background glow but makes text pop
- **Bump all body copy size up by 2px**

---

## 2. The "Receipts" Fix (Trust Strip)

### Action
Add a **"Capabilities Ticker"** immediately below Hero Section (before "AI Everywhere" section)

### Content
Horizontal bar with high-contrast icons/text:
- `[ SHIP ] PRODUCTION RAG PIPELINES`
- `[ SHIP ] AUDITABLE AGENT SWARMS`
- `[ SHIP ] GOVERNED DATA LAKES`

### Why
Tells technical buyers *exactly* what you build in 3 seconds.

---

## 3. The Copy Sharpening (Less Apocalypse, More Profit)

### Refining "End is Near" Section
**Current**: "The Specialist Class is dying."

**New (Grounded)**:
> "Manual operations are a tax on your valuation. While your competitors hire more humans to do the same work, we install the infrastructure that makes headcount optional."

### Refining "System Audit" CTA
Make it a product, not a meeting.

**Current Button**: `[ INITIALIZE SYSTEM AUDIT ]`

**Add Micro-Copy under button**:
`// Deliverable: Full Architecture Map + Friction Report in 48 Hours.`

---

## 4. The Hero Rewrite (Conversion Focus)

**Assumption**: Goal is selling the "System Audit" (foot in the door)

### Headline
```
Your Data Is Cold.
We Bring the Matches.
```

### Subhead (The "3-Bullet Strip")
```
Most AI pilots die in the lab. We engineer the production systems that survive the real world.
  > Governed RAG Pipelines
  > Auditable Agent Workflows
  > Zero-Hallucination Architecture
```

### Primary CTA
```
[ INITIALIZE SYSTEM AUDIT ]
Small text: Get your Architecture Map in 48h.
```

### Secondary CTA
```
[ VIEW CAPABILITIES ]
(Links to the Daedalus grid)
```

---

## Execution Challenge

### Priority 1 (TODAY)
**CSS Fix**: Add background panels to text blocks. If people can't read it, copy doesn't matter.

### Priority 2
**Hero Tweak**: Add 3 bullet points under subhead. Anchors "Mischief" in "Engineering."

### Priority 3
**Audit Promise**: Add line `// Deliverable: Architecture Map in 48h` under main button.

---

## The Shift

**From**: "Cyberpunk Cosplay"
**To**: "The Agency You Hire To Fix The Mess"
