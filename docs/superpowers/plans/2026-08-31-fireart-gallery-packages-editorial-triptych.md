# FireArt Gallery And Editorial Package Triptych Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the first two homepage scenes so the gallery remains smooth through resize and orientation changes, while the package scene becomes a responsive text-only triptych using the real Multicolor, Gold, and Diamond + Piromuzical catalog entries.

**Architecture:** Keep `HomeGallery` as the only pinned horizontal scene and make its measurements orientation-safe. Replace `HomePackages` with a normal-flow, Admin-managed editorial section that owns no gallery replay, media poster, or long scrub timeline. Preserve the existing managed-content and contact-prefill contracts, then verify the complete flow across the project's desktop, mobile, tablet, landscape, and reduced-motion profiles.

**Tech Stack:** React 19, React Router 7, GSAP 3 with ScrollTrigger, CRA/CRACO, CSS media queries, Playwright 1.62.

## Global Constraints

- Keep the existing hero and every homepage section after Packages unchanged.
- Gallery content remains driven by `HOME_GALLERY` and keeps exactly three existing catalog photographs.
- Featured package IDs, in order: `fireworks-multicolor-2026`, `fireworks-gold-2026`, `fireworks-diamond-piromusical-2026`.
- Package content must come from `useManagedContent("packages", PACKAGE_ITEMS)`; never revive `HOME_PACKAGES` or invent missing package copy.
- Preserve `package_id`, `package_title`, and `services: [category]` in the contact prefill.
- Package panels contain no image, video, YouTube URL, poster, play control, price, popularity claim, or recommended badge.
- Keep the documented Night Runway palette and hard-edged editorial geometry; do not add glass cards, decorative blobs, or rounded pricing-card styling.
- Every interactive target is at least 44 by 44 CSS pixels with a visible focus state.
- All animation has a complete static `prefers-reduced-motion` state.
- No horizontal document overflow, clipped text, covered CTA, or stale transform after orientation changes.
- Do not add dependencies.

## File Structure

- `frontend/src/components/night/HomePackages.jsx` — select the three real managed packages, render semantic text panels, trigger contact prefill, and own the short entrance reveal.
- `frontend/src/components/night/HomeGallery.jsx` — own measured horizontal travel, compact-layout detection, and resize/orientation refresh.
- `frontend/src/styles/night-home-film.css` — remove the retired handoff/media-slab layout and define gallery framing plus the triptych's responsive geometry.
- `frontend/e2e/night-runway-home.spec.js` — verify real package data, absence of retired media UI, navigation, and contact prefill.
- `frontend/e2e/night-runway-home-refactor.spec.js` — verify triptych geometry and overflow across desktop, tablet, phone, and landscape sizes.
- `frontend/e2e/night-runway-transitions.spec.js` — verify the gallery-to-packages boundary, short package reveal, gallery runway, and orientation-safe final transition.
- `frontend/e2e/night-runway-mobile-motion.spec.js` — verify gallery scrub plus package entrance behavior on touch.
- `frontend/e2e/night-runway-motion-matrix.spec.js` — record the intended `scroll` gallery path and `reveal` package path in every browser project.
- `frontend/e2e/night-runway-animation-frames.spec.js` — capture the package triptych as a normal-flow scene instead of sampling a retired pinned handoff.

---

### Task 1: Replace Fake Homepage Packages With Managed Catalog Panels

**Files:**
- Modify: `frontend/e2e/night-runway-home.spec.js:208-296`
- Modify: `frontend/src/components/night/HomePackages.jsx:1-240`

**Interfaces:**
- Consumes: `useManagedContent(key, fallback)`, `PACKAGE_ITEMS`, `goToContact(selection)`, and React Router's `Link`.
- Produces: three `[data-package-panel]` articles with stable `data-package-id`, one `[data-package-request]` button per article, and a `/pachete` secondary link.

- [ ] **Step 1: Replace the retired package-video assertions with a failing managed-triptych test**

In `night-runway-home.spec.js`, replace the current package portion of `uses the approved editorial gallery and three-package runway` and remove `makes every homepage package a real video destination`. Add this focused test:

```js
test("uses three real managed packages without homepage media cards", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const packages = page.getByTestId("home-packages");
  const panels = packages.locator("[data-package-panel]");

  await expect(panels).toHaveCount(3);
  expect(await panels.evaluateAll((nodes) => nodes.map((node) => node.dataset.packageId))).toEqual([
    "fireworks-multicolor-2026",
    "fireworks-gold-2026",
    "fireworks-diamond-piromusical-2026",
  ]);
  await expect(panels.locator("h3")).toHaveText([
    "Multicolor",
    "Gold",
    "Diamond + Piromuzical",
  ]);
  await expect(packages.locator("img, video, [data-package-play], [data-package-youtube]")).toHaveCount(0);
  await expect(page.getByTestId("gallery-package-handoff")).toHaveCount(0);
});
```

Add a contact-prefill test using the middle panel:

```js
test("prefills the quote with the selected real homepage package", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const gold = page.locator('[data-package-panel][data-package-id="fireworks-gold-2026"]');
  await gold.getByRole("button", { name: /cere ofertă/i }).click();

  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("#quote-package")).toHaveValue("fireworks-gold-2026");
  await expect(page.locator("#quote-package option:checked")).toHaveText("Gold");
});
```

Add a managed-content omission test so the homepage cannot silently substitute another package:

```js
test("omits a missing featured package without inventing a replacement", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("fireartro-managed-content-v1", JSON.stringify({
      packageCatalogVersion: "fireworks-2026-v3",
      packages: [
        {
          id: "fireworks-multicolor-2026",
          title: "Multicolor",
          category: "Artificii de zi",
          duration: "Adaptată momentului",
          bestFor: "Festivități",
          shortDescription: "Efecte vizibile ziua.",
          highlights: ["Culori personalizabile"],
        },
        {
          id: "fireworks-diamond-piromusical-2026",
          title: "Diamond + Piromuzical",
          category: "Artificii de noapte",
          duration: "4 minute",
          bestFor: "Evenimente premium",
          shortDescription: "Spectacol sincronizat pe muzică.",
          highlights: ["Construcție piromuzicală"],
        },
      ],
    }));
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const ids = await page.locator("[data-package-panel]").evaluateAll((nodes) =>
    nodes.map((node) => node.dataset.packageId),
  );
  expect(ids).toEqual([
    "fireworks-multicolor-2026",
    "fireworks-diamond-piromusical-2026",
  ]);
});
```

- [ ] **Step 2: Run the new tests and verify the expected red state**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-home.spec.js --project=desktop-chromium --grep "real managed packages|prefills the quote"
```

Expected: FAIL because `[data-package-panel]` does not exist and the current cards still contain posters and YouTube links.

- [ ] **Step 3: Replace `HomePackages` with the minimal managed-content implementation**

Remove `Play`, `HOME_GALLERY`, `HOME_PACKAGES`, `getYoutubePoster`, the duplicated handoff, and the package-video anchors. Import the real contracts:

```jsx
import { useLayoutEffect, useMemo, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useManagedContent from "@/hooks/useManagedContent";
import { PACKAGE_ITEMS } from "@/data/businessContent";
import { goToContact } from "@/lib/contactNavigation";

const FEATURED_PACKAGE_IDS = [
  "fireworks-multicolor-2026",
  "fireworks-gold-2026",
  "fireworks-diamond-piromusical-2026",
];
```

Resolve only matching managed entries, preserving their current content:

```jsx
const managedPackages = useManagedContent("packages", PACKAGE_ITEMS);
const featuredPackages = useMemo(
  () => FEATURED_PACKAGE_IDS
    .map((id) => managedPackages.find((item) => item.id === id))
    .filter(Boolean),
  [managedPackages],
);

const requestPackage = (item) => goToContact({
  package_id: item.id,
  package_title: item.title,
  services: [item.category],
});
```

Render semantic text panels with no media element:

```jsx
<section
  ref={sectionRef}
  className="fa-packages"
  data-home-scene="packages"
  data-testid="home-packages"
  data-motion={reduceMotion ? "static" : "reveal"}
  aria-labelledby="fa-packages-title"
>
  <div className="fa-packages__inner nr-shell">
    <header className="fa-packages__header">
      <p className="fa-kicker">Pachete FireArtRo</p>
      <h2 id="fa-packages-title">Trei moduri de a aprinde noaptea.</h2>
      <p>Alege un punct de plecare. Configurația finală se adaptează locului, ritmului și momentului.</p>
    </header>

    <div className="fa-packages__triptych" data-package-triptych>
      {featuredPackages.map((item, index) => (
        <article data-package-panel data-package-id={item.id} className="fa-package-panel" key={item.id}>
          <div className="fa-package-panel__topline">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{item.category}</span>
          </div>
          <div className="fa-package-panel__body">
            {item.badge && <p className="fa-package-panel__badge">{item.badge}</p>}
            <h3>{item.title}</h3>
            <p>{item.shortDescription}</p>
            <dl>
              <div><dt>Durată</dt><dd>{item.duration}</dd></div>
              <div><dt>Potrivit pentru</dt><dd>{item.bestFor}</dd></div>
            </dl>
            <ul>{item.highlights.slice(0, 3).map((value) => <li key={value}>{value}</li>)}</ul>
          </div>
          <button type="button" data-package-request onClick={() => requestPackage(item)}>
            <span>Cere ofertă</span><ArrowUpRight aria-hidden="true" />
          </button>
        </article>
      ))}
    </div>

    <Link className="fa-line-link fa-packages__all" to="/pachete">
      <span>Vezi toate pachetele</span><ArrowUpRight aria-hidden="true" />
    </Link>
  </div>
</section>
```

- [ ] **Step 4: Run the focused tests and verify green**

Run the same command from Step 2.

Expected: both tests PASS. Existing layout tests may still fail until Task 2 because the retired CSS has not yet been replaced.

- [ ] **Step 5: Commit the data and markup change**

```powershell
git add frontend/src/components/night/HomePackages.jsx frontend/e2e/night-runway-home.spec.js
git commit -m "Replace homepage package media with real offers"
```

---

### Task 2: Build The Responsive Editorial Triptych And Clean Scene Boundary

**Files:**
- Modify: `frontend/e2e/night-runway-home-refactor.spec.js:98-190`
- Modify: `frontend/e2e/night-runway-transitions.spec.js:1-285`
- Modify: `frontend/e2e/night-runway-mobile-motion.spec.js:1-30`
- Modify: `frontend/e2e/night-runway-motion-matrix.spec.js:1-20`
- Modify: `frontend/e2e/night-runway-animation-frames.spec.js:55-95`
- Modify: `frontend/src/components/night/HomePackages.jsx`
- Modify: `frontend/src/styles/night-home-film.css:230-466, 975-1105, 1175-1230, 1280-1320`

**Interfaces:**
- Consumes: Task 1's `[data-package-panel]`, `[data-package-triptych]`, and `data-motion="reveal"` markup.
- Produces: a non-pinned package section, a short one-time reveal, and stable three-column or stacked geometry depending on width.

- [ ] **Step 1: Write failing boundary and responsive-layout tests**

Replace the media-led package test in `night-runway-home-refactor.spec.js` with:

```js
test("lays out the text-only package triptych without viewport overflow", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900, columns: true },
    { width: 1024, height: 768, columns: true },
    { width: 834, height: 1194, columns: false },
    { width: 430, height: 932, columns: false },
    { width: 390, height: 844, columns: false },
    { width: 844, height: 390, columns: false },
    { width: 568, height: 320, columns: false },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const packages = page.getByTestId("home-packages");
    const boxes = await packages.locator("[data-package-panel]").evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }),
    );

    if (viewport.columns) {
      expect(Math.max(...boxes.map((box) => box.y)) - Math.min(...boxes.map((box) => box.y))).toBeLessThan(4);
    } else {
      expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 2);
      expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 2);
    }

    const width = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
  }
});
```

Replace retired handoff tests in `night-runway-transitions.spec.js` with a normal-flow boundary test:

```js
test("uses the real gallery outro once and starts packages in normal flow", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const gallery = page.getByTestId("home-gallery");
  const packages = page.getByTestId("home-packages");

  await expect(gallery.getByText("Spectacolul continuă.", { exact: true })).toHaveCount(1);
  await expect(packages.getByText("Spectacolul continuă.", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("gallery-package-handoff")).toHaveCount(0);
  await expect(packages).toHaveCSS("margin-top", "0px");

  const packageHeight = await packages.evaluate((node) => node.getBoundingClientRect().height);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  expect(packageHeight).toBeLessThan(viewportHeight * 3);
});
```

Update motion expectations:

```js
await expect(gallery).toHaveAttribute("data-motion", "scroll");
await expect(packages).toHaveAttribute("data-motion", "reveal");
await expect(packages.locator(".pin-spacer")).toHaveCount(0);
```

Rename the touch motion test to `uses gallery scroll and package reveal motion on touch`, keep the gallery transform assertion, remove the handoff-transform assertion, and assert that the package panels become visible after `packages.scrollIntoViewIfNeeded()`.

Add a 200-percent text test after the responsive geometry loop:

```js
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("/", { waitUntil: "domcontentloaded" });
await page.addStyleTag({ content: "html { font-size: 200% !important; }" });

const packages = page.getByTestId("home-packages");
for (const panel of await packages.locator("[data-package-panel]").all()) {
  const box = await panel.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(-1);
  expect(box.x + box.width).toBeLessThanOrEqual(391);
  await expect(panel.getByRole("button", { name: /cere ofertă/i })).toBeVisible();
}
const zoomWidth = await page.evaluate(() => ({
  client: document.documentElement.clientWidth,
  scroll: document.documentElement.scrollWidth,
}));
expect(zoomWidth.scroll).toBeLessThanOrEqual(zoomWidth.client + 1);
```

In the animation-frame test, replace pinned package sampling with:

```js
await packages.scrollIntoViewIfNeeded();
await settleFrame(page);
await page.screenshot({ path: testInfo.outputPath("packages-triptych.png"), fullPage: false });
await expect(packages.locator("[data-package-panel]")).toHaveCount(3);
```

- [ ] **Step 2: Run the responsive package tests and verify red**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-home-refactor.spec.js e2e/night-runway-transitions.spec.js e2e/night-runway-mobile-motion.spec.js e2e/night-runway-motion-matrix.spec.js --project=desktop-chromium --project=mobile-webkit --project=tablet-webkit --grep "triptych|normal flow|animation path|gallery scroll"
```

Expected: FAIL because the old package section still has `height: 542svh`, negative overlap, sticky geometry, and retired card rules.

- [ ] **Step 3: Add the short one-time package reveal**

Inside `HomePackages`, use the existing `sectionRef` and `useReducedMotion` value:

```jsx
useLayoutEffect(() => {
  const section = sectionRef.current;
  if (!section || reduceMotion) return undefined;

  const context = gsap.context(() => {
    gsap.fromTo(
      "[data-package-panel]",
      { y: 42, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.72,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      },
    );
  }, section);

  return () => context.revert();
}, [featuredPackages.length, reduceMotion]);
```

Keep `gsap.registerPlugin(ScrollTrigger)`. Do not pin this section and do not create a scrub timeline.

- [ ] **Step 4: Replace the retired package CSS with the editorial layout**

Delete the rules for these retired selectors throughout `night-home-film.css`:

```css
.fa-packages__sticky
.fa-packages__handoff
.fa-packages__handoff-card
.fa-packages__handoff-outro
.fa-packages__reveal-copy
.fa-packages__lineup
.fa-package-slab
.fa-package-slab__veil
.fa-package-slab__play
.fa-package-slab__copy
.fa-package-slab__description
.fa-package-slab__link
```

Replace the base section with:

```css
.fa-packages {
  position: relative;
  z-index: 2;
  height: auto;
  margin-top: 0;
  padding: clamp(6rem, 11vw, 10rem) 0;
  color: var(--fa-white);
  background:
    linear-gradient(180deg, #02070e 0%, #07182d 48%, #020407 100%),
    repeating-linear-gradient(128deg, transparent 0 12rem, rgba(127, 180, 255, 0.035) 12.08rem 12.15rem);
}

.fa-packages::before {
  position: absolute;
  top: 0;
  right: var(--nr-gutter);
  left: var(--nr-gutter);
  height: 1px;
  content: "";
  background: linear-gradient(90deg, transparent, rgba(141, 211, 255, 0.72), transparent);
}

.fa-packages__inner {
  display: grid;
  gap: clamp(2.5rem, 5vw, 4.75rem);
}

.fa-packages__header {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.65fr);
  align-items: end;
  gap: 2rem;
}

.fa-packages__header h2 {
  max-width: 12ch;
  margin-top: 1rem;
  font-family: "Bricolage Grotesque", "Sora", sans-serif;
  font-size: clamp(3.3rem, 6.2vw, 6.8rem);
  font-weight: 460;
  line-height: 0.92;
}

.fa-packages__header > p:last-child {
  max-width: 37ch;
  justify-self: end;
  color: rgba(243, 246, 251, 0.68);
  line-height: 1.65;
}

.fa-packages__triptych {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid rgba(141, 211, 255, 0.25);
  border-bottom: 1px solid rgba(141, 211, 255, 0.25);
}

.fa-package-panel {
  display: flex;
  min-width: 0;
  min-height: clamp(32rem, 55vw, 42rem);
  flex-direction: column;
  padding: clamp(1.4rem, 2.4vw, 2.3rem);
  border-right: 1px solid rgba(141, 211, 255, 0.2);
  background: rgba(2, 7, 14, 0.42);
  transition: background 240ms ease, border-color 240ms ease;
}

.fa-package-panel:first-child { border-left: 1px solid rgba(141, 211, 255, 0.2); }
.fa-package-panel:hover,
.fa-package-panel:focus-within {
  border-color: rgba(141, 211, 255, 0.62);
  background: rgba(12, 35, 61, 0.58);
}

.fa-package-panel__topline {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--fa-ice);
  font-size: 0.68rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
}

.fa-package-panel__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding-top: clamp(3.5rem, 8vw, 7rem);
}

.fa-package-panel h3 {
  max-width: 11ch;
  font-family: "Bricolage Grotesque", "Sora", sans-serif;
  font-size: clamp(2.4rem, 4vw, 4.7rem);
  font-weight: 480;
  line-height: 0.94;
}

.fa-package-panel__body > p:not(.fa-package-panel__badge) {
  max-width: 32ch;
  margin-top: 1.25rem;
  color: rgba(243, 246, 251, 0.72);
  line-height: 1.55;
}

.fa-package-panel dl,
.fa-package-panel ul {
  margin-top: 1.7rem;
}

.fa-package-panel [data-package-request] {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0.9rem 0;
  border-top: 1px solid rgba(141, 211, 255, 0.35);
  color: var(--fa-white);
  background: transparent;
}
```

Add responsive rules:

```css
@media (max-width: 899px) {
  .fa-packages { padding: clamp(5rem, 14vw, 8rem) 0; }
  .fa-packages__header { grid-template-columns: 1fr; }
  .fa-packages__header > p:last-child { justify-self: start; }
  .fa-packages__triptych { grid-template-columns: 1fr; }
  .fa-package-panel,
  .fa-package-panel:first-child {
    min-height: 0;
    border-right: 1px solid rgba(141, 211, 255, 0.2);
    border-bottom: 1px solid rgba(141, 211, 255, 0.2);
    border-left: 1px solid rgba(141, 211, 255, 0.2);
  }
  .fa-package-panel:last-child { border-bottom: 0; }
  .fa-package-panel__body { padding-top: clamp(2.5rem, 8vw, 4rem); }
}

@media (min-width: 600px) and (max-width: 899px) {
  .fa-package-panel__body {
    display: grid;
    grid-template-columns: minmax(13rem, 0.8fr) minmax(0, 1.2fr);
    column-gap: clamp(2rem, 6vw, 5rem);
  }
  .fa-package-panel__body h3,
  .fa-package-panel__badge { grid-column: 1; }
  .fa-package-panel__body > p:not(.fa-package-panel__badge),
  .fa-package-panel dl,
  .fa-package-panel ul { grid-column: 2; }
}

@media (max-height: 560px) and (orientation: landscape) {
  .fa-packages { padding-block: 4rem; }
  .fa-package-panel { padding: 1.15rem; }
  .fa-package-panel__body { padding-top: 2rem; }
}
```

Remove `.fa-package-slab` from the reduced-motion transition lists and make package panels visible explicitly:

```css
@media (prefers-reduced-motion: reduce) {
  .fa-package-panel {
    opacity: 1 !important;
    transform: none !important;
    transition: none;
  }
}
```

- [ ] **Step 5: Run the focused tests and verify green**

Run the command from Step 2.

Expected: PASS on desktop Chromium, mobile WebKit, and tablet WebKit.

- [ ] **Step 6: Commit the triptych layout and boundary**

```powershell
git add frontend/src/components/night/HomePackages.jsx frontend/src/styles/night-home-film.css frontend/e2e/night-runway-home-refactor.spec.js frontend/e2e/night-runway-transitions.spec.js frontend/e2e/night-runway-mobile-motion.spec.js frontend/e2e/night-runway-motion-matrix.spec.js frontend/e2e/night-runway-animation-frames.spec.js
git commit -m "Build responsive editorial package triptych"
```

---

### Task 3: Make Gallery Motion Orientation-Safe

**Files:**
- Modify: `frontend/e2e/night-runway-transitions.spec.js`
- Modify: `frontend/e2e/night-runway-home-refactor.spec.js`
- Modify: `frontend/src/components/night/HomeGallery.jsx:20-105`
- Modify: `frontend/src/styles/night-home-film.css:74-228, 907-975, 1170-1280`

**Interfaces:**
- Consumes: existing `.fa-work__viewport`, `.fa-work__track`, `[data-gallery-panel]`, and `[data-gallery-lift]` structure.
- Produces: a gallery ScrollTrigger whose runway and panel width stay aligned after any supported viewport or orientation change.

- [ ] **Step 1: Add a failing orientation-refresh test**

Add to `night-runway-transitions.spec.js`:

```js
test("recalculates full-width gallery panels after phone and tablet rotation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });

  const gallery = page.getByTestId("home-gallery");
  const panels = gallery.locator("[data-gallery-panel]");

  const expectPanelsToMatchViewport = async () => {
    const viewportWidth = await gallery.locator(".fa-work__viewport").evaluate((node) => node.clientWidth);
    for (const panel of await panels.all()) {
      const box = await panel.boundingBox();
      expect(Math.abs(box.width - viewportWidth)).toBeLessThanOrEqual(2);
    }
  };

  await expectPanelsToMatchViewport();
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(500);
  await expectPanelsToMatchViewport();
  await page.setViewportSize({ width: 1194, height: 834 });
  await page.waitForTimeout(500);
  await expectPanelsToMatchViewport();
  await page.setViewportSize({ width: 834, height: 1194 });
  await page.waitForTimeout(500);
  await expectPanelsToMatchViewport();

  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});
```

Keep the existing final-photo progression assertion and add a touch-landscape sample so an iPad using coarse input cannot use the shorter desktop runway.

- [ ] **Step 2: Run the orientation test and verify red**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-transitions.spec.js --project=mobile-webkit --project=tablet-webkit --grep "recalculates full-width|final gallery photo"
```

Expected: FAIL on at least one rotated/coarse layout because the JavaScript compact-layout check currently uses only `window.innerWidth <= 899`, while CSS also treats coarse pointers as compact.

- [ ] **Step 3: Align JavaScript compact detection with CSS and refresh on orientation**

Inside `HomeGallery`, create one compact-layout predicate before building the timeline:

```jsx
const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)");
const isCompactLayout = () => window.innerWidth <= 899 || coarsePointer.matches;
```

Use it in the ScrollTrigger runway calculation:

```jsx
end: () => {
  measure();
  const scrollRunwayMultiplier = isCompactLayout() ? 0.93 : 0.686;
  return `+=${Math.max(viewportWidth * 1.392, travelDistance * scrollRunwayMultiplier)}`;
},
```

Schedule a deterministic refresh for resize and orientation changes:

```jsx
let refreshCall;
const refreshScene = () => {
  refreshCall?.kill();
  refreshCall = gsap.delayedCall(0.12, () => ScrollTrigger.refresh());
};

window.addEventListener("resize", refreshScene, { passive: true });
window.addEventListener("orientationchange", refreshScene, { passive: true });
coarsePointer.addEventListener?.("change", refreshScene);
```

Extend cleanup inside the GSAP context callback:

```jsx
return () => {
  refreshCall?.kill();
  window.removeEventListener("resize", refreshScene);
  window.removeEventListener("orientationchange", refreshScene);
  coarsePointer.removeEventListener?.("change", refreshScene);
  timeline.kill();
  section.style.removeProperty("--nr-scene-width");
};
```

- [ ] **Step 4: Normalize portrait and short-landscape image frames**

Keep full-width panels but constrain the inner media, not the panel:

```css
@media (max-width: 899px) and (orientation: portrait) {
  .fa-work__card figure {
    width: min(100%, 34rem);
    height: auto;
    aspect-ratio: 4 / 5;
    margin-inline: auto;
  }
  .fa-work__meta {
    width: min(100%, 34rem);
    margin-inline: auto;
  }
}

@media (max-width: 899px) and (orientation: landscape) {
  .fa-work__card figure {
    width: min(52vw, 28rem);
    height: auto;
    aspect-ratio: 3 / 2;
    margin-inline: auto;
  }
  .fa-work__meta {
    width: min(52vw, 28rem);
    margin-inline: auto;
  }
}
```

Retain `object-fit: cover`; use only existing per-image focal behavior and do not replace the photographs.

- [ ] **Step 5: Run orientation, framing, and smooth-final-transition tests**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-transitions.spec.js e2e/night-runway-home-refactor.spec.js --project=mobile-chromium --project=mobile-webkit --project=tablet-webkit --grep "recalculates full-width|final gallery photo|gallery photos framed|mobile gallery panel"
```

Expected: PASS in phone Chromium, phone WebKit, and tablet WebKit profiles.

- [ ] **Step 6: Commit the orientation-safe gallery**

```powershell
git add frontend/src/components/night/HomeGallery.jsx frontend/src/styles/night-home-film.css frontend/e2e/night-runway-transitions.spec.js frontend/e2e/night-runway-home-refactor.spec.js
git commit -m "Stabilize gallery motion across orientation changes"
```

---

### Task 4: Complete Regression, Visual QA, And Delivery

**Files:**
- Verify: `frontend/src/components/night/HomeGallery.jsx`
- Verify: `frontend/src/components/night/HomePackages.jsx`
- Verify: `frontend/src/styles/night-home-film.css`
- Verify: all modified `frontend/e2e/*.spec.js` files
- Temporary only: `output/playwright/night-runway-results/**`

**Interfaces:**
- Consumes: Tasks 1-3 complete implementation.
- Produces: a clean production build, cross-browser responsive evidence, no retained temporary screenshots, and `origin/main` updated to the verified commit.

- [ ] **Step 1: Run syntax and whitespace checks**

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors; only intended source, CSS, and test files are modified or committed.

- [ ] **Step 2: Build the production frontend**

```powershell
cd frontend
$env:NODE_OPTIONS="--max-old-space-size=8192"
yarn build
```

Expected: `Compiled successfully.` with no new build error.

- [ ] **Step 3: Run the complete affected regression set**

```powershell
cd frontend
yarn playwright test e2e/night-runway-home.spec.js e2e/night-runway-home-refactor.spec.js e2e/night-runway-transitions.spec.js e2e/night-runway-mobile-motion.spec.js e2e/night-runway-motion-matrix.spec.js --project=desktop-chromium --project=desktop-firefox --project=desktop-webkit --project=mobile-chromium --project=mobile-webkit --project=tablet-webkit --reporter=line
```

Expected: all non-skipped tests PASS. Investigate any failure; do not weaken a layout assertion merely to make a browser pass.

- [ ] **Step 4: Capture and inspect representative visual frames**

Run the frame capture on four distinct layouts:

```powershell
cd frontend
yarn playwright test e2e/night-runway-animation-frames.spec.js --project=desktop-chromium --project=mobile-chromium --project=mobile-webkit --project=tablet-webkit --reporter=line
```

Inspect the generated gallery opening, final-photo transition, closing panel, package triptych, and boundary frames. Confirm:

- all three photographs remain recognisable;
- `Spectacolul continuă.` appears once;
- no package photograph, poster, or play icon remains;
- all three package titles and CTAs are readable;
- short landscape does not crop text or CTA;
- no black blank frame appears between scenes.

- [ ] **Step 5: Delete only the generated diagnostic artifacts**

Resolve and validate the exact Playwright output path, then remove it in the same PowerShell process:

```powershell
$artifactPath = (Resolve-Path "..\output\playwright\night-runway-results").Path
$playwrightRoot = (Resolve-Path "..\output\playwright").Path
if (-not $artifactPath.StartsWith($playwrightRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to remove a path outside the Playwright output directory: $artifactPath"
}
Remove-Item -LiteralPath $artifactPath -Recurse -Force
```

Do not remove any source media or workspace directory.

- [ ] **Step 6: Re-run the focused smoke tests after artifact cleanup**

```powershell
cd frontend
yarn playwright test e2e/night-runway-home.spec.js e2e/night-runway-transitions.spec.js --project=desktop-chromium --project=mobile-webkit --project=tablet-webkit --grep "real managed packages|prefills the quote|normal flow|recalculates full-width|final gallery photo" --reporter=line
```

Expected: all focused tests PASS.

- [ ] **Step 7: Review final diff and commit any verification-driven corrections**

```powershell
git diff --check
git status --short
git diff --stat
git diff -- frontend/src/components/night/HomeGallery.jsx frontend/src/components/night/HomePackages.jsx frontend/src/styles/night-home-film.css frontend/e2e
```

If visual QA required corrections, commit them with:

```powershell
git add frontend/src/components/night/HomeGallery.jsx frontend/src/components/night/HomePackages.jsx frontend/src/styles/night-home-film.css frontend/e2e
git commit -m "Polish responsive homepage opening scenes"
```

- [ ] **Step 8: Push the verified result to `main` and confirm the remote hash**

```powershell
git push origin HEAD:main
git status --short
git log -1 --oneline
git ls-remote origin refs/heads/main
```

Expected: clean status and the same commit hash locally and on `origin/main`.
