# FireArtRo Fluid Site and Safe-Title Hero Design

**Date:** 2026-09-02
**Status:** Approved direction — option 1
**Scope:** Public FireArtRo website, homepage cinematic sequence, and responsive hero media

## 1. Problem statement

The current implementation technically avoids horizontal overflow, but it does not maintain an adequate visual scale on high-resolution and ultrawide CSS viewports.

The measured failures are:

- At `5120×1440`, the homepage gallery stage is capped at `2560px`, each panel is half of that stage, and the actual image is only `1152px` wide. The image therefore occupies about `22.5%` of the viewport.
- Global navigation and inherited body text stop growing at roughly `15px`, which looks undersized on large CSS viewports.
- Many display headings, controls, media frames, and section paddings reach fixed maximums too early.
- The landscape hero master uses `object-fit: contain` for drone photographs. Black side bars are therefore baked into the delivered MP4s and cannot be removed by website CSS.
- Baked video titles and the live website hero copy do not share a collision contract. On MacBook-like landscape viewports, large words such as `DRONES + FIREWORKS` can sit behind the eyebrow, heading, description, or CTA controls.
- The hero-to-gallery handoff can expose a visual or motion discontinuity when video compositing, scroll pinning, and the first gallery frame change at the same boundary.

## 2. Design goals

1. Preserve the current FireArtRo visual identity, content, colors, page structure, and cinematic direction.
2. Make layout, typography, spacing, navigation, controls, cards, images, and motion adapt naturally to the CSS viewport.
3. Keep ordinary reading content centered and readable while allowing cinematic media and decorative backgrounds to use the full viewport.
4. Deliver full-bleed hero imagery without baked blur or black bars.
5. Preserve the large titles inside the video while guaranteeing that they never collide with the live website copy.
6. Maintain the important subject of every photograph across landscape and portrait exports.
7. Keep the hero-to-gallery transition visually continuous and smooth.
8. Verify all public pages, not only the homepage.

## 3. Non-goals

- No redesign of the brand, navigation structure, page content, package content, or existing animation concept.
- No global `transform: scale(...)`, `zoom`, or JavaScript page scaling.
- No device-name-specific CSS such as “MacBook”, “iPad”, or individual phone-model breakpoints.
- No backend, deployment, Blog, email, analytics, or unrelated feature changes.
- No blurred enlargement behind hero photographs.
- No removal of the baked cinematic titles.

## 4. Responsive architecture

### 4.1 Three container roles

The website will use separate container roles instead of one universal fixed maximum:

1. **Readable container** — prose, forms, FAQ answers, legal content, and long copy. Width is constrained by readable line length, normally in `ch`, with centered page gutters.
2. **Layout container** — navigation, section headings, grids, packages, reviews, and structured page content. It grows fluidly with the viewport but retains a generous maximum on ultrawide screens.
3. **Cinematic stage** — hero media, the pinned gallery sequence, and full-bleed visual sections. It can use the full viewport while its internal copy and controls remain bounded.

The existing `--nr-max: 90rem` must no longer control all three roles.

Conceptual tokens:

```css
--nr-readable-max: 72ch;
--nr-layout-max: clamp(90rem, 82vw, 220rem);
--nr-cinematic-width: 100vw;
--nr-gutter: clamp(1rem, 2.2vmin, 5rem);
```

Exact values may be tuned during visual verification, but the role separation is mandatory.

### 4.2 Fluid scale inputs

- Use CSS viewport dimensions, never physical display resolution or device pixel ratio.
- Prefer `clamp()`, container query units, `vmin`, `%`, grid `minmax()`, and aspect-ratio-aware layout.
- Use `vw` only where width should genuinely dominate; combine it with `vmin` or container units so ultrawide screens do not inflate type horizontally.
- Keep genuine layout-change breakpoints for mobile navigation, portrait composition, and compact landscape only.
- Do not add a breakpoint for every tested device.

### 4.3 Typography and controls

- Introduce bounded fluid tokens for microcopy, body copy, labels, headings, display type, navigation, logos, and controls.
- Large-screen typography must continue growing after the current `0.98rem`, `0.92rem`, `3rem`, and similar early caps.
- Minimum interactive target remains `44×44 CSS px`.
- Large viewports may increase control targets, navigation type, logo size, and social controls, but must retain the current visual hierarchy.
- Text columns remain readable; larger screens create stronger scale and spacing rather than excessively long lines.

## 5. Hero media design

### 5.1 Masters and delivery variants

Maintain two authored masters:

- Landscape master: `3840×2160`
- Portrait master: `2160×3840`

Derive the existing six responsive deliveries:

- `wide` — `1920×1200`
- `ultrawide` — `1920×900`
- `tablet-landscape` — `1440×1080`
- `tablet-portrait` — `1080×1440`
- `mobile` — `900×1600`
- `mobile-tall` — `900×1950`

React continues selecting variants atomically from CSS viewport aspect ratio during load, resize, rotation, page restore, and visual-viewport changes.

### 5.2 Full-bleed image contract

- Every photographic scene fills the authored master canvas.
- Replace the current `photo-contain` behavior with full-bleed `cover` framing.
- Do not use a blurred duplicate, dark side panels, or baked black bars to preserve the complete source image.
- Set an authored `object-position` per photograph and per master where needed.
- Preserve the important drone formation, firework burst, skyline, and visual focal point; peripheral cropping is acceptable when required for full bleed.
- Use the dedicated portrait composition rather than expecting one landscape crop to solve portrait framing.

### 5.3 Safe-title collision contract

The website copy and baked titles occupy different authored zones.

**Landscape and ultrawide:**

- Live website copy: left zone, approximately `4%–40%` of the viewport.
- Baked cinematic titles: right zone, approximately `48%–96%` of the master.
- Baked titles are right-aligned or composed inside that zone and may reduce in size to fit.
- No baked title glyph may enter the live-copy zone at its widest animated state.

**Portrait and tall portrait:**

- Live website copy: upper zone, approximately the first `48%` of the usable height.
- Baked cinematic titles: lower zone, approximately `56%–90%` of the master height.
- Titles remain inside horizontal safe gutters and may wrap or stack where the existing copy permits.
- No baked title may pass behind the website eyebrow, heading, description, or CTAs.

Title motion, timing, wording, color, and editorial character remain intact. Only layout, scale, and necessary travel distances change.

### 5.4 Website hero copy

- The live hero content uses its own readable left-zone width rather than the entire cinematic stage.
- Its title, description, metadata, and actions scale using both container width and usable viewport height.
- Compact landscape must reduce vertical gaps and type without hiding any line or CTA.
- Portrait must keep the complete copy above the baked-title zone.
- The hero video remains full-viewport with `object-fit: cover`; CSS overlays remain restrained and cannot simulate missing image area.

## 6. Homepage cinematic gallery

- The pinned gallery viewport becomes a true full-width cinematic stage instead of a `2560px` centered island.
- Intro, image panels, and outro use a fluid panel width based on the viewport, approximately `50–58vw` on landscape desktop.
- On ultrawide screens, the active image must remain visually dominant rather than shrinking below one quarter of the viewport.
- Card inner media width grows beyond the current `72rem` cap and is also bounded by viewport height so imagery remains balanced.
- Mobile and portrait layouts use a single dominant panel without horizontal clipping.
- Image aspect ratio, `object-fit`, and authored focal position prevent distortion.
- Scroll distance is recalculated from actual panel travel after every meaningful viewport or orientation change.
- Current animation sequence and content are preserved.

## 7. Other pages and components

Audit and adapt all public routes and shared components, including:

- global desktop and mobile navigation;
- homepage sections after the cinematic gallery;
- packages and package cards;
- gallery page and media grids;
- about/services content;
- FAQ;
- contact and quote forms;
- Blog landing and article layouts if present in the active checkout;
- legal pages;
- footer, social controls, cookie UI, dialogs, and floating controls.

For every route:

- backgrounds may remain full width;
- structured content uses the layout container;
- prose uses readable line lengths;
- grids use `auto-fit`/`minmax()` or intentional breakpoint changes;
- images preserve aspect ratio;
- no normal viewport has horizontal overflow;
- absolutely positioned decoratives remain anchored to their section rather than one reference resolution.

## 8. Hero-to-gallery handoff

- Hero bottom and gallery top use the same base color.
- The visual blend overlaps the boundary sufficiently to avoid a one-frame seam.
- The gallery pin starts only after the hero has completed its normal viewport exit.
- Video pause/resume logic must not trigger layout work at the exact scroll handoff.
- Avoid unnecessary large paint layers, blur, or synchronous measurement during the transition.
- Verify the boundary by recording dense consecutive frames while scrolling, not by comparing only two screenshots.

## 9. Performance and accessibility

- Keep H.264, 30 fps, `yuv420p`, fast-start delivery and current per-variant size budgets unless visual quality requires a documented adjustment.
- Posters must use the exact same crop and safe-zone layout as their corresponding videos.
- Do not load all hero variants simultaneously.
- Preserve autoplay requirements: muted, looping, inline playback, lifecycle recovery, and fallback poster.
- Preserve reduced-motion behavior and accessible live hero text.
- Baked video titles remain decorative; essential meaning stays available in live HTML.
- Avoid layout shifts when media metadata arrives.

## 10. Verification contract

Review at these CSS viewports:

- `375×812`
- `430×932`
- `768×1024`
- `1366×768`
- `1440×900`
- `1512×982`
- `1920×1080`
- `2560×1440`
- `3440×1440`
- `3840×2160`
- `5120×1440`

Required checks:

1. No horizontal overflow on any public route.
2. Navigation, logo, labels, body text, headings, cards, controls, and spacing retain an intentional visual scale.
3. Cinematic gallery stage uses the full viewport and its active media remains dominant at `3840×2160` and `5120×1440`.
4. Hero image reaches every viewport edge at representative photographic timestamps; no baked black bars or blurred fill remain.
5. Every baked title is fully visible and stays outside the live-copy safe zone.
6. Hero copy, metadata, description, and CTAs remain fully visible in portrait and compact landscape.
7. Rotation updates the media variant and geometry without a black frame, stale source, or clipped copy.
8. Leaving and returning to the page resumes the hero reliably.
9. Dense frame capture across the hero-to-gallery boundary shows no seam, freeze, or abrupt jump.
10. Build, focused tests, complete responsive matrix, and HyperFrames validation pass.

## 11. Acceptance criteria

The work is accepted when:

- the user-visible scale is appropriate across the complete viewport matrix;
- no page is implemented as a uniformly scaled desktop canvas;
- the hero is truly full bleed in pixels, not only in DOM geometry;
- video titles and website content never overlap;
- the first gallery section no longer appears as a small centered island on large screens;
- all public routes remain readable, aligned, and free of horizontal overflow;
- the hero-to-gallery transition is visually continuous;
- temporary diagnostic frames are removed;
- the final implementation is committed and pushed to `main` only after verification.
