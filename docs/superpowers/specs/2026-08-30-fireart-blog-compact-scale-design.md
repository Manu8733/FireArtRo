# FireArtRo Blog — compact scale design

## Context

The Blog surfaces currently use a cinematic scale that is disproportionate to their informational role. At a 1920×1080 desktop viewport, the archive hero consumes most of the visible page, the title is oversized, and the empty or error state starts below the fold. The same generous minimum heights create unnecessary empty space in cards without cover images.

## Goal

Reduce the perceived scale of every Blog surface by roughly 40% while preserving the existing Night Runway palette, typography families, square geometry, accessibility behavior, routes, and data flow. No non-Blog page or shared navigation element may change.

## Scope

The correction applies only to:

- the three-article Blog section on the landing page;
- the `/blog` archive hero, grid, cards, and empty/error state;
- the `/blog/:slug` article header, cover spacing, and body measure.

Admin behavior, API behavior, content, footer structure, navbar scale, and other site sections are out of scope.

## Approved visual direction

### Archive

- Keep the desktop archive hero at or below 360 px of visible height below the navbar at 1920×1080.
- Reduce the desktop `Blog` heading to a maximum of 88 px and the mobile heading to a maximum of 52 px.
- Keep the eyebrow, title, and short description, but tighten their vertical spacing.
- Bring the archive content close enough that the first row or empty/error state is visible in the initial 1920×1080 viewport.
- Reduce archive section padding to a compact editorial rhythm rather than the global cinematic section rhythm.

### Cards

- Remove oversized fixed minimum heights where content does not require them.
- Use a compact baseline height on desktop and allow cards to grow naturally for longer titles or excerpts.
- Preserve minimum 44 px action targets, visible focus, three columns on wide desktop, two on tablet, and one on mobile.
- Keep the newest landing article visually dominant, but reduce both the lead card and compact cards proportionally.

### Landing section

- Reduce the heading scale, section padding, lead-card height, internal padding, and gaps.
- Cap the landing Blog heading at 56 px on desktop and 36 px on mobile.
- Keep landing Blog section padding at or below 88 px per side on wide desktop.
- Preserve the asymmetric one-lead-plus-two-secondary composition on desktop and the existing single-column mobile flow.
- Keep `Vezi tot blogul` clearly separated from the grid without a large empty band.

### Article page

- Reduce the article title maximum to 56 px on desktop and 42 px on mobile.
- Tighten the top offset below the navbar, header spacing, cover margins, and paragraph-section spacing.
- Preserve the current readable text measure, safe plain-text rendering, and metadata hierarchy.

## Responsive and accessibility constraints

- No horizontal overflow at 430×932, 844×390, or 568×320.
- Important actions remain at least 44 px high.
- Existing focus-visible and reduced-motion behavior remains intact.
- The empty/error state must be visible without scrolling on a 1920×1080 desktop viewport.
- Typography must remain legible without truncating titles or excerpts.

## Verification

- Add a regression assertion for the archive hero height and title size at a 1920×1080-equivalent viewport.
- Verify the empty/error state begins inside the initial desktop viewport.
- Re-run the existing Blog desktop and mobile end-to-end suites.
- Build the frontend and inspect fresh desktop and mobile screenshots of the landing section, archive, and article page.
