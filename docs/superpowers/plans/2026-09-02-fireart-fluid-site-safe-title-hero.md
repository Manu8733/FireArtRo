# FireArtRo Fluid Site and Safe-Title Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or equivalent inline execution to implement this plan task-by-task. Do not dispatch subagents; the user explicitly requested direct implementation in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete public FireArtRo website fluid across the approved viewport matrix while delivering truly full-bleed hero media whose baked titles never collide with the live hero content.

**Architecture:** Split responsive sizing into readable, layout, and cinematic container roles. Re-author the existing landscape and portrait HyperFrames compositions with full-bleed photographs and explicit title-safe zones, retain React's atomic aspect-ratio source selection, and verify perceptual scale plus pixel content rather than only DOM containment.

**Tech Stack:** React 19, CRA/CRACO, CSS Grid/Flexbox/container units, GSAP/ScrollTrigger, Playwright, HyperFrames, FFmpeg/FFprobe, PowerShell

## Global Constraints

- Preserve current FireArtRo visual identity, content, colors, page structure, and cinematic direction.
- Do not use global `transform: scale(...)`, `zoom`, or JavaScript page scaling.
- Do not add device-name-specific breakpoints.
- Use CSS viewport dimensions, not physical display resolution or DPR.
- Keep ordinary reading content centered and readable; cinematic media may use the full viewport.
- Hero photographs must be full bleed with no blurred duplicate, dark side panels, or baked black bars.
- Preserve baked video titles and their timing, wording, color, and editorial character.
- Landscape live copy occupies approximately `4%–40%`; baked titles occupy approximately `48%–96%`.
- Portrait live copy occupies the upper region; baked titles occupy approximately `56%–90%` vertically.
- Keep minimum interactive targets at `44×44 CSS px`.
- Preserve autoplay, muted looping, inline playback, lifecycle recovery, fallback posters, reduced motion, and accessible live hero text.
- Do not modify backend, deployment, email, analytics, Blog behavior, or unrelated features.
- Test all approved CSS viewports from `375×812` through `5120×1440`.
- Remove temporary screenshots and diagnostic frames before completion.
- Commit verified work in focused commits and push the final result to `main`.

---

## File map

### Responsive website

- Modify `frontend/src/styles/night-runway.css`: shared responsive tokens, shells, navigation, social controls, buttons, and route-wide size contracts.
- Modify `frontend/src/index.css`: global body sizing and legacy public-page container rules still used outside Night Runway sections.
- Modify `frontend/src/editorial-refresh.css`: remaining public-page typography and grids that override shared values.
- Modify `frontend/src/styles/night-home.css`: hero copy safe zone, fluid home sections, and hero-to-gallery handoff.
- Modify `frontend/src/styles/night-home-film.css`: full-width pinned gallery geometry, panel/media scale, packages, and later homepage sections.
- Modify `frontend/src/styles/night-gallery.css`: gallery-page layout container and media grid.
- Modify `frontend/src/styles/night-packages.css`: packages-page layout and cards.
- Modify `frontend/src/styles/night-faq.css`: FAQ heading, readable answers, and spacing.
- Modify `frontend/src/styles/night-contact.css`: form shell, field grid, and contact typography.
- Modify `frontend/src/styles/night-blog.css`: Blog listing/article readable widths and fluid type.
- Modify `frontend/src/styles/night-footer.css`: footer and final CTA layout scale.
- Modify `frontend/src/styles/night-reviews.css`: reviews stage and card geometry.
- Modify `frontend/src/components/night/HomeGallery.jsx`: geometry calculations only if CSS panel sizing requires an explicit measured custom property or smoother handoff lifecycle.
- Modify `frontend/src/components/site/HeroVideo.jsx`: lifecycle scheduling only if profiling proves it contributes to boundary jank; preserve source-selection behavior.

### Hero composition and delivery

- Modify `tmp/fireart-drone-fireworks-trailer-20s-hf/index.html`: landscape photograph focal-position classes and safe-zone markers.
- Modify `tmp/fireart-drone-fireworks-trailer-20s-hf/styles.css`: landscape full-bleed framing and right-side title layout.
- Modify `tmp/fireart-drone-fireworks-trailer-20s-hf/timeline-cinematic.js`: only title travel distances that depend on the new layout.
- Modify `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/index.html`: portrait photograph focal-position classes and safe-zone markers.
- Modify `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/styles.css`: portrait full-bleed framing and lower title layout.
- Modify `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/timeline-cinematic.js`: only title travel distances that depend on the new layout.
- Modify `scripts/render-responsive-hero.ps1`: keep deterministic cover exports and strengthen post-export validation.
- Replace `frontend/public/media/fireart-hero-*.mp4`: six optimized video variants.
- Replace `frontend/public/media/fireart-hero-*.webp`: matching posters.

### Tests and audit artifacts

- Modify `frontend/e2e/night-runway-full-bleed.spec.js`: replace the `2560px` bug contract with full-stage and dominant-panel behavior; inspect real media pixels.
- Modify `frontend/e2e/night-runway-responsive-matrix.spec.js`: use the complete approved viewport matrix and public routes.
- Create `frontend/e2e/night-runway-fluid-scale.spec.js`: minimum visual scale and container-role behavior.
- Create `frontend/e2e/night-runway-hero-safe-title.spec.js`: inspect title-colored connected components in the delivered video frames and map them against the live-copy box.
- Modify `frontend/e2e/night-runway-hero-lifecycle.spec.js`: retain rotation/restore behavior and add boundary-safe media lifecycle coverage only if needed.
- Create temporary frame/contact-sheet output under `output/responsive-audit/final-fluid-review/`; remove it after visual approval.

---

### Task 1: Lock the perceptual-scale regressions in failing browser tests

**Files:**
- Create: `frontend/e2e/night-runway-fluid-scale.spec.js`
- Modify: `frontend/e2e/night-runway-full-bleed.spec.js`
- Modify: `frontend/e2e/night-runway-responsive-matrix.spec.js`

**Interfaces:**
- Consumes: rendered DOM at the existing Playwright `baseURL` and current `data-testid` hooks.
- Produces: measurable contracts for cinematic width, active-card dominance, navigation/body scale, readable line lengths, and overflow.

- [ ] **Step 1: Replace the test that preserves the broken ultrawide cap**

Change the 32:9 gallery assertions from:

```js
expect(geometry.galleryWidth).toBeGreaterThan(1440);
expect(geometry.galleryWidth).toBeLessThanOrEqual(2560);
```

to behavior derived independently from the viewport:

```js
expect(geometry.galleryWidth).toBeGreaterThanOrEqual(geometry.viewportWidth * 0.98);
expect(geometry.panelWidth).toBeGreaterThanOrEqual(geometry.viewportWidth * 0.48);
expect(geometry.mediaWidth).toBeGreaterThanOrEqual(geometry.viewportWidth * 0.38);
```

Return `viewportWidth`, the first `.fa-work__card` width, and the first `.fa-work__card-inner` width from the page evaluation.

- [ ] **Step 2: Add a real large-viewport scale test**

Create a table-driven test at `1512×982`, `2560×1440`, `3840×2160`, and `5120×1440`. Use literal minimums:

```js
const cases = [
  { width: 1512, height: 982, navMin: 12, bodyMin: 14, heroTitleMin: 72, galleryTitleMin: 52, shellRatioMin: 0.9 },
  { width: 2560, height: 1440, navMin: 15, bodyMin: 16, heroTitleMin: 104, galleryTitleMin: 88, shellRatioMin: 0.75 },
  { width: 3840, height: 2160, navMin: 18, bodyMin: 18, heroTitleMin: 128, galleryTitleMin: 128, shellRatioMin: 0.7 },
  { width: 5120, height: 1440, navMin: 18, bodyMin: 18, heroTitleMin: 128, galleryTitleMin: 128, shellRatioMin: 0.6 },
];
```

For each case, read `font-size` from a desktop nav link, `body`, `.nr-hero__title`, and `.fa-work__intro h2`; assert each literal threshold. Measure a representative `.nr-shell` against `shellRatioMin`, and assert `scrollWidth <= clientWidth + 1`.

- [ ] **Step 3: Expand the route/viewport matrix**

Use these public routes:

```js
const routes = [
  "/",
  "/galerie",
  "/pachete",
  "/intrebari-frecvente",
  "/contact",
  "/blog",
  "/confidentialitate",
  "/termeni-si-conditii",
  "/cookies",
];
```

Use the exact approved viewports. On each route assert no horizontal overflow, a visible navigation mode, and a main element whose width does not exceed the CSS viewport.

- [ ] **Step 4: Run the focused tests and verify RED**

Run:

```powershell
cd frontend
npx playwright test e2e/night-runway-fluid-scale.spec.js e2e/night-runway-full-bleed.spec.js e2e/night-runway-responsive-matrix.spec.js --workers=1
```

Expected failures on current code:

- `5120×1440` gallery width is `2560px`, below `98%` of the viewport.
- active card/media widths are below the literal ratios.
- large-screen navigation/body text are below minimum visual sizes.

- [ ] **Step 5: Commit the regression tests**

```powershell
git add frontend/e2e/night-runway-fluid-scale.spec.js frontend/e2e/night-runway-full-bleed.spec.js frontend/e2e/night-runway-responsive-matrix.spec.js
git commit -m "test: cover fluid scale regressions"
```

---

### Task 2: Introduce readable, layout, and cinematic responsive roles

**Files:**
- Modify: `frontend/src/styles/night-runway.css`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/editorial-refresh.css`

**Interfaces:**
- Produces CSS custom properties `--nr-readable-max`, `--nr-layout-max`, `--nr-cinematic-width`, `--nr-font-body`, `--nr-font-nav`, `--nr-font-label`, and `--nr-control-size` for all later tasks.

- [ ] **Step 1: Add the shared fluid tokens**

Use these initial values in `:root`:

```css
--nr-readable-max: 72ch;
--nr-layout-max: clamp(90rem, 82vw, 220rem);
--nr-cinematic-width: 100vw;
--nr-gutter: clamp(1rem, 2.2vmin, 5rem);
--nr-section-space: clamp(4rem, 8vmin, 10rem);
--nr-font-label: clamp(0.7rem, 1.02vmin, 1rem);
--nr-font-body: clamp(0.9rem, 1.35vmin, 1.3rem);
--nr-font-nav: clamp(0.78rem, 1.25vmin, 1.25rem);
--nr-control-size: clamp(2.75rem, 4.2vmin, 4.75rem);
```

Keep `--nr-max` as a compatibility alias to `--nr-layout-max` while migrating selectors.

- [ ] **Step 2: Migrate shared layout and navigation**

Set `.nr-shell` and `.site-navbar-layout` to the layout role. Use `--nr-font-nav` for desktop links, scale the brand with `clamp(2.3rem, 4.2vmin, 4.75rem)`, and scale social controls from `--nr-control-size`. Keep mobile dimensions bounded by the existing safe-area layout.

- [ ] **Step 3: Replace the global body early cap**

Change public body typography from `clamp(0.86rem, 0.9vw, 0.98rem)` to `var(--nr-font-body)` while excluding `.admin-shell` from any public-route overrides. Keep form control font sizes at or above `1rem` on mobile to avoid iOS zoom.

- [ ] **Step 4: Migrate shared legacy/editorial containers**

Replace public `1220px`, `1240px`, `1320px`, and equivalent layout-shell maximums with `var(--nr-layout-max)` where they structure a whole section. Preserve narrower `ch`/`rem` caps for prose and individual cards.

- [ ] **Step 5: Run scale and existing navigation tests**

```powershell
cd frontend
npx playwright test e2e/night-runway-fluid-scale.spec.js e2e/night-runway-navigation-flow.spec.js --workers=1
```

Expected: global scale checks pass; homepage gallery checks remain RED until Task 3.

- [ ] **Step 6: Commit the responsive foundation**

```powershell
git add frontend/src/styles/night-runway.css frontend/src/index.css frontend/src/editorial-refresh.css
git commit -m "fix: add fluid public-site sizing roles"
```

---

### Task 3: Make the homepage gallery dominant and the handoff continuous

**Files:**
- Modify: `frontend/src/styles/night-home.css`
- Modify: `frontend/src/styles/night-home-film.css`
- Modify: `frontend/src/components/night/HomeGallery.jsx`
- Modify: `frontend/src/components/site/HeroVideo.jsx` only if profiling identifies lifecycle work at the boundary
- Test: `frontend/e2e/night-runway-full-bleed.spec.js`
- Test: `frontend/e2e/night-runway-navigation-flow.spec.js`

**Interfaces:**
- Consumes: shared responsive tokens from Task 2.
- Produces: `--nr-gallery-panel-width`, full-width `.fa-work__viewport`, measured ScrollTrigger travel, and a stable hero/gallery color handoff.

- [ ] **Step 1: Replace the cinematic cap and half-stage panel formula**

Use:

```css
.nr-home {
  --nr-cinematic-max: var(--nr-cinematic-width);
  --nr-gallery-panel-width: clamp(42rem, 54vw, 180rem);
}

.fa-work__viewport {
  width: 100%;
  max-width: none;
}

.fa-work__intro,
.fa-work__card,
.fa-work__outro {
  width: min(var(--nr-gallery-panel-width), var(--nr-scene-width, 100vw));
  min-width: min(var(--nr-gallery-panel-width), var(--nr-scene-width, 100vw));
}
```

Below the existing structural mobile breakpoint, use `--nr-gallery-panel-width: 100vw`.

- [ ] **Step 2: Remove the card-inner early cap**

Use a viewport- and height-aware media container:

```css
.fa-work__card-inner {
  width: min(90%, clamp(38rem, 42vw, 150rem));
}

.fa-work__card figure {
  height: clamp(18rem, min(70dvh, 62vw), 61rem);
}
```

Tune only if the approved viewport screenshots reveal clipping; retain `object-fit: cover` and per-item focal position.

- [ ] **Step 3: Scale gallery copy from both width and height**

Use `vmin`/container-aware clamps for intro/outro headings, metadata, and card titles so `5120×1440` does not stop at `48px` while `1366×768` remains balanced.

- [ ] **Step 4: Recalculate ScrollTrigger from actual panel widths**

Keep `measure()` as the single geometry source. Confirm that `track.scrollWidth - viewportWidth` drives travel and that refresh preserves normalized progress after width/orientation changes. Do not introduce hardcoded device distances.

- [ ] **Step 5: Remove handoff contention**

Use one exact `--nr-handoff-color` at both hero bottom and gallery top, overlap the gradient by one CSS pixel, and profile the boundary. If `HeroVideo` watchdog work lands at the boundary, defer recovery while the hero is fully offscreen without detaching/reloading the source.

- [ ] **Step 6: Run focused gallery and lifecycle tests**

```powershell
cd frontend
npx playwright test e2e/night-runway-full-bleed.spec.js e2e/night-runway-navigation-flow.spec.js e2e/night-runway-hero-lifecycle.spec.js --workers=1
```

Expected: stage/panel/media ratios pass at 32:9; lifecycle and navigation behavior remain green.

- [ ] **Step 7: Commit the gallery and handoff fix**

```powershell
git add frontend/src/styles/night-home.css frontend/src/styles/night-home-film.css frontend/src/components/night/HomeGallery.jsx frontend/src/components/site/HeroVideo.jsx frontend/e2e/night-runway-full-bleed.spec.js
git commit -m "fix: expand cinematic gallery and smooth handoff"
```

---

### Task 4: Write failing pixel-level tests against the delivered hero video

**Files:**
- Create: `frontend/e2e/night-runway-hero-safe-title.spec.js`
- Modify: `frontend/e2e/night-runway-full-bleed.spec.js`

**Interfaces:**
- Consumes: real same-origin MP4 frames, the browser's video decoder/canvas, and the live `.nr-hero__content` geometry.
- Produces: pixel-content contracts for edge coverage and non-collision that remain valid in a fresh checkout.

- [ ] **Step 1: Add a deterministic video-frame sampler**

Override `play()` on the test video instance, seek to a requested timestamp, wait for `seeked`, draw the frame to an offscreen canvas, and return pixel data downsampled to at most `480px` wide:

```js
async function sampleVideoFrame(page, seconds) {
  return page.locator(".hero-media-video").evaluate(async (video, time) => {
    video.play = () => Promise.resolve();
    video.pause();
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("seek timeout")), 5000);
      video.addEventListener("seeked", () => { clearTimeout(timer); resolve(); }, { once: true });
      video.currentTime = time;
    });
    const width = Math.min(480, video.videoWidth);
    const height = Math.round(width * video.videoHeight / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0, width, height);
    return { width, height, pixels: [...context.getImageData(0, 0, width, height).data] };
  }, seconds);
}
```

- [ ] **Step 2: Detect title-colored connected components**

Classify near-paper, ember, and acid pixels with tolerant H.264 ranges. Run four-neighbor connected-component analysis inside the central `10%–90%` vertical band, discard components smaller than `0.025%` of the frame, and union the remaining display-letter components. Fail if no component is found.

- [ ] **Step 3: Assert landscape title and live-copy separation**

At `1.4`, `2.95`, `4.0`, `5.9`, `6.8`, `9.1`, `10.7`, `13.1`, `16.0`, and `18.7` seconds, assert detected title pixels remain inside normalized `x=0.46–0.98`. Map the detected media box through the actual `object-fit: cover` geometry at `1366×768`, `1512×982`, `2560×1440`, `3024×1964`, `3440×1440`, and `5120×1440`; assert it does not intersect the live hero eyebrow/title/description/actions union.

- [ ] **Step 4: Assert portrait title and live-copy separation**

At the same title timestamps, assert detected title pixels remain inside normalized `y=0.54–0.92` and `x=0.04–0.96`. Map them at `375×812`, `430×932`, `768×1024`, and rotated tablet/phone viewports; assert no intersection with live hero content.

- [ ] **Step 5: Strengthen full-bleed edge sampling**

At `16.0s`, sample the outer `6%` strips within the lower `35%` of each landscape variant. Assert both strips have spatial detail above a hand-derived threshold and are not a uniform near-`#050607` field. For portrait variants, sample the top/bottom `6%` strips in the central horizontal region.

- [ ] **Step 6: Run the tests and verify RED**

```powershell
cd frontend
npx playwright test e2e/night-runway-hero-safe-title.spec.js e2e/night-runway-full-bleed.spec.js --workers=1
```

Expected: current landscape files fail edge-detail sampling because their side bars are baked into the MP4, and at least one title timestamp fails the safe-zone/collision contract.

- [ ] **Step 7: Commit the media regression tests**

```powershell
git add frontend/e2e/night-runway-hero-safe-title.spec.js frontend/e2e/night-runway-full-bleed.spec.js
git commit -m "test: cover hero pixels and title collisions"
```

---

### Task 5: Re-author full-bleed landscape and portrait compositions

**Files:**
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/index.html`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/styles.css`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-hf/timeline-cinematic.js`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/index.html`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/styles.css`
- Modify: `tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/timeline-cinematic.js`
- Test: local HyperFrames checks/snapshots followed by the tracked delivered-media tests in Task 6

**Interfaces:**
- Consumes: existing composition IDs, clip IDs, media paths, and 20-second GSAP timelines.
- Produces: ignored local working masters at 3840×2160 and 2160×3840 with full-bleed images and non-colliding title zones. Only deployable outputs and tests are committed; the multi-gigabyte `tmp/` projects remain intentionally ignored.

- [ ] **Step 1: Replace photograph containment with authored cover framing**

Change all photographic nodes to full-bleed cover and add semantic focal classes such as `focus-left`, `focus-center`, `focus-right`, `focus-high`, and `focus-low`. Define separate values in each composition; do not share landscape coordinates with portrait.

- [ ] **Step 2: Implement the landscape title zone**

Use fixed master-frame geometry:

```css
.type-run {
  place-items: center end;
  padding: 145px 153px 145px 1843px;
}

.word {
  max-width: 1844px;
  text-align: right;
  transform-origin: 100% 50%;
}

.type-run-left {
  place-items: center end;
  padding: 145px 153px 145px 1843px;
}

.combo-title {
  width: 1740px;
  text-align: right;
}
```

Reduce individual font sizes only enough for the real measured boxes to stay inside `1843–3687px`.

- [ ] **Step 3: Implement the portrait lower title zone**

Use:

```css
.type-run {
  place-items: center;
  padding: 2150px 130px 384px;
}

.formation-stack {
  inset: 2150px 130px 384px;
}

.type-run-left {
  place-items: center;
  padding: 2150px 130px 384px;
}
```

Size and wrap display text only where necessary to remain inside the real safe box.

- [ ] **Step 4: Adjust transform travel without changing beat timing**

Update only entrance/exit `x`/`y` distances whose direction now conflicts with right alignment or the lower portrait zone. Keep every `runWindow()` boundary and the total `20s` duration unchanged.

- [ ] **Step 5: Validate and snapshot both compositions**

```powershell
cd tmp/fireart-drone-fireworks-trailer-20s-hf
npx hyperframes check
npx hyperframes snapshot --at 1.2,3.9,6.8,9.1,10.8,12.9,16,18.7

cd ../fireart-drone-fireworks-trailer-20s-mobile-hf
npx hyperframes check
npx hyperframes snapshot --at 1.2,3.9,6.8,9.1,10.8,12.9,16,18.7
```

Expected: no lint/runtime/layout/motion/contrast errors and all sampled titles remain in their safe zones over full-bleed photographs.

- [ ] **Step 6: Start Studio preview and pause for user visual approval**

```powershell
npx hyperframes preview --background
```

Open the preview in Codex. Do not render final masters until the user approves the landscape and portrait preview.

- [ ] **Step 7: Preserve the approved local source without tracking generated bulk**

Keep both ignored HyperFrames project directories in place for the render step. Do not force-add their assets, snapshots, caches, or renders to Git.

---

### Task 6: Render, export, and test the six real hero variants

**Files:**
- Modify: `scripts/render-responsive-hero.ps1`
- Replace: `frontend/public/media/fireart-hero-wide.mp4`
- Replace: `frontend/public/media/fireart-hero-ultrawide.mp4`
- Replace: `frontend/public/media/fireart-hero-tablet-landscape.mp4`
- Replace: `frontend/public/media/fireart-hero-tablet-portrait.mp4`
- Replace: `frontend/public/media/fireart-hero-mobile.mp4`
- Replace: `frontend/public/media/fireart-hero-mobile-tall.mp4`
- Replace: matching `.webp` posters
- Test: `frontend/e2e/night-runway-full-bleed.spec.js`
- Test: `frontend/e2e/night-runway-hero-safe-title.spec.js`
- Test: `frontend/e2e/night-runway-hero-lifecycle.spec.js`

**Interfaces:**
- Consumes: user-approved landscape/portrait compositions from Task 5.
- Produces: six H.264/30fps/20s/yuv420p/fast-start MP4s and six crop-identical WebP posters.

- [ ] **Step 1: Render the two approved 4K masters**

Use HyperFrames render in each composition directory and name outputs explicitly:

```powershell
npx hyperframes render --quality high --output renders/fireart-full-bleed-landscape-4k.mp4
npx hyperframes render --quality high --output renders/fireart-full-bleed-portrait-4k.mp4
```

- [ ] **Step 2: Strengthen export validation**

Retain codec, dimensions, fps, duration, and size checks. Add representative frame extraction at `16s` and reject a variant when FFmpeg crop detection identifies persistent side/top bars wider than `2%` of the output at that photographic frame.

- [ ] **Step 3: Produce all delivery variants**

```powershell
./scripts/render-responsive-hero.ps1 `
  -LandscapeMaster "tmp/fireart-drone-fireworks-trailer-20s-hf/renders/fireart-full-bleed-landscape-4k.mp4" `
  -PortraitMaster "tmp/fireart-drone-fireworks-trailer-20s-mobile-hf/renders/fireart-full-bleed-portrait-4k.mp4"
```

- [ ] **Step 4: Test real video pixels in the browser**

At representative photographic timestamps, draw the same-origin `<video>` frame into a canvas. Sample narrow outer strips and the lower city band. Assert the strips contain spatial detail rather than the nearly uniform `#050607` bars present in the old files.

- [ ] **Step 5: Run lifecycle and media tests**

```powershell
cd frontend
npx playwright test e2e/night-runway-hero-safe-title.spec.js e2e/night-runway-full-bleed.spec.js e2e/night-runway-hero-lifecycle.spec.js e2e/night-runway-home.spec.js --workers=1
```

Expected: full-bleed pixel checks, source selection, rotation, restore, autoplay, and fallback behavior pass.

- [ ] **Step 6: Commit media delivery**

```powershell
git add scripts/render-responsive-hero.ps1 frontend/public/media/fireart-hero-*.mp4 frontend/public/media/fireart-hero-*.webp frontend/e2e/night-runway-hero-safe-title.spec.js frontend/e2e/night-runway-full-bleed.spec.js
git commit -m "fix: deliver full-bleed safe-title hero media"
```

---

### Task 7: Adapt every public route to the shared responsive system

**Files:**
- Modify: `frontend/src/styles/night-gallery.css`
- Modify: `frontend/src/styles/night-packages.css`
- Modify: `frontend/src/styles/night-faq.css`
- Modify: `frontend/src/styles/night-contact.css`
- Modify: `frontend/src/styles/night-blog.css`
- Modify: `frontend/src/styles/night-footer.css`
- Modify: `frontend/src/styles/night-reviews.css`
- Modify: `frontend/src/styles/night-home.css`
- Modify: `frontend/src/styles/night-home-film.css`
- Test: `frontend/e2e/night-runway-responsive-matrix.spec.js`
- Test: `frontend/e2e/night-runway-fluid-scale.spec.js`

**Interfaces:**
- Consumes: Task 2 shared tokens.
- Produces: route-specific grids and readable columns that preserve design while using the complete viewport range.

- [ ] **Step 1: Migrate whole-section shells**

Use `var(--nr-layout-max)` for page-level grids and `var(--nr-readable-max)` or existing `ch` caps for prose. Remove only fixed maximums that make an entire section undersized; keep intentional card and line-length limits.

- [ ] **Step 2: Convert rigid grids**

Where content count permits, use patterns such as:

```css
grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
```

Retain explicit two-/three-column grids where order and cinematic composition require them, with one structural mobile breakpoint.

- [ ] **Step 3: Tune route typography and spacing**

Use shared body/label tokens and route display clamps based on `vmin` plus container width. Do not allow headings to become single enormous lines on 32:9; retain balanced `ch` limits.

- [ ] **Step 4: Verify media and absolute decoratives**

Ensure every route image/video has a defined aspect ratio or resolved block size, `object-fit`, and focal position. Anchor decorative layers to section boxes and verify they do not create overflow.

- [ ] **Step 5: Run the public-route matrix**

```powershell
cd frontend
npx playwright test e2e/night-runway-responsive-matrix.spec.js e2e/night-runway-fluid-scale.spec.js --workers=1
```

Expected: all listed public routes pass all eleven approved viewports with no horizontal overflow and intentional scale.

- [ ] **Step 6: Commit route adaptations**

```powershell
git add frontend/src/styles/night-gallery.css frontend/src/styles/night-packages.css frontend/src/styles/night-faq.css frontend/src/styles/night-contact.css frontend/src/styles/night-blog.css frontend/src/styles/night-footer.css frontend/src/styles/night-reviews.css frontend/src/styles/night-home.css frontend/src/styles/night-home-film.css frontend/e2e/night-runway-responsive-matrix.spec.js frontend/e2e/night-runway-fluid-scale.spec.js
git commit -m "fix: make public routes fluid across viewports"
```

---

### Task 8: Perform dense visual QA, fix residuals, and deliver to main

**Files:**
- Modify: only files already in scope when visual evidence identifies a defect
- Temporary: `output/responsive-audit/final-fluid-review/`

**Interfaces:**
- Consumes: all completed tasks.
- Produces: verified build, complete browser matrix, cleaned workspace, focused commits, and pushed `main`.

- [ ] **Step 1: Build the production frontend**

```powershell
cd frontend
$env:NODE_OPTIONS='--max-old-space-size=8192'
npm run build
```

Expected: successful optimized build with no compilation errors.

- [ ] **Step 2: Run the complete Playwright suite**

```powershell
npx playwright test --workers=1
```

Expected: all tests pass.

- [ ] **Step 3: Capture the approved matrix**

Capture homepage hero at representative title times, gallery intro/first/middle/outro, packages, and every public route at the eleven approved viewports. Store temporary screenshots only under `output/responsive-audit/final-fluid-review/`.

- [ ] **Step 4: Capture dense hero-to-gallery transition frames**

Record at least 30 consecutive frames across the scroll boundary at phone portrait, compact landscape, `1512×982`, and `5120×1440`. Verify there is no seam, frozen frame, black flash, or abrupt gallery jump.

- [ ] **Step 5: Fix only evidence-backed residuals**

For every residual, add or strengthen a failing behavioral test first, observe RED, implement the smallest scoped correction, and rerun the focused test before the full suite.

- [ ] **Step 6: Remove temporary audit media**

Resolve and verify the exact `output/responsive-audit/final-fluid-review/` path is inside this repository, then delete only that temporary directory. Confirm `git status --short` contains no diagnostic files.

- [ ] **Step 7: Final verification**

```powershell
git diff --check
git status --short
git log --oneline --decorate -12
```

Expected: no whitespace errors, no unintended files, and only scoped commits after the approved design commit.

- [ ] **Step 8: Push the verified commits to main**

Fetch `origin`, verify that `main` has not diverged unexpectedly, and push the current verified commit range to `origin/main` without force. Confirm local HEAD and `origin/main` resolve to the same final commit.
