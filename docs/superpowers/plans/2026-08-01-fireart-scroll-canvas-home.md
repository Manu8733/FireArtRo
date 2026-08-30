# FireArtRo Scroll Canvas Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use test-driven development and execute this plan task-by-task in the current session. The user explicitly requested no subagents.

**Goal:** Replace every post-hero homepage section with a coherent gallery, packages, team, 3D partner orbit, brief, and verified Facebook Reviews flow.

**Architecture:** `HomeRunway` becomes a composition shell for focused scene components. GSAP ScrollTrigger owns DOM timelines; a raw Three.js component owns the only WebGL lifecycle and exposes scroll progress through a ref. Managed content remains the source for packages, partners, testimonials, and public links.

**Tech Stack:** React 19, React Router, GSAP 3.15, Three.js 0.185, GLSL shaders, Playwright 1.62, CRA/CRACO.

## Global Constraints

- Preserve the existing hero, navigation, logo, social controls, and hero video.
- Do not invent Facebook reviews, client names, ratings, partners, or team credentials.
- Do not add decorative borders or generic rounded cards.
- Cap WebGL DPR at 1.5 and pause rendering offscreen.
- Provide a complete reduced-motion fallback.
- Do not commit or push unless the user explicitly requests it.

### Task 1: Lock Tests and Data Interfaces

**Files:**
- Modify: `frontend/e2e/night-runway-home.spec.js`
- Modify: `frontend/e2e/night-runway-transitions.spec.js`
- Create: `frontend/src/data/homeExperience.js`

**Produces:** `HOME_GALLERY`, `HOME_PACKAGES`, `TEAM_PLACEHOLDERS`, `PARTNER_PLACEHOLDERS`.

- [ ] Write Playwright assertions for section order, counts, team modal, review link, and WebGL fallback.
- [ ] Run the targeted tests and confirm they fail because the new sections do not exist.
- [ ] Add data constants using current FireArtRo assets and managed package IDs.

### Task 2: Build Gallery and Package Assembly

**Files:**
- Create: `frontend/src/components/night/HomeGallery.jsx`
- Create: `frontend/src/components/night/HomePackages.jsx`
- Modify: `frontend/src/components/night/HomeRunway.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Consumes:** `HOME_GALLERY`, `HOME_PACKAGES`.

- [ ] Implement the pinned 50vw gallery track and five media panels.
- [ ] Implement the closing push panel and five blue-black transition bands.
- [ ] Implement the five sequential package slabs and active hover/focus behavior.
- [ ] Add reduced-motion and mobile linear layouts.
- [ ] Run the targeted test until gallery and package assertions pass.

### Task 3: Build Team Focus and Modal

**Files:**
- Create: `frontend/src/components/night/HomeTeam.jsx`
- Add: `frontend/public/media/team/fireart-team-placeholder.webp`
- Modify: `frontend/src/styles/night-home-film.css`

**Consumes:** `TEAM_PLACEHOLDERS` with crop percentages.

- [ ] Generate one wide four-person production-team placeholder.
- [ ] Implement base-image dimming and duplicate-image crop highlight on hover/focus.
- [ ] Implement dialog semantics, Escape close, focus restoration, and person crop.
- [ ] Run the targeted modal test until it passes.

### Task 4: Build Partner Orbit WebGL Scene

**Files:**
- Create: `frontend/src/components/night/PartnerOrbitCanvas.jsx`
- Modify: `frontend/src/components/night/HomeRunway.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Consumes:** `PARTNER_PLACEHOLDERS`; exposes `setProgress(number)`.

- [ ] Create three groups of logo planes with CanvasTexture labels.
- [ ] Add custom vertex and fragment shaders with a rounded-cut alpha mask.
- [ ] Add dispersed, assembled, rotating, and released states derived from scroll progress.
- [ ] Precompile and render one hidden warm-up frame, then pause until visible.
- [ ] Dispose geometries, materials, textures, observers, and animation frames.
- [ ] Run the reduced-motion and semantic fallback assertions.

### Task 5: Build Brief and Facebook Reviews

**Files:**
- Create: `frontend/src/components/site/FacebookReviews.jsx`
- Modify: `frontend/src/components/site/Footer.jsx`
- Modify: `frontend/src/components/night/HomeRunway.jsx`
- Modify: `frontend/src/styles/night-footer.css`

- [ ] Add an unframed brief image with one CTA.
- [ ] Render verified Facebook managed reviews only; otherwise render the public Facebook link without fabricated data.
- [ ] Mount the review band before the footer on every public route through `Footer`.
- [ ] Run route assertions for Facebook reviews.

### Task 6: Motion Study and Final Verification

**Files:**
- Create: `frontend/scripts/capture-home-motion.js`
- Output only: `frontend/output/motion-study/`

- [ ] Capture 60 deterministic frames for Gallery, Packages, Team, Partner Orbit, and CTA hover.
- [ ] Generate contact sheets and inspect the first, middle, and last states.
- [ ] Run `npm run build`.
- [ ] Run targeted Playwright specs.
- [ ] Run a browser smoke check for console errors, overflow, canvas count, and route links.
