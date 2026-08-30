# FireArtRo Packages Studio Reel Implementation Plan

> **For agentic workers:** Execute inline in the current session. Do not dispatch subagents.

**Goal:** Replace the oversized package comparator with a compact, media-first studio reel that preserves Admin data, YouTube previews, accessibility, and contact prefill.

**Architecture:** Keep `PackagesPage.jsx` as the route shell and `Packages.jsx` as the interaction owner. Reshape only the component markup needed for the editorial stage and rebuild `night-packages.css` around a 16:9 media frame, compact detail column, and horizontal variant strip.

**Tech Stack:** React 19, React Router, Playwright, CSS, Framer Motion reduced-motion hook.

## Global Constraints

- Do not add dependencies.
- Preserve Admin-managed package data and URL fields.
- Preserve keyboard-safe tab controls and contact prefill.
- Use 16:9 package media on all target viewports.
- Do not introduce large enclosing cards, decorative numbering, or blocky blue CTAs.

---

### Task 1: Acceptance Contract

**Files:**
- Modify: `frontend/e2e/night-runway-packages.spec.js`

- [ ] Add assertions for compact intro typography, 16:9 media, open stage structure, variant contact sheet, and no overflow.
- [ ] Run the targeted suite and confirm it fails against the current comparator.

### Task 2: Studio Reel Component

**Files:**
- Modify: `frontend/src/components/site/Packages.jsx`

- [ ] Remove decorative numbering and five-band stage fragments.
- [ ] Add a compact selected-package stage and thumbnail variant strip.
- [ ] Keep category switching, keyboard navigation, video playback, and contact prefill behavior unchanged.

### Task 3: Responsive Visual System

**Files:**
- Modify: `frontend/src/styles/night-packages.css`

- [ ] Rebuild the desktop layout around a 16:9 media frame and restrained information column.
- [ ] Add tablet and mobile layouts with touch-safe horizontal rails.
- [ ] Add media-only transitions and reduced-motion behavior.

### Task 4: Verification

**Files:**
- Verify: `frontend/e2e/night-runway-packages.spec.js`

- [ ] Run the targeted Playwright suite.
- [ ] Run the production build.
- [ ] Capture desktop, tablet, and mobile screenshots and inspect them for size, rhythm, overflow, and media framing.
- [ ] Run `git diff --check` and review the scoped diff.
