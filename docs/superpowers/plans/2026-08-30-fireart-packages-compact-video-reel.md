# FireArtRo Packages Compact Video Reel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or inline execution with test-first checkpoints. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Packages page as a compact selectable video reel with an expandable selected-package video, without changing Admin data or contact-prefill behavior.

**Architecture:** `Packages.jsx` keeps ownership of package category, variant, and video-dialog state. The existing data adapter remains the source of thumbnails and video URLs; CSS reshapes the component into a category rail, compact package cards, and a selected detail surface. The existing contact-navigation payload remains unchanged.

**Tech Stack:** React, React Router, Framer Motion reduced-motion hook, Lucide, CSS, Playwright.

## Global Constraints

- Use Admin-managed `videoUrl`, `moreVideoUrls`, and package data without schema changes.
- Keep the `package_id`, `package_title`, and `services` contact prefill payload exact.
- Use fixed 16:9 media geometry for package previews and the expanded video dialog.
- Preserve keyboard category/variant navigation and 44px minimum interactive controls.
- Avoid hover-only access to package information or video playback.

---

### Task 1: Define the compact reel behavior in browser coverage

**Files:**
- Modify: `frontend/e2e/night-runway-packages.spec.js`

**Interfaces:**
- Consumes: `[data-testid="package-comparator"]`, `package-stage`, `package-media`, `package-variant-strip`, and `packages-direct-cta`.
- Produces: regression coverage for the compact card rail and expanded selected-video interaction.

- [ ] **Step 1: Write failing package-layout tests**

```js
test("keeps package choices adjacent to the selected preview", async ({ page }) => {
  const rail = page.getByTestId("package-variant-strip");
  const stage = page.getByTestId("package-stage");
  const railBox = await rail.boundingBox();
  const stageBox = await stage.boundingBox();

  expect((stageBox?.y || 0) - ((railBox?.y || 0) + (railBox?.height || 0))).toBeLessThan(48);
});

test("opens the selected package video in an expanded dialog", async ({ page }) => {
  await page.getByTestId("package-media").getByRole("button", { name: /vezi clipul/i }).click();
  await expect(page.getByTestId("package-video-dialog")).toBeVisible();
});
```

- [ ] **Step 2: Run the targeted tests and verify failure**

Run: `npx.cmd playwright test e2e/night-runway-packages.spec.js --project=desktop-chromium --grep "adjacent|expanded dialog"`

Expected: FAIL because the current rail is after a large stage and the video embeds inline rather than in a dialog.

- [ ] **Step 3: Commit the failing test change**

```powershell
git add frontend/e2e/night-runway-packages.spec.js
git commit -m "test: define compact package video reel"
```

### Task 2: Build the compact package selection and expanded video dialog

**Files:**
- Modify: `frontend/src/components/site/Packages.jsx`

**Interfaces:**
- Consumes: `items`, `PACKAGE_ITEMS`, `PACKAGE_CATEGORIES`, `goToContact`, `getPackageVisual`, and `getYouTubeEmbedUrl`.
- Produces: selected package state, card-rail controls, and `[data-testid="package-video-dialog"]` with one playable embed.

- [ ] **Step 1: Replace inline media mode with dialog state**

```jsx
const [videoPackageId, setVideoPackageId] = useState("");
const isVideoOpen = Boolean(primaryVideoUrl) && videoPackageId === activePackage?.id;

const openVideo = () => setVideoPackageId(activePackage.id);
const closeVideo = () => setVideoPackageId("");
```

- [ ] **Step 2: Render the compact variant cards above the detail surface**

```jsx
<div className="nr-package-variant-strip" data-testid="package-variant-strip" role="tablist">
  {variants.map((item, index) => (
    <button key={item.id} data-variant-tile role="tab" aria-selected={item.id === selectedId}>
      <span className="nr-package-variant-strip__media"><img src={getPackageVisual(item)} alt="" /></span>
      <span className="nr-package-variant-strip__copy"><small>{item.category}</small><strong>{item.title}</strong></span>
    </button>
  ))}
</div>
```

- [ ] **Step 3: Render a compact selected-package 16:9 preview and dialog**

```jsx
<button type="button" className="nr-package-video-trigger" onClick={openVideo} aria-label={`Vezi clipul ${activePackage.title}`}>
  <Play aria-hidden="true" fill="currentColor" />
  <span>Vezi clipul</span>
</button>

<Dialog open={isVideoOpen} onOpenChange={(open) => !open && closeVideo()}>
  <DialogContent data-testid="package-video-dialog" className="nr-package-video-dialog">
    <iframe src={videoEmbedUrl} title={`Video demonstrativ pentru pachetul ${activePackage.title}`} allowFullScreen />
  </DialogContent>
</Dialog>
```

- [ ] **Step 4: Keep keyboard selection and contact prefill behavior unchanged**

```jsx
const requestPackage = () => goToContact({
  package_id: activePackage.id,
  package_title: activePackage.title,
  services: [activePackage.category],
});
```

- [ ] **Step 5: Run targeted tests and verify pass**

Run: `npx.cmd playwright test e2e/night-runway-packages.spec.js --project=desktop-chromium --grep "adjacent|expanded dialog|keyboard-safe|contact"`

Expected: PASS.

- [ ] **Step 6: Commit the component change**

```powershell
git add frontend/src/components/site/Packages.jsx frontend/e2e/night-runway-packages.spec.js
git commit -m "feat: compact package video reel"
```

### Task 3: Recompose responsive visual layout

**Files:**
- Modify: `frontend/src/styles/night-packages.css`

**Interfaces:**
- Consumes: class names emitted by `Packages.jsx`.
- Produces: compact desktop/tablet/mobile layout with stable 16:9 preview frames and no overflow.

- [ ] **Step 1: Write failing geometry assertions for laptop and mobile**

```js
const mediaBox = await page.getByTestId("package-media").boundingBox();
expect(mediaBox.width / mediaBox.height).toBeGreaterThan(1.68);
expect(mediaBox.width / mediaBox.height).toBeLessThan(1.84);
expect((await page.evaluate(() => document.documentElement.scrollWidth))).toBeLessThanOrEqual(viewport.width + 1);
```

- [ ] **Step 2: Apply compact CSS geometry**

```css
.nr-package-variant-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); }
.nr-package-stage__main { grid-template-columns: minmax(0, 1.1fr) minmax(17rem, .9fr); }
.nr-package-stage__media { width: 100%; max-width: none; aspect-ratio: 16 / 9; }
@media (max-width: 700px) { .nr-package-variant-strip { grid-auto-flow: column; grid-auto-columns: minmax(10rem, 75vw); overflow-x: auto; } }
```

- [ ] **Step 3: Run desktop/mobile layout tests**

Run: `npx.cmd playwright test e2e/night-runway-packages.spec.js --project=desktop-chromium --project=mobile-chromium`

Expected: PASS with no horizontal overflow and visible controls.

- [ ] **Step 4: Commit styling**

```powershell
git add frontend/src/styles/night-packages.css frontend/e2e/night-runway-packages.spec.js
git commit -m "style: compact package reel layout"
```

### Task 4: Build and visual verification

**Files:**
- Verify: `frontend/src/components/site/Packages.jsx`
- Verify: `frontend/src/styles/night-packages.css`
- Verify: `frontend/e2e/night-runway-packages.spec.js`

**Interfaces:**
- Consumes: production build and local preview server.
- Produces: verified desktop and mobile Packages page.

- [ ] **Step 1: Build production assets**

Run: `npm.cmd run build`

Expected: CRA build exits with code 0.

- [ ] **Step 2: Run full Packages visual and interaction coverage**

Run: `npx.cmd playwright test e2e/night-runway-packages.spec.js --project=desktop-chromium --project=mobile-chromium`

Expected: PASS.

- [ ] **Step 3: Capture desktop and mobile screenshots**

Run: `npx.cmd playwright test e2e/night-runway-packages.spec.js --project=desktop-chromium --project=mobile-chromium --grep "stays compact"`

Expected: PASS; inspect output artifacts for clipped text, oversized empty space, and off-screen controls.

- [ ] **Step 4: Commit verification-safe source changes**

```powershell
git status --short
git add frontend/src/components/site/Packages.jsx frontend/src/styles/night-packages.css frontend/e2e/night-runway-packages.spec.js
git commit -m "feat: refine FireArt package video selection"
```
