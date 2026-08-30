# FireArt Gallery And Package Runway Implementation Plan

> **For agentic workers:** Execute inline in the current task. Do not use subagents and do not commit unless the user explicitly requests it.

**Goal:** Build a three-work Trionn-inspired gallery runway followed by three docked FireArt package panels.

**Architecture:** Keep the existing `HomeGallery` and `HomePackages` boundaries. Drive both with scoped GSAP ScrollTriggers, use `HOME_GALLERY` and `HOME_PACKAGES` as the content contract, and preserve static mobile/reduced-motion fallbacks.

**Tech Stack:** React 19, GSAP 3.15, ScrollTrigger, Playwright, CSS.

## Global Constraints

- Three gallery items, three package items.
- No visible numeric indices.
- Gallery media corners are exactly square.
- No package intro title screen or transition bands.
- One solid `#071a2c` continuation sheet exits left to reveal the package stage underneath.
- Animate compositor properties only.
- No subagents and no git commit.

---

### Task 1: Lock the approved content and structure

**Files:**
- Modify: `frontend/e2e/night-runway-home.spec.js`
- Modify: `frontend/e2e/night-runway-transitions.spec.js`

- [ ] Add assertions for three gallery cards, three package panels, absent numeric labels, absent old package intro, and square gallery corners.
- [ ] Run the focused Playwright tests and confirm they fail against the current five-card/five-package implementation.

### Task 2: Implement gallery runway

**Files:**
- Modify: `frontend/src/data/homeExperience.js`
- Modify: `frontend/src/components/night/HomeGallery.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

- [ ] Reduce the homepage selection to three items and remove index fields.
- [ ] Add independent inner wrappers for bottom-up motion and replace the counter outro with editorial copy and CTA.
- [ ] Implement the position-based cubic lift while the track travels left.
- [ ] Mount a solid continuation sheet over the package stage and pull it left before docking begins.
- [ ] Make all gallery media rectangular with `border-radius: 0`.
- [ ] Run the focused tests and confirm the gallery assertions pass.

### Task 3: Implement three-panel package docking

**Files:**
- Modify: `frontend/src/data/homeExperience.js`
- Modify: `frontend/src/components/night/HomePackages.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

- [ ] Keep Night Signature, Drone Story, and Hybrid as the homepage package selection.
- [ ] Remove transition bands, numeric labels, and the standalone package heading.
- [ ] Build a pinned staggered docking timeline that raises each panel from below.
- [ ] Keep the mobile and reduced-motion versions static and readable.
- [ ] Run focused tests and confirm the package assertions pass.

### Task 4: Verify behavior and presentation

**Files:**
- Test: `frontend/e2e/night-runway-home.spec.js`
- Test: `frontend/e2e/night-runway-transitions.spec.js`

- [ ] Run the production build.
- [ ] Run focused Playwright tests on desktop, mobile, and reduced motion.
- [ ] Capture desktop screenshots at gallery intro, gallery transition, and package docking states.
- [ ] Inspect for overflow, clipped copy, unexpected borders, and console errors.
