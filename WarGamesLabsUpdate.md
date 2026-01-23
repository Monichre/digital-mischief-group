## War Games Labs/Simulations Update

### Summary

The `war-games` page has been refreshed to emphasize **labs/simulations** as the core unit of work instead of “missions”, and to slightly modernize the HUD-style visual design without touching the underlying wiring or feature modules.

### Terminology Changes (UI-Only)

- Updated visible copy to talk about **labs** or **lab runs** where we previously said “missions”:
  - Usage indicator now shows `{remaining}/{limit} LAB RUNS`.
  - Briefing text describes “5 live labs/simulations” instead of missions.
  - Rules section references `labs/day` and “lab runs” for limits.
  - The active list header is labeled `ACTIVE_LABS`.
  - The back link from a selected experience reads `← Labs`.
  - Primary CTAs now say **Launch Lab** instead of **Launch Mission**.
  - Activity default detail reads “Lab executed with default payload.”.
  - The conversion gate references **War Games Lab Locked**, **Lab Limit Reached**, and **Unlimited Labs**.

- All internal types and IDs (`Mission`, `MISSIONS`, `startMission`, etc.) remain unchanged to avoid broad refactors; the change is intentionally **presentation-only**.

### Design and Color Adjustments

- **Background grid**
  - Retuned the fixed grid overlay from a pure emerald tint to a **cooler cyan/emerald blend** to feel more like an experimental simulation surface while keeping the military HUD feel.

- **Emphasis and hierarchy**
  - The usage indicator accent now uses `text-emerald-400` for the label, aligning with the lab/simulation framing.
  - Section and header copy still uses the existing typography and layout, but with wording nudged toward “labs” and “simulations” rather than purely tactical missions.

- **CTAs and gating**
  - Primary CTAs (e.g., upgrade and launch) still use the established orange accent so they remain visually dominant.
  - The paywall gate copy now clearly frames the upgrade in terms of **lab executions** and **lab runs**, matching the rest of the page language.

### Intent and Constraints

- **No behavior changes**:
  - All mission/lab tiles still route into the same feature modules:
    - `AgentSandbox` for agent experiments.
    - `PromptLab` for prompt experiments.
    - `DocumentLab` for PDF/document analysis.
  - Stripe upgrade behavior, daily limits, and streaming logic are untouched.

- **Future Work (optional)**
  - If/when we want to fully align the internal model with the UI naming, we can:
    - Introduce a thin “lab” abstraction that wraps the existing `Mission` model.
    - Gradually migrate type and variable names in `war-games` and feature modules with targeted refactors, keeping routes and behavior stable.

