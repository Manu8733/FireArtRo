# FireArtRo Packages Studio Reel Design

## Goal

Rebuild `/pachete` as a compact, media-first package selector that feels editorial and cinematic instead of a large software configurator.

## Direction

The approved direction is **Studio Reel**. Cosmos informs the restraint: natural media proportions, quiet controls, generous negative space, short copy, and soft media corners. FireArtRo keeps its near-black night palette, blue light accents, and cinematic motion.

## Layout

- Use a compact intro row: eyebrow and `Pachete` on the left, one short explanatory sentence on the right.
- Present categories as a horizontal, scrollable rail with text labels only; remove decorative numbering.
- Place the selected package in a two-column editorial stage: a 16:9 media frame and a compact information column.
- Put package variants in a low contact-sheet strip beneath the main stage. Each variant uses a small thumbnail and title rather than another large panel.
- Keep the stage open. Use spacing and hairline separators, not a large enclosing border or nested cards.
- On mobile, order content as category rail, 16:9 media, title and useful facts, CTA, then horizontal variant strip.

## Content

- Limit the selected package description to the managed short description.
- Show at most three highlights and three decision facts.
- Keep all Admin-managed package data, YouTube URLs, contact prefill, and category filtering intact.
- Use direct Romanian labels: `Vezi clipul`, `Cere o configurație`, `Potrivit pentru`, `Durată`, `Format`.

## Motion

- Replace the five-band full-stage cover with a short media-only transition.
- Fade and translate the new frame over 260-360 ms; never hide the whole workspace.
- Respect `prefers-reduced-motion` and switch immediately in that mode.

## Responsive Contract

- Desktop media remains close to 16:9 and no taller than 62vh.
- Tablet uses a balanced stacked layout without horizontal page overflow.
- Mobile keeps 44px touch targets, a true 16:9 media frame, readable copy, and horizontally scrollable category/variant rails.
- Validate at 1440x900, 1024x768, 430x932, and 568x320.

## Accessibility

- Preserve tab semantics and keyboard navigation for categories and variants.
- Keep visible focus states, meaningful media alt text, and descriptive video controls.
- Preserve the contact prefill contract for the selected package.
