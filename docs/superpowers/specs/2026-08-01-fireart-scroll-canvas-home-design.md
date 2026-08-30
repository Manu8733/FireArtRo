# FireArtRo Scroll Canvas Home Design

## Status

Approved by the user's 2026-08-01 direction. This supersedes the post-hero flow in `HomeRunway.jsx`; the existing hero, navigation, logo, social controls, and hero background video remain unchanged.

## Reference Translation

The live Trionn homepage was inspected at desktop size through its public DOM, styles, JavaScript bundles, GSAP timelines, and a 60-frame capture of the Selected Work to Services transition. The implementation may translate the following mechanics but must not copy Trionn's code, brand, content, shaders, or exact layouts:

- a pinned split composition with a fixed editorial title and moving work panels;
- project media entering below the baseline before settling;
- a final panel that pushes the next scene into view;
- five synchronized transition bands;
- GPU precompilation before a Three.js scene becomes visible;
- compositor-only scroll animation wherever possible.

Research artifacts live in `frontend/output/research-trionn-live/` and are not production assets.

## Visual Grammar

- Palette: black, white, and one blue-to-black atmospheric range.
- No decorative one-pixel boxes, repeated bordered cards, nested cards, or square text containers.
- Media may use asymmetrical soft clipping or unframed full-bleed crops.
- Text stays concise. Each section has one short headline, one supporting line at most, and one clear action.
- Buttons are editorial links or soft magnetic surfaces, not generic pills or outlined rectangles.
- Motion is scroll-directed, reversible, and deterministic. Reduced-motion mode removes pinning and 3D movement without hiding content.

## Homepage Flow

### 1. Hero

Unchanged.

### 2. Selected Moments

Five real FireArtRo images move horizontally through a pinned split layout. The left half holds `Momente selectate` and `Vezi toata galeria`; the right half carries one dominant image at a time. Images enter from below, settle at center, then leave left. No visible card border.

### 3. Packages Assembly

The gallery's closing panel becomes a five-band blue-black transition. Five package slabs enter sequentially from the right and settle into a five-column lineup. Each slab exposes only category, package name, and a short fit statement. Hover/focus expands one slab slightly and reduces the others without reflow.

### 4. Team Focus

A generated wide group photograph contains four clearly separated placeholder people. Hover or keyboard focus dims the base group and reveals a sharp crop around the selected person. Activation opens an accessible modal using the same source image cropped to that person, plus role and one short biography. All content is explicitly marked placeholder in data, not in the public visual copy.

### 5. Partner Orbit

A single lazy Three.js canvas renders three spherical ribbons of logo tiles. Tiles use a custom GLSL rounded-cut alpha mask, so the objects do not read as sharp boxes. Scroll progress moves them from dispersed positions into a globe, rotates the three ribbons at different speeds, then releases them outward. `renderer.compile()` and one hidden render warm the GPU after textures are prepared. The loop pauses outside the viewport and all resources are disposed on unmount.

### 6. Brief Image

A wide FireArtRo image closes the narrative. It carries only `Ai un eveniment in minte?` and `Trimite brief-ul`, with the action embedded in the image composition rather than another card.

### 7. Facebook Reviews

Every public page displays a compact Facebook Reviews band immediately before the footer. Until verified review data exists, it shows no rating, quote, name, or result. It links to the live FireArtRo Facebook reviews URL. Managed reviews can be rendered only when `source` is `Facebook` and `replaceable` is false.

## Performance Contract

- Maximum one WebGL canvas on the homepage and none on other routes.
- Pixel ratio capped at 1.5; no post-processing pipeline.
- Canvas animation pauses when offscreen and in reduced-motion mode.
- Gallery and package movement uses transforms, clip-path, and opacity only.
- Images below the fold are lazy-loaded and decoded asynchronously.
- No new video assets for these sections.

## Accessibility Contract

- Every interactive person is a real button with a visible focus state.
- Team modal supports Escape, focus management, labelled title, and close button.
- Package cards remain links/buttons and do not rely on hover alone.
- Canvas has a text alternative and partner names remain present in semantic HTML.
- Reduced-motion layout is fully readable without pinning or hidden panels.

## Verification

- Playwright asserts section order, five gallery items, five package items, four team people, modal behavior, partner fallback text, Facebook review links, and no horizontal overflow.
- A frame sampler records 60 states for Gallery, Packages, Team, Partner Orbit, and button interaction; contact sheets are stored under `frontend/output/motion-study/`.
- Production build and targeted Playwright tests must pass before completion.
