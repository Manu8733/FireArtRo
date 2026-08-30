# FireArtRo Gallery Cinematic Comets Implementation Plan

> **For agentic workers:** Execute the tasks in order and preserve all unrelated working-tree changes.

**Goal:** Replace the gallery's loose autonomous threads with five premium comet trails and a clearly readable travelling 3D braid that moves across the viewport before separating.

**Architecture:** Keep the existing full-viewport Three.js canvas, move carrier/helix math into a pure module, and let the React component coordinate rendering, safe-zone selection, responsive density, and lifecycle cleanup.

**Tech Stack:** React 19, Three.js, CRA/Jest, Playwright.

## Global Constraints

- No Git operations.
- Do not change gallery content or layout.
- Preserve reduced-motion behavior and keep at least two trails visible.
- Avoid fixed-center choreography; carrier paths must travel between off-center safe zones.

## Task 1: Choreography Math

**Files:**
- Create: `frontend/src/components/night/galleryCometChoreography.js`
- Create: `frontend/src/components/night/galleryCometChoreography.test.js`

Implement deterministic safe anchors, cubic Hermite carrier sampling, parallel-transport frames, and travelling-helix sampling. Test movement, radius, convergence, and anchor selection.

## Task 2: Three.js Orchestration

**Files:**
- Modify: `frontend/src/components/night/GalleryThreadsCanvas.jsx`

Replace stationary spiral behavior with directed cruise segments and a travelling braid. Use five warm trails, a moving fusion tip, short directional burst, viewport-safe choreography, and useful data diagnostics.

## Task 3: Verification

Run focused Jest tests, production build, and Playwright checks at desktop and mobile sizes. Verify a nonblank moving canvas, braid travel, at least two visible trails, no horizontal overflow, and no console errors.
