# App Page Fix — Pseudocode

## Objective

Ensure `app/page.tsx` is valid TSX/JSX and compiles cleanly by fixing structural tag mismatches.

## Findings

The `#protocol` (Process) section opens an outer wrapper:

- `<section id="protocol">`
  - `<div className="max-w-7xl ...">`

But the wrapper `<div>` is not closed before the section ends. This breaks JSX parsing and will fail builds/linting.

## Minimal fix (pseudocode)

- Locate the `#protocol` section in `app/page.tsx`
- Identify the outer wrapper `<div className="max-w-7xl mx-auto px-6 relative z-10">`
- Ensure closing tags are properly nested:
  - Close the inner CTA container (`<div className="text-center">`) as-is
  - Add `</div>` to close the outer wrapper
  - Then close the section with `</section>`

## Expected result

- JSX tree is well-formed.
- `app/page.tsx` parses and compiles.
