# FireArt Hero Typing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development and execute this plan inline. Do not dispatch subagents for this task.

**Goal:** Add a stable cinematic typing cycle to the homepage H1 and replace the hero typography with the approved Bricolage Grotesque and IBM Plex Mono pairing.

**Architecture:** A focused `HeroTypingTitle` component owns an explicit four-phase timeout state machine and exposes stable DOM hooks for behavioral tests. `Hero.jsx` keeps all existing hero composition and parallax responsibilities. CSS owns font application, reserved keyword width, caret appearance, and reduced-motion fallback.

**Tech Stack:** React 19, Framer Motion reduced-motion preference, CSS, Playwright 1.62, CRA/CRACO.

## Global Constraints

- Type left to right and delete right to left.
- Rotate `lumină.`, `mișcare.`, `aer.`, `ritm.` in that order.
- Use Bricolage Grotesque for H1 and description.
- Use IBM Plex Mono for eyebrow, CTA labels, and scroll cue.
- Keep the accessible H1 name permanently `Spectacole în lumină.`.
- Reserve the longest keyword width and prevent responsive layout shift.
- Render static `Spectacole în lumină.` under reduced motion.
- Preserve video, logo, navigation, CTA layout, social dock, and sections below the hero.
- Do not commit or push.

---

### Task 1: Specify The Typing Behavior With Playwright

**Files:**
- Modify: `frontend/e2e/night-runway-home.spec.js`

**Interfaces:**
- Consumes: homepage route `/` and the existing `hero-section` test id.
- Produces: behavior requirements for `.nr-hero__keyword`, `.nr-hero__caret`, and the stable accessible H1.

- [ ] Add a test using `page.clock` that asserts initial left-to-right typing, right-to-left deletion, the next word, stable geometry, and correct accessible text.
- [ ] Add a reduced-motion test that asserts static text and no caret.
- [ ] Run the focused tests and verify they fail because the typing DOM and behavior do not exist yet.

### Task 2: Implement The Isolated Typing State Machine

**Files:**
- Create: `frontend/src/components/site/HeroTypingTitle.jsx`
- Modify: `frontend/src/components/site/Hero.jsx`

**Interfaces:**
- Produces: `HeroTypingTitle()` with stable accessible text and visual phase data.
- Renders: `.nr-hero__title`, `.nr-hero__keyword`, `.nr-hero__caret`.

- [ ] Implement ordered Unicode-safe character slicing with the explicit `typing`, `holding`, `deleting`, and `paused` phases.
- [ ] Use one chained timeout with cleanup on every transition and unmount.
- [ ] Use `useReducedMotion()` to skip all timers and render the static first word.
- [ ] Replace the static H1 in `Hero.jsx` with `HeroTypingTitle` without changing surrounding hero markup.
- [ ] Run the focused tests and verify the behavior passes.

### Task 3: Apply The Approved Typography And Stable Geometry

**Files:**
- Create: `frontend/src/assets/fonts/bricolage-grotesque-*.woff2`
- Create: `frontend/src/assets/fonts/ibm-plex-mono-*.woff2`
- Modify: `frontend/src/index.css`
- Modify: `frontend/src/styles/night-home.css`

**Interfaces:**
- Produces: local `Bricolage Grotesque` and `IBM Plex Mono` font faces and the hero-specific typographic hierarchy.

- [ ] Add self-hosted WOFF2 font assets and `@font-face` declarations with `font-display: swap`.
- [ ] Apply Bricolage Grotesque to title and description, IBM Plex Mono to utility copy and CTA labels.
- [ ] Reserve keyword width with a hidden sizing string and animate a thin blue caret only during typing/deleting.
- [ ] Add responsive and reduced-motion rules without changing the approved hero composition.
- [ ] Re-run focused Playwright tests.

### Task 4: Verify The Complete Hero

**Files:**
- Verify: `frontend/e2e/night-runway-home.spec.js`
- Verify: `frontend/src/components/site/HeroTypingTitle.jsx`
- Verify: `frontend/src/styles/night-home.css`

**Interfaces:**
- Consumes: production build and local static preview.
- Produces: objective browser and build evidence.

- [ ] Run the complete landing Playwright suite.
- [ ] Run `CI=true yarn build` from `frontend`.
- [ ] Verify `430x932`, `844x390`, `868x698`, and `1440x900` for overflow and stable CTA position.
- [ ] Run `git diff --check` and inspect the final scoped diff.
