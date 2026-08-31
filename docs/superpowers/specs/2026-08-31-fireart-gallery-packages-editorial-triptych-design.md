# FireArt Gallery And Editorial Package Triptych

Status: approved direction, awaiting written-spec review

## Goal

Rebuild the first two homepage scenes after the hero as one reliable responsive sequence. The gallery keeps its cinematic horizontal story, while the package scene becomes a fast, text-led triptych built from three real Admin-managed FireArtRo packages. The result must remain complete and readable on desktop, phone, tablet, portrait, landscape, resize, and reduced-motion modes.

## Approved Direction

- Keep the existing hero and every later homepage section outside this change.
- Keep the three current catalog photographs in the gallery.
- Keep the gallery structure: editorial opening, three photographs, and the closing message `Spectacolul continuă.`
- Remove the duplicated gallery photograph and closing sheet from the package component. The gallery closing panel is the only closing panel.
- Replace the three YouTube-poster package slabs with three text-only editorial panels.
- Feature these real catalog entries, in this order:
  1. `fireworks-multicolor-2026` — `Multicolor`
  2. `fireworks-gold-2026` — `Gold`
  3. `fireworks-diamond-piromusical-2026` — `Diamond + Piromuzical`
- Do not add invented prices, recommendations, awards, guarantees, popularity claims, or package tiers.
- Preserve the Night Runway/TRON: Legacy visual grammar already documented by the project: obsidian and deep navy surfaces, white type, restrained electric-blue structure, and motion used only to explain hierarchy.

## Scene One: Gallery

### Content

The gallery continues to read as five beats:

1. `Selecție FireArtRo` / `Trei momente. O singură noapte.`
2. Drone show photograph
3. Night fireworks photograph
4. Day fireworks photograph
5. `Dincolo de cadru` / `Spectacolul continuă.` / gallery action

The catalog image source, alt text, category, and title remain data-driven through `HOME_GALLERY`.

### Motion And Geometry

- Use one measured horizontal track for all motion-capable layouts.
- Calculate panel width from the gallery viewport's `clientWidth`, never from raw `100vw`.
- Desktop panels remain half-scene compositions where appropriate; compact layouts use one complete viewport-width panel per beat.
- Scroll distance is derived from measured horizontal travel and keeps a consistent amount of physical scroll per panel. There is no compressed final transition and no long empty hold.
- The final photograph remains visibly in motion while the closing panel enters, then clears completely without a jump.
- On resize or orientation change, dimensions and ScrollTrigger geometry are recalculated. No stale desktop, portrait, or landscape transform may survive the refresh.
- Animate transforms and opacity only. Avoid layout-changing animation.

### Responsive Framing

- Desktop and regular landscape: wide cinematic frames, with the current photograph focal point preserved.
- Phone and tablet portrait: each photograph gets a complete readable panel and a portrait-friendly frame; metadata remains attached below the image and never leaves the viewport width.
- Short landscape phone and tablet: use a shallower 3:2 media frame so image, metadata, and navigation remain visible within the available height.
- Text must not clip at 200 percent text zoom and the page must not gain horizontal document overflow.

### Reduced Motion

Reduced-motion mode removes pinning and continuous scrub. The opening, three photographs, and closing panel render as a normal readable sequence with no content hidden by transforms or opacity.

## Transition Between Scenes

- The package scene follows the real gallery closing panel in normal document flow.
- Remove the negative one-viewport overlap and the replayed gallery handoff from `HomePackages`.
- Keep the same deep navy background through the boundary so the change reads as one continuous night scene, not a black gap.
- Use a restrained divider/light rail and spacing to indicate the new section. No duplicate photograph, crossfade collision, or full-screen blank hold is allowed.

## Scene Two: Editorial Package Triptych

### Data Contract

- Read package content through `useManagedContent("packages", PACKAGE_ITEMS)`.
- Resolve featured entries by stable ID, then render the current managed title, category, duration, description, best-for text, badge, and highlights.
- Preserve each package's real `id`, `title`, and `category` when opening the contact flow.
- If a featured ID is absent from managed content, omit that panel and let the remaining panels rebalance; do not invent replacement content or revive the retired homepage package data.
- The full `/pachete` page continues to consume the complete managed catalog and is outside the visual redesign scope.

### Panel Content

Each panel contains only useful decision information:

- sequence number;
- package title;
- category and factual badge when present;
- duration;
- short description;
- best-for line;
- up to three existing highlights;
- primary action `Cere ofertă`;
- no image, poster, video, play control, or external YouTube link.

The section also includes one secondary `Vezi toate pachetele` link to `/pachete`.

### Layout

- Desktop and landscape tablet at sufficient width: three equal editorial panels in one row.
- Portrait tablet and intermediate widths: three full-width horizontal panels stacked vertically. Information is distributed in aligned columns inside each panel, avoiding an unbalanced two-plus-one grid.
- Phone portrait and short landscape: three compact vertical panels in one column. Content order remains identical, line lengths stay short, and no fixed viewport-height container is used.
- Panels use hard edges, visible grid lines, generous internal spacing, and equal visual weight. No panel is labelled `recommended` or enlarged to manipulate selection.

### Interaction And Motion

- The package section is not pinned and does not consume several viewport heights.
- The heading and panels enter with a short staggered opacity/vertical translation when first revealed.
- All content is present in the accessibility tree and remains visible without JavaScript animation.
- Hover and keyboard focus may brighten the panel rail and move the arrow slightly, but touch devices never depend on hover to reveal information.
- Every interactive target is at least 44 by 44 CSS pixels and has a visible focus state.
- `prefers-reduced-motion` renders the final state immediately.

### Contact Flow

`Cere ofertă` uses the existing contact-navigation contract with:

- `package_id`: selected managed package ID;
- `package_title`: selected managed package title;
- `services`: selected package category.

This ensures the quote form opens with the actual package selected rather than navigating to an unprefilled generic contact screen.

## Performance

- Removing three YouTube thumbnails eliminates those image requests from the homepage.
- No new video, canvas, WebGL layer, or third-party embed is added.
- Gallery images remain lazy except where an existing continuity requirement explicitly needs eager loading.
- The package section uses semantic HTML and CSS layout; JavaScript is limited to managed-content selection, contact action, and optional entrance motion.

## Accessibility

- Use a labelled section heading and semantic articles for the three packages.
- Lists of highlights remain real lists.
- Preserve Romanian diacritics in all displayed copy.
- Maintain WCAG AA text contrast over every static and interactive state.
- Keyboard focus order follows visual order in all responsive layouts.
- Reduced motion, high text zoom, and touch-only input remain first-class layouts.

## Verification

Automated checks must cover:

- exactly the three approved real IDs when all are available;
- managed copy is rendered and fake homepage package names are absent;
- no image, video poster, YouTube link, or play control exists in the package triptych;
- package CTA preserves `package_id`, `package_title`, and category prefill;
- gallery final photograph moves progressively into the closing panel without jumping;
- the gallery timeline recalculates after portrait-to-landscape and landscape-to-portrait resize;
- no duplicate gallery handoff exists in the package section;
- no horizontal document overflow, clipped title, or covered CTA at `1440x900`, `1366x768`, `1024x768`, `834x1194`, `430x932`, `390x844`, `360x800`, `844x390`, and `568x320`;
- reduced-motion content remains complete and readable;
- production build succeeds without new console errors.

Visual verification must sample the gallery opening, each image frame, the photo-to-closing transition, the section boundary, and the complete package triptych on desktop, portrait phone, portrait tablet, and short landscape phone.

## Out Of Scope

- Hero video, navigation, and social dock changes.
- Redesigning the full Packages page or changing package catalog content.
- Replacing the three approved gallery photographs.
- Changes to About, Partners, Brief, Blog, Reviews, or Footer.
- Adding prices or new packages.
