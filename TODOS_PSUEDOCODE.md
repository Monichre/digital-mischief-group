## Goal

Align `TODOS.md` with the Daedalus PRD and README, and switch effort estimates from day-based values to t‑shirt sizing while keeping the backlog structure intact.

## Inputs

- `TODOS.md` — current ticket backlog (18 tickets, mixed effort format).
- `PRD.md` — canonical product requirements and user stories.
- `README.md` — high-level primitive status and architecture.
- `prd.json` — structured representation of PRD user stories (US-001..US-007).

## High-Level Steps

1. Parse `prd.json` user stories and map each US to one or more existing tickets in `TODOS.md`.
2. Identify user stories that are not clearly represented in the current tickets.
3. Decide on minimal new tickets required to cover missing user stories.
4. Define a consistent t‑shirt sizing scheme to replace day-based effort estimates.
5. Apply effort sizing across all tickets for consistency.
6. Update ticket counts and legend metadata in `TODOS.md` to reflect new tickets and sizing.

## Detailed Pseudocode

1. **Map user stories to tickets**
   - For each `userStory` in `prd.json.userStories`:
     - Read `id`, `title`.
     - Manually map:
       - `US-001` (CSV enrich) → Ticket #3 (Enrich Guardrails), Ticket #8 (CSV Enrichment Flow).
       - `US-002` (single lead enrich) → partially Ticket #3, but no explicit single-lead UX ticket.
       - `US-003` (brand identity from URL) → partially Ticket #10 (Brand Asset Generation), but no core extract ticket.
       - `US-004` (monitor changes) → Ticket #5 (Observe Reliability).
       - `US-005` (scouts) → Ticket #6 (Scout Dedup & Scheduling).
       - `US-006` (agent research sessions) → Ticket #11 (Research Split-View Reliability).
       - `US-007` (plans/usage/billing) → Ticket #12 (Settings & Billing), Ticket #16 (Usage-Based Credits).
   - Record any user stories with only partial or implicit coverage:
     - `US-002`, `US-003`.

2. **Decide new tickets**
   - For `US-002`:
     - Create new Ticket `#19: Single Lead Enrichment Flow` in the `🟡 P1: Experience & Conversion` section.
     - Module: `enrich`.
     - Checklist:
       - Single-lead input UX (email/name/domain).
       - Validation and error display.
       - Wiring into existing enrich workflow and tables.
     - Acceptance criteria mapping directly to US-002 narrative.
   - For `US-003`:
     - Create new Ticket `#20: Brand Identity Extract Core` in the `🟡 P1: Experience & Conversion` section.
     - Module: `extract`.
     - Checklist:
       - Core Firecrawl-based extraction for brand identity (logo, colors, fonts, voice, key messages).
       - Zod schema for brand identity.
       - UI surface that displays structured brand identity for a URL.
     - Acceptance criteria mapping to US-003 success statement.
   - Increment total ticket count in header from `18` to `20`.

3. **Define t‑shirt sizing mapping**
   - Use a simple deterministic mapping from current day estimates:
     - `2 days` → `S`
     - `3 days` → `M`
     - `4 days` → `L`
   - Leave `TBD` values unchanged.
   - For new tickets:
     - Assign:
       - Ticket #19 → `S` (narrow UX + wiring).
       - Ticket #20 → `M` (core extract with schema + UI).

4. **Update legend**
   - In the Legend section of `TODOS.md`, append an Effort legend:
     - `S` = Small
     - `M` = Medium
     - `L` = Large
     - `TBD` = To be determined or exploratory.

5. **Apply effort changes**
   - For each existing ticket line matching `**Priority:** ... | **Effort:** X days | ...`:
     - Replace `3 days` with `M`.
     - Replace `2 days` with `S`.
     - Replace `4 days` with `L`.
   - Ensure Tickets #14 and #15, which already use `S`/`L`, are left intact.
   - Verify that only effort tokens are changed; priorities, modules, and titles stay the same.

6. **Insert new tickets**
   - In the `🟡 P1: Experience & Conversion` section, after Ticket #12:
     - Insert Ticket #19 block (title, priority/effort/module, checklist, acceptance criteria).
     - Insert Ticket #20 block with the same structure.
   - Maintain markdown separators (`---`) consistent with existing tickets.

7. **Consistency checks**
   - Confirm:
     - Header `Total Tickets` equals actual count (20).
     - All tickets have `Priority`, `Effort`, `Module`, checklist, and acceptance criteria sections.
     - User stories `US-001`..`US-007` now each have explicit or clearly mapped ticket coverage.

8. **Document work**
   - Create `Todos.md` summarizing:
     - Alignment decisions between PRD user stories and tickets.
     - New tickets added and why.
     - Effort sizing scheme and its mapping.

