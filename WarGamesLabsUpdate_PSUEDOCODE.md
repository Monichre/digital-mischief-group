## Objective

Refresh the `war-games` simulation screen so that the core units are framed as **labs/simulations** instead of missions, and slightly retune the color system to feel more like an experimental lab environment while preserving the existing military HUD vibe and all underlying logic.

## Scope

- Only touch:
  - `src/app/(pages)/war-games/page.tsx` (copy + styling)
  - New docs: this pseudocode file and a brief implementation notes file.
- Do **not** change:
  - Feature internals in `src/features/war-games/*` (AgentSandbox, PromptLab, DocumentLab).
  - Routing, IDs, or enums used as wiring (keep `Mission` type and IDs for now).

## High-Level Changes

1. **Terminology shift (UI-only)**
   - Reframe “missions” as **labs** / **simulations** wherever visible to the user.
   - Keep internal types named `Mission` to avoid broad refactors.

2. **Color + hierarchy update**
   - Soften the heavy orange emphasis; lean into **emerald/cyan + subtle amber** as accents.
   - Make the “lab cards” feel more like experiment tiles (clearer titles, classification, and controls).
   - Ensure important CTAs (start lab, upgrade) still pop with a single primary accent.

3. **Copy and structural tweaks**
   - Adjust hero heading/subcopy to reference simulations/labs.
   - Update the briefing and rules bullets to speak in lab language.
   - Update the free/pro gate wording accordingly.

## Detailed Pseudocode

### 1. Terminology Updates in `war-games/page.tsx`

1.1 **UsageIndicator**
- Locate label text: `"{remaining}/{limit} MISSIONS"`.
- Change to `"LAB RUNS"` or `"LABS"` while preserving numeric behavior.

1.2 **Briefing section copy**
- In “What you can do” list:
  - Replace “Run 5 live missions” with “Run 5 live labs/simulations” phrasing.
  - Keep individual lab names the same.
- In “Rules of engagement”:
  - Replace “missions/day” with “labs/day”.
  - Rephrase references to limits to talk about “lab runs”.

1.3 **Active mission header and back button**
- Change `ACTIVE_MISSIONS` label to `ACTIVE_LABS`.
- Change back button text from `← Missions` to `← Labs`.

1.4 **Start CTA and streaming/log text**
- Change primary CTA label from `Launch Mission` to `Launch Lab`.
- In `startMission` activity detail:
  - Keep behavior but update default detail string to “Lab executed with default payload.”.

1.5 **ConversionGate copy**
- Change “War Games Locked” → keep header, but adjust subcopy for labs.
- Change “Mission Limit Reached” → “Lab Limit Reached”.
- Change benefit tiles, e.g. “Unlimited Missions” → “Unlimited Labs”.

### 2. Color & Design Adjustments

2.1 **Background grid**
- Keep grid but shift tint from strong emerald to a cooler cyan/emerald mix by:
  - Adjusting rgba color in `backgroundImage` to a slightly lighter, cooler tone.

2.2 **Primary accents**
- Keep one primary accent (likely orange) for CTAs and upgrades.
- Slightly increase emerald/cyan presence on system status and simulation context labels.

2.3 **Mission cards → Lab tiles**
- For `MissionCard`:
  - Soften border from `border-white/5` to something that reads as a lab tile, but keep hover border accent.
  - Ensure classification and model/cooldown/tokens lines read clearly with the new terminology.
  - No behavioral changes.

2.4 **System labels**
- Ensure section labels (`WAR_GAMES`, `GLOBAL_NETWORK`, `CORE_MODULES`, etc.) remain consistent but fit the lab framing where they mention missions.

### 3. Non-Functional Checks

- Confirm that:
  - `startMission`, `selectedMission`, and `MISSIONS` wiring is untouched.
  - Labs still mount `AgentSandbox`, `PromptLab`, and `DocumentLab` exactly as before.
  - Stripe upgrade link and gate behavior are unchanged.

### 4. Layout Prioritization for Active Lab

- In the main 3-column grid on the war-games page:
  - Keep the existing three logical regions:
    - Left: system status, core modules, quick actions.
    - Center: lab selection and active lab surface.
    - Right: global network and activity feed.
- When **no lab is selected**:
  - Preserve the current equal 3-column layout (`lg:grid-cols-3`), with each region taking 1 column.
- When a **lab is selected**:
  - Visually prioritize the center region by:
    - Making the center column span 2 grid columns on large screens (`lg:col-span-2`).
    - Ensuring the center region is ordered first (`lg:order-1`).
    - Keeping left and right regions each in their own column but ordered after the center (`lg:order-2` and `lg:order-3`).
  - Implement this via conditional Tailwind classes using the existing `cn` helper, without changing component structure or duplicating markup.

### 5. Documentation

- Create `WarGamesLabsUpdate.md`:
  - Briefly describe:
    - The terminology change (missions → labs/simulations) as **UI-only**.
    - Color/visual tweaks and intent.
    - Notes that mission IDs/types were intentionally left unchanged to avoid broad refactors.

