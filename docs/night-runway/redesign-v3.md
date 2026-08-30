# FireArtRo Redesign V3

## Intent

FireArtRo must feel like a live performance brand, not a SaaS dashboard and not a stack of marketing cards. The page language is cinematic, dark, quiet, and precise. Motion connects scenes; it never decorates empty space.

## Rejected Patterns

- dashboard, telemetry, control-room, signal, runway, or system metaphors in visible copy
- large text outside the hero
- repeated full-screen sections with text over a background image
- rounded cards, nested cards, metric tiles, and generic feature grids
- huge gallery images without a clear viewing rhythm
- long explanatory copy in Contact or FAQ
- simultaneous continuous animations competing for attention

## Visual System

- canvas: `#030407`
- surface: `#080b11`
- primary text: `#f4f6fb`
- secondary text: `#aeb7c7`
- electric accent: `#4169ff`
- cold accent: `#8eb8ff`
- borders: `rgba(151, 174, 215, 0.22)`
- corners: `0-4px`; clipped corners are preferred over rounded cards
- hero is the only display-scale text area
- page headings: `clamp(2rem, 4vw, 3.8rem)` maximum
- body copy: `0.95-1.05rem`, maximum `60ch`

## Section Shutter

The transition is inspired by Trionn's timing model but implemented from scratch for FireArtRo.

- five horizontal bands cover the outgoing scene on desktop; four remain on mobile
- each band starts at `scaleY(0)` with `transform-origin: bottom`
- scroll range: about `110vh` beyond the viewport on desktop and `65vh` on mobile
- each band uses `0.30` of normalized progress
- start offsets run bottom-to-top across `0.30` of normalized progress
- every band uses the same blue-black tone, `#071a2c`, so the transition remains visible without reading as neon
- the outgoing media remains visible through uncovered gaps
- the next scene is already behind the bands and is revealed as they pass
- the scene changes after full coverage, followed by a short `0.10` hold and a top-to-bottom reveal
- no opacity fade on the whole page
- reduced motion renders a single static divider and switches content without pinning

## Route Shutter

The live Trionn source and three 60-frame Chrome screencasts established the route cadence.

- ten equal horizontal belts are always rendered, including on mobile
- cover: `680ms`, cubic-out, `52ms` stagger from top to bottom
- the route changes only after every belt has closed
- reveal: `580ms`, cubic-in, `52ms` stagger in reverse order
- FireArt uses one blue-black tone, `#071a2c`, instead of Trionn's white/black belts
- there is no center label or decorative mark; the bands carry the transition alone

## Landing Architecture

1. Hero: existing background video, logo, header, and social controls; copy is short and positioned above vertical center.
2. Brand statement: one compact black scene with a single sentence and three production steps.
3. Performance stage: one pinned stage for Drone / Artificii / Efecte. Media, title, and one action change inside the same frame.
4. Section shutter: one-color blue-black bands fragment the stage and reveal the gallery preview.
5. Gallery preview: one medium selected image with a compact horizontal filmstrip. No masonry grid.
6. Compact process line: four labels on one baseline; no cards.
7. Final contact frame: one sentence, one action, compact footer.

## Page Structures

- Pachete: vertical category index plus one selected poster and compact fact rail; no pricing cards.
- Galerie: numbered filter rail plus fixed medium viewer and filmstrip; no oversized image wall.
- Intrebari: editorial two-column accordion with concise answers.
- Contact: compact form and direct contact details; no long introduction or multi-step dashboard.
- Footer: one compact band with navigation, legal links, and contact details.

## Copy Rules

- use direct Romanian, not campaign filler
- one idea per heading
- no invented metrics, clients, reviews, awards, or guarantees
- no visible technical metaphors
- Contact gets no more than two short introductory lines
- CTA labels describe the next action: `Cere oferta`, `Vezi galeria`, `Alege pachetul`

## Performance Guardrails

- GSAP owns scroll timelines; React does not update on every scroll tick
- no WebGL overlay on the landing page
- `prefers-reduced-motion` disables pinning and scrub animation
- videos use metadata preload and pause when offscreen
- route and section transitions animate transforms only
- no layout reads inside animation frames after initial measurement

## QA Contract

- capture 60 frames across each detailed desktop shutter transition
- verify 1440x900 and 1920x1080 desktop
- verify 430x932, 568x320, and 844x390 mobile/landscape
- assert no horizontal overflow, clipped copy, header overlap, or CTA below viewport bounds
- interactive targets remain at least 44px
- the landing page must not mount a decorative WebGL canvas
