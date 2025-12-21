# App Page Fix

## Summary

Fixed invalid JSX structure in `app/page.tsx` by closing the `#protocol` section’s outer wrapper `<div>` before closing the `<section>`.

## Why

The `#protocol` (“PROCESS”) section opened an outer wrapper:

- `<div className="max-w-7xl mx-auto px-6 relative z-10">`

but did not close it before `</section>`, which breaks JSX parsing and can prevent builds from succeeding.

## Files changed

- `app/page.tsx`
  - Added a missing `</div>` immediately before the `</section>` closing tag for the `#protocol` section.

## Notes

- No functional/behavioral changes beyond restoring valid JSX nesting.

