# FireArt Gallery And Package Refinement Implementation Plan

> **For agentic workers:** Execute inline in the current task. Do not use subagents and do not commit unless the user explicitly requests it.

**Goal:** Centre the approved gallery copy, add a restrained cinematic background, accelerate gallery travel by 30 percent, slow the handoff by 30 percent, and turn the three package panels into tall links to real FireArtRo YouTube videos.

**Architecture:** Keep `HomeGallery` and `HomePackages` as separate scoped GSAP scenes. Extend `HOME_PACKAGES` with the real YouTube URL and factual presentation fields used by the package panels. Keep mobile and reduced-motion paths declarative through CSS rather than adding a second animation system.

**Tech Stack:** React 19, GSAP 3.15, ScrollTrigger, Playwright, CSS.

## Global Constraints

- Three gallery cards and three package panels.
- No numerical labels in these scenes.
- Gallery and package media have square corners.
- Gallery duration is divided by 1.3; handoff duration is multiplied by 1.3.
- Package panels open real FireArtRo YouTube URLs in a new tab and do not autoplay embeds.
- No subagents and no git commit.

---

### Task 1: Lock the refined content contract with failing browser checks

**Files:**
- Modify: `frontend/e2e/night-runway-gallery.spec.js`
- Modify: `frontend/e2e/night-runway-packages.spec.js`

**Interfaces:**
- Consumes: `data-testid="home-gallery"`, `data-testid="home-packages"`, `data-package-youtube`, `data-package-description`, `data-package-detail`.
- Produces: regression checks for the copy, timing span, package links, and panel presentation.

- [ ] **Step 1: Write failing gallery expectations**

```js
await expect(page.getByTestId("home-gallery")).toContainText("Trei momente. O singură noapte.");
await expect(page.getByTestId("home-gallery")).toContainText("Spectacolul continuă.");
await expect(page.locator(".fa-work__intro")).toHaveCSS("text-align", "center");
```

- [ ] **Step 2: Run the gallery test and verify it fails**

Run: `yarn playwright test e2e/night-runway-gallery.spec.js --project=chromium`

Expected: failure because the old title and left-aligned presentation remain.

- [ ] **Step 3: Write failing package expectations**

```js
const cards = page.locator("[data-package-youtube]");
await expect(cards).toHaveCount(3);
await expect(cards.nth(0)).toHaveAttribute("href", /youtube\.com|youtu\.be/);
await expect(cards.nth(0).getByText("Vezi clipul")).toBeVisible();
await expect(cards.nth(0).locator("[data-package-description]")).toBeVisible();
```

- [ ] **Step 4: Run the package test and verify it fails**

Run: `yarn playwright test e2e/night-runway-packages.spec.js --project=chromium`

Expected: failure because package panels are articles with empty video media and no real link contract.

### Task 2: Implement the gallery copy, background, and motion calibration

**Files:**
- Modify: `frontend/src/components/night/HomeGallery.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Interfaces:**
- Consumes: the gallery title and closing title expected by Task 1.
- Produces: centred opening and closing panels plus a 30-percent-shorter gallery ScrollTrigger span.

- [ ] **Step 1: Replace approved copy in `HomeGallery`**

```jsx
<p className="fa-kicker">Selecție FireArtRo</p>
<h2 id="fa-work-title">Trei momente. O singură noapte.</h2>
```

- [ ] **Step 2: Centre the editorial panels and add a directional navy texture**

```css
.fa-work__intro,
.fa-work__outro {
  align-items: center;
  justify-content: center;
  text-align: center;
}
```

- [ ] **Step 3: Reduce the gallery pin span by 30 percent**

```js
end: () => `+=${Math.max(window.innerWidth * 1.81, travel() * 0.892)}`,
```

- [ ] **Step 4: Run the focused gallery test and verify it passes**

Run: `yarn playwright test e2e/night-runway-gallery.spec.js --project=chromium`

Expected: PASS with three cards, approved copy, centred intro, and square media.

### Task 3: Turn the package lineup into three tall YouTube-linked media panels

**Files:**
- Modify: `frontend/src/data/homeExperience.js`
- Modify: `frontend/src/components/night/HomePackages.jsx`
- Modify: `frontend/src/styles/night-home-film.css`

**Interfaces:**
- Consumes: `youtubeUrl`, `description`, and `detail` fields from `HOME_PACKAGES`.
- Produces: `<a data-package-youtube>` package panels with `_blank` and `noopener noreferrer`.

- [ ] **Step 1: Add real video metadata to the three selected package objects**

```js
youtubeUrl: "https://youtu.be/_qfvKDitA0Q",
description: "Producție pirotehnică regizată pentru momentul central.",
detail: "4 minute · sincronizat pe muzică",
```

- [ ] **Step 2: Replace the empty video surface with a full-panel YouTube link**

```jsx
<a data-package-youtube href={item.youtubeUrl} target="_blank" rel="noopener noreferrer">
  <img src={item.image} alt={item.alt} />
  <span>Vezi clipul <ArrowUpRight aria-hidden="true" /></span>
</a>
```

- [ ] **Step 3: Raise panel height without adding card borders**

```css
.fa-packages__lineup { height: min(78vh, 52rem); }
.fa-package-slab { height: 92%; }
```

- [ ] **Step 4: Slow the outgoing gallery sheet by 30 percent**

```js
timeline.to(handoff, { xPercent: -100, duration: 0.91, ease: "power2.inOut" }, 0);
```

- [ ] **Step 5: Run the focused package test and verify it passes**

Run: `yarn playwright test e2e/night-runway-packages.spec.js --project=chromium`

Expected: PASS with three tall package links, visible copy, and real YouTube href values.

### Task 4: Verify the complete desktop flow

**Files:**
- Test: `frontend/e2e/night-runway-gallery.spec.js`
- Test: `frontend/e2e/night-runway-packages.spec.js`

- [ ] **Step 1: Build production assets**

Run: `yarn build`

Expected: successful production build.

- [ ] **Step 2: Run the focused Playwright flow**

Run: `yarn playwright test e2e/night-runway-gallery.spec.js e2e/night-runway-packages.spec.js --project=chromium`

Expected: PASS with no console errors.

- [ ] **Step 3: Capture four desktop states**

```text
gallery-opening.png
gallery-final-hold.png
gallery-handoff-reveal.png
packages-docked.png
```

- [ ] **Step 4: Inspect the images**

Confirm that copy is centred, the directional background stays restrained, no panels have rounded corners, the handoff moves horizontally, and all three package panels are tall enough for their media and copy.
