# Night Runway Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the FireArtRo public website as a cohesive Night Runway experience while preserving the existing hero media, logo, header and social destinations.

**Architecture:** Add a shared cinematic design layer and route-specific page modules instead of extending the legacy card system. Keep managed content and navigation contracts intact; lazy-load the single WebGL scene and use GSAP only for section timelines.

**Tech Stack:** React 19, CRA/CRACO, React Router, Framer Motion, GSAP, Three.js, React Three Fiber, CSS, Playwright.

## Global Constraints

- Work with existing uncommitted changes; never reset or revert user work.
- Do not edit the preserved logo, hero video files, social destinations or header information architecture.
- No invented awards, testimonials, client totals or legal/safety claims.
- Respect reduced motion, WCAG AA, keyboard navigation and 44px touch targets.
- Page agents own disjoint JSX and CSS files; shared foundations are coordinator-owned.

---

### Task 1: Global Night Runway foundation

**Files:**
- Create: `frontend/src/styles/night-runway.css`
- Create: `frontend/src/components/night/NightButton.jsx`
- Create: `frontend/src/components/night/SectionSignal.jsx`
- Create: `frontend/src/components/night/MediaFrame.jsx`
- Modify: `frontend/src/index.js`
- Modify: `frontend/package.json`
- Test: `frontend/e2e/night-runway-global.spec.js`

**Interfaces:**
- Produces: `NightButton`, `SectionSignal`, `MediaFrame`, global `nr-*` tokens and utilities.

- [ ] Write Playwright assertions for focus visibility, 44px targets, no horizontal overflow and preserved header/logo/social links.
- [ ] Run the global test and confirm it fails against the legacy surface.
- [ ] Add dependencies and implement the shared components/tokens.
- [ ] Run the global test and confirm it passes.

### Task 2: Landing and WebGL runway

**Files:**
- Create: `frontend/src/components/night/RunwayScene.jsx`
- Create: `frontend/src/components/night/HomeRunway.jsx`
- Create: `frontend/src/styles/night-home.css`
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/components/site/Hero.jsx`
- Test: `frontend/e2e/night-runway-home.spec.js`

**Interfaces:**
- Consumes: shared Night Runway components and existing managed business content.
- Produces: lazy `RunwayScene` and rebuilt home sections.

- [ ] Write tests for preserved hero media, elevated composition, primary CTA, WebGL fallback and reduced motion.
- [ ] Run the home tests and confirm legacy layout failures.
- [ ] Implement the runway scene and full landing composition.
- [ ] Run home tests and screenshot desktop/mobile viewports.

### Task 3: Packages flight-plan page

**Files:**
- Create: `frontend/src/styles/night-packages.css`
- Modify: `frontend/src/pages/PackagesPage.jsx`
- Modify: `frontend/src/components/site/Packages.jsx`
- Test: `frontend/e2e/night-runway-packages.spec.js`

- [ ] Write tests for package selection, comparison content, CTA destination and responsive stacking.
- [ ] Confirm the tests fail on the legacy page.
- [ ] Implement the vertical flight-plan selector and comparison rail.
- [ ] Verify tests and desktop/mobile screenshots.

### Task 4: Gallery cinematic reel

**Files:**
- Create: `frontend/src/styles/night-gallery.css`
- Modify: `frontend/src/pages/GalleryPage.jsx`
- Test: `frontend/e2e/night-runway-gallery.spec.js`

- [ ] Write tests for filters, keyboard navigation, media loading and project expansion.
- [ ] Confirm failures on the legacy gallery.
- [ ] Implement the full-bleed cinematic reel and scrub rail.
- [ ] Verify tests and representative screenshots.

### Task 5: FAQ signal index

**Files:**
- Create: `frontend/src/styles/night-faq.css`
- Modify: `frontend/src/pages/FaqPage.jsx`
- Modify: `frontend/src/components/site/Faq.jsx`
- Test: `frontend/e2e/night-runway-faq.spec.js`

- [ ] Write tests for disclosure semantics, keyboard flow, grouping and contact CTA.
- [ ] Confirm failures against the current accordion layout.
- [ ] Implement the pinned signal index and luminous answer bands.
- [ ] Verify tests and reduced-motion behavior.

### Task 6: Contact final-ignition brief

**Files:**
- Create: `frontend/src/styles/night-contact.css`
- Modify: `frontend/src/pages/ContactPage.jsx`
- Modify: `frontend/src/components/site/QuoteForm.jsx`
- Test: `frontend/e2e/night-runway-contact.spec.js`

- [ ] Write tests for required fields, validation, service query preselection, consent and success/error states.
- [ ] Confirm failures against the legacy flow.
- [ ] Implement the staged brief builder without changing submission contracts.
- [ ] Verify tests, keyboard order and mobile screenshots.

### Task 7: Footer and final CTA

**Files:**
- Create: `frontend/src/styles/night-footer.css`
- Modify: `frontend/src/components/site/FinalCta.jsx`
- Modify: `frontend/src/components/site/Footer.jsx`
- Test: `frontend/e2e/night-runway-footer.spec.js`

- [ ] Write tests for contact/social/legal links and visible focus states.
- [ ] Confirm legacy presentation failures.
- [ ] Implement the horizon CTA and oversized wordmark footer.
- [ ] Verify tests and narrow landscape behavior.

### Task 8: Integration and production verification

**Files:**
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/index.css` only for compatibility fixes that cannot live in route styles.
- Test: `frontend/e2e/night-runway-regression.spec.js`

- [ ] Run all Playwright tests across `1440x900`, `1366x768`, `1024x768`, `844x390`, `430x932`, `390x844`, `360x800` and `568x320`.
- [ ] Inspect screenshots for blank canvas, overlaps, clipping and inconsistent visual grammar.
- [ ] Run `npm test -- --watchAll=false`, production build and dependency audit.
- [ ] Fix only evidenced integration failures and repeat the full verification suite.
