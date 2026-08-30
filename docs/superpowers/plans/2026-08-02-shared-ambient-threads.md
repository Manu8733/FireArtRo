# Shared Ambient Threads Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse the existing Gallery Three.js thread choreography on Contact, Packages, and FAQ without duplicating the renderer or obscuring interactive content.

**Architecture:** `GalleryThreadsCanvas` becomes the shared ambient canvas API by accepting a route variant and publishing its variant/state through data attributes. Each route mounts the same component once; shared CSS guarantees the fixed canvas remains below navigation, forms, cards, and accordions.

**Tech Stack:** React 19, React Router, Three.js dynamic imports, CSS, Playwright.

## Global Constraints

- Preserve the existing Gallery choreography, colors, and save-data/reduced-motion behavior.
- Do not add a second Three.js dependency or copy the 3D renderer into route-specific components.
- Keep all interactive content above the canvas and preserve pointer interaction.
- Do not commit or push this work unless the user explicitly requests it.

---

### Task 1: Shared Canvas Contract

**Files:**
- Modify: `frontend/src/components/night/GalleryThreadsCanvas.jsx`
- Modify: `frontend/src/pages/ContactPage.jsx`
- Modify: `frontend/src/pages/PackagesPage.jsx`
- Modify: `frontend/src/pages/FaqPage.jsx`
- Test: `frontend/e2e/shared-ambient-threads.spec.js`

**Interfaces:**
- Consumes: `GalleryThreadsCanvas({ variant?: "gallery" | "contact" | "packages" | "faq" })`.
- Produces: a host with `data-testid="ambient-threads"`, `data-thread-variant`, and `data-canvas-state`.

- [ ] **Step 1: Write the failing integration test**

```js
for (const [path, variant] of [["/contact", "contact"], ["/pachete", "packages"], ["/intrebari-frecvente", "faq"]]) {
  test(`${variant} mounts shared ambient threads`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const field = page.getByTestId("ambient-threads");
    await expect(field).toHaveAttribute("data-thread-variant", variant);
    await expect.poll(() => field.getAttribute("data-canvas-state")).toBe("running");
    await expect(field.locator("canvas")).toHaveCount(1);
  });
}
```

- [ ] **Step 2: Run the new test and verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium`

Expected: FAIL because no non-gallery route renders `data-testid="ambient-threads"`.

- [ ] **Step 3: Add the shared component API and route mounts**

```jsx
export default function GalleryThreadsCanvas({ variant = "gallery" }) {
  return (
    <div
      ref={hostRef}
      className="nr-ambient-thread-field"
      data-testid="ambient-threads"
      data-thread-variant={variant}
      aria-hidden="true"
    />
  );
}
```

Mount once, directly inside each route root before visible page content.

- [ ] **Step 4: Run the integration test and verify it passes**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium`

Expected: PASS with one running canvas per route.

### Task 2: Shared Stacking and Responsive Safety

**Files:**
- Create: `frontend/src/styles/night-ambient-threads.css`
- Modify: `frontend/src/components/night/GalleryThreadsCanvas.jsx`
- Modify: `frontend/src/styles/night-contact.css`
- Modify: `frontend/src/styles/night-packages.css`
- Modify: `frontend/src/styles/night-faq.css`
- Test: `frontend/e2e/shared-ambient-threads.spec.js`

**Interfaces:**
- Consumes: route-root selectors `.nr-contact-page`, `.nr-packages-page`, and `.nr-faq-route`.
- Produces: a fixed pointer-inert canvas at stack level 0 and visible interactive content at stack level 1 or above.

- [ ] **Step 1: Extend the test with stacking and mobile overflow assertions**

```js
const metrics = await page.evaluate(() => ({
  viewport: document.documentElement.clientWidth,
  document: document.documentElement.scrollWidth,
  pointerEvents: getComputedStyle(document.querySelector("[data-testid='ambient-threads']")).pointerEvents,
}));
expect(metrics.pointerEvents).toBe("none");
expect(metrics.document).toBeLessThanOrEqual(metrics.viewport + 1);
```

- [ ] **Step 2: Run the expanded test and verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=mobile-chromium`

Expected: FAIL until non-gallery routes receive shared positioning and stacking styles.

- [ ] **Step 3: Add shared style and preserve content layers**

```css
.nr-ambient-thread-field { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.nr-ambient-thread-field canvas { display: block; width: 100%; height: 100%; }
.nr-contact-page > :not(.nr-ambient-thread-field),
.nr-packages-page > :not(.nr-ambient-thread-field),
.nr-faq-route > :not(.nr-ambient-thread-field) { position: relative; z-index: 1; }
```

- [ ] **Step 4: Run desktop and mobile route checks**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium --project=mobile-chromium`

Expected: PASS with no horizontal overflow and pointer-inert canvas layers.

### Task 3: Build and Visual Verification

**Files:**
- Test: `frontend/e2e/shared-ambient-threads.spec.js`

- [ ] **Step 1: Build the production bundle**

Run: `npm run build`

Expected: production build completes successfully.

- [ ] **Step 2: Verify all three route canvases on production output**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium --project=mobile-chromium`

Expected: all tests pass after restarting the local production server.

- [ ] **Step 3: Capture visual checks at 1440x900 and 390x844**

Run: `npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium --project=mobile-chromium`

Expected: warm thread trails are visible behind content without covering inputs, accordions, or calls to action.
