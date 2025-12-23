## Goal
- Improve body paragraph readability on the home page by increasing font size and line height without touching focus styles.

## Scope
- File: `app/page.tsx`
- Elements: Long-form paragraphs (hero intro, friction narrative, summary line, warning body, weapon description, mission intro, CTA italics).

## Steps (Pseudo)
- Open `app/page.tsx` and locate paragraph `<p>` blocks with `text-lg`/`text-base`/`text-xl` and `leading-relaxed`.
- For each primary paragraph:
  - Increase size to `text-xl md:text-2xl` where appropriate (hero, friction, weapon, mission).
  - For shorter supporting lines, raise to `text-lg md:text-xl`.
  - Upgrade line height to `leading-8` (or `leading-7` for shorter italics) to maintain legibility at distance.
  - Preserve existing color and layout classes.
- Leave all focus/hover styles untouched per user direction.
- Re-read to ensure consistency and no layout regressions (max-widths remain).
- Document changes in `docs/HomePage.md`.

