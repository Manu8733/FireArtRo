# FireArtRo Contact, Navigation, and Ambient Cleanup Design

## Goal

Hide the identifiable team scene, remove the animated meteor canvas from interior pages, preserve the homepage navigation targets, and make the contact flow compact and consistent with the Night Runway interface.

## Chosen Direction

Replace the team scene with a quiet FireArtRo story section at the same `#intro` anchor. It presents the studio through concise copy and event imagery only; it contains no people, names, portraits, or team interaction.

The contact page becomes a compact event brief. A short editorial introduction and direct channels sit beside one form surface. The form remains the primary action and groups event details separately from contact details without changing its data contract, validation, optional details, or package-prefill behavior.

## Visual System

- Subject and audience: a FireArtRo event-show inquiry page for people who already have a date or location and need to start a serious conversation quickly.
- Palette: obsidian `#03050a`, carbon `#080c14`, paper `#f5f7fb`, ice `#8dd3ff`, electric `#4169ff`, muted `#97a6bc`.
- Typography: existing Sora display and Inter body, with the existing mono utility treatment for small labels.
- Layout: a compact two-column desktop brief that collapses to one column on touch devices. The form is a single bounded surface with field groups separated by rules rather than stacked cards.
- Signature: a narrow electric status rail at the top of the form and the existing clipped NightButton. The removed meteor canvas is not replaced with another moving decoration.

## Navigation Contract

- The logo always returns to `/#acasa` from every route and from every homepage scroll position.
- `Despre noi` continues to resolve to `#intro`, now the anonymous FireArtRo section.
- `Servicii` continues to resolve to `#spectacole`.
- `Pachete`, `Galerie`, `Intrebari`, and `Contact` retain their route URLs and use the existing route shutter.
- The gallery, packages, FAQ, and contact routes no longer mount an ambient canvas.

## Behaviour and Accessibility

- No change to the quote API payload, request timeout, inline validation, consent, optional details, or local-storage/query/package prefill.
- Touch and desktop controls keep their existing minimum target sizing.
- Route and hash interactions are covered on desktop and touch viewports, including no horizontal overflow.
- Reduced-motion behavior remains readable because the deleted decorative effect has no functional role.

## Acceptance Criteria

1. The homepage has no `home-team` section or identifiable team portraits, while `#intro` is still present and reachable from the navigation.
2. Gallery, packages, FAQ, and contact do not render `[data-testid='ambient-threads']` or a Three.js canvas.
3. Contact has a visible title, direct-contact controls, grouped fields, the existing optional details, and the standard NightButton CTA without horizontal overflow at 390px, 768px, and desktop.
4. Navbar paths and hash destinations work from the homepage, gallery, and contact routes, and the route shutter remains available for cross-route navigation.
