# FireArt Atmospheric Backgrounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained photographic color-blur atmosphere to the requested FireArt surfaces, enlarge only the homepage horizontal gallery on desktop, and update the homepage package heading without changing navigation, footer, controls, or the hero video.

**Architecture:** Keep every decorative image inside the stylesheet that owns its page or section. Use isolated pseudo-elements behind route content, and reuse the existing image wrapper in Home About. Preserve the existing GSAP gallery implementation, changing only desktop panel geometry and compensating its runway multiplier so the animation duration stays stable.

**Tech Stack:** React 19, CRA/CRACO, CSS, GSAP ScrollTrigger, Playwright 1.62.

## Global Constraints

- Use only existing optimized WebP files from `frontend/public/media`.
- Desktop background-image visibility stays between 10% and 16%; mobile visibility does not exceed 12%.
- The 1512×982 homepage gallery image occupies 54%–60% of the viewport width.
- Mobile, tablet portrait, and touch-landscape gallery framing remains unchanged.
- Keep navbar, footer, buttons, hero video, package data, form behavior, routing, and deployment configuration unchanged.
- Replace the homepage package title with `Fiecare noapte cere alt spectacol.` and remove its supporting paragraph entirely.
- No horizontal overflow at the approved responsive viewport matrix.

---

### Task 1: Lock the requested visual behavior in regression tests

**Files:**
- Create: `frontend/e2e/night-runway-atmosphere.spec.js`

**Interfaces:**
- Consumes: existing route selectors and `data-testid` attributes from Home, Contact, FAQ, Gallery, and Packages.
- Produces: Playwright regression coverage for copy, desktop gallery scale, background assets, stacking, and overflow.

- [ ] **Step 1: Create the failing regression spec**

```js
const { expect, test } = require("@playwright/test");

const necessaryConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  savedAt: "2026-08-31T00:00:00.000Z",
  expiresAt: "2099-08-31T00:00:00.000Z",
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((consent) => {
    window.localStorage.setItem("fireartro-cookie-consent-v1", JSON.stringify(consent));
  }, necessaryConsent);
});

test("homepage gallery is substantial and requested sections use photographic atmosphere", async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 982 });
  await page.goto("/#acasa", { waitUntil: "domcontentloaded" });

  const metrics = await page.evaluate(() => {
    const background = (selector, pseudo = "::before") =>
      getComputedStyle(document.querySelector(selector), pseudo).backgroundImage;
    const card = document.querySelector(".fa-work__card-inner").getBoundingClientRect();
    return {
      cardRatio: card.width / window.innerWidth,
      gallery: background(".fa-work__sticky"),
      packages: background(".fa-packages"),
      aboutFilter: getComputedStyle(document.querySelector(".fa-about__image img")).filter,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(metrics.cardRatio).toBeGreaterThanOrEqual(0.54);
  expect(metrics.cardRatio).toBeLessThanOrEqual(0.6);
  expect(metrics.gallery).toContain("fireartro-drone-show-focsani-dji-0768-enhanced-nr.webp");
  expect(metrics.packages).toContain("fireartro-artificii-noapte-spectacol-091.webp");
  expect(metrics.aboutFilter).toContain("blur");
  expect(metrics.overflow).toBeLessThanOrEqual(1);

  const packages = page.getByTestId("home-packages");
  await expect(packages.getByRole("heading", { level: 2 }))
    .toHaveText("Fiecare noapte cere alt spectacol.");
  await expect(packages).not.toContainText("Alege un punct de plecare");
});

for (const probe of [
  ["/contact", ".nr-contact-main", "fireartro-artificii-noapte-spectacol-070.webp"],
  ["/intrebari-frecvente", ".nr-faq-route", "fireartro-drone-show-neversea-show-img-4351.webp"],
  ["/galerie", ".nr-gallery-page", "fireartro-drone-show-untold-img-6900-2.webp"],
  ["/pachete", ".nr-packages-page", "fireartro-artificii-noapte-spectacol-091.webp"],
]) {
  test(`${probe[0]} uses its assigned atmospheric image behind content`, async ({ page }) => {
    await page.setViewportSize({ width: 1512, height: 982 });
    await page.goto(probe[0], { waitUntil: "domcontentloaded" });
    const state = await page.locator(probe[1]).evaluate((node) => ({
      image: getComputedStyle(node, "::before").backgroundImage,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(state.image).toContain(probe[2]);
    expect(state.overflow).toBeLessThanOrEqual(1);
  });
}
```

- [ ] **Step 2: Run the new spec and verify the expected failures**

Run:

```powershell
$env:PLAYWRIGHT_USE_EXISTING_SERVER='1'
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3000'
npx playwright test e2e/night-runway-atmosphere.spec.js --project=desktop-chromium
```

Expected: FAIL because the gallery ratio is about `0.42`, Home About has no blur, the new title is absent, the old paragraph remains, and route pseudo-elements do not yet contain the assigned images.

- [ ] **Step 3: Commit the failing test**

```powershell
git add frontend/e2e/night-runway-atmosphere.spec.js
git commit -m "test: define atmospheric section treatment"
```

---

### Task 2: Enlarge the homepage gallery and refine the three homepage atmospheres

**Files:**
- Modify: `frontend/src/styles/night-home.css:1-14`
- Modify: `frontend/src/styles/night-home-film.css:74-352`
- Modify: `frontend/src/components/night/HomeGallery.jsx:123-140`
- Modify: `frontend/src/components/night/HomePackages.jsx:74-82`
- Test: `frontend/e2e/night-runway-atmosphere.spec.js`

**Interfaces:**
- Consumes: `--nr-gallery-panel-width`, `.fa-work__card-inner`, `.fa-work__sticky`, `.fa-packages`, `.fa-about__image`, and the existing GSAP `scrollRunwayMultiplier`.
- Produces: a 56vw desktop gallery image, an unchanged compact/touch layout, and the approved package copy.

- [ ] **Step 1: Increase only desktop gallery geometry**

In `night-home.css`, set:

```css
--nr-gallery-panel-width: clamp(48rem, 64vw, 84rem);
```

In `night-home-film.css`, set:

```css
.fa-work__card-inner {
  width: min(92%, clamp(44rem, 56vw, 72rem));
  margin-inline: auto;
}

.fa-work__card figure {
  height: clamp(22rem, min(64dvh, 42vw), 48rem);
}
```

Keep all existing compact/touch media-query overrides unchanged.

- [ ] **Step 2: Compensate the wider desktop panels without lengthening the animation**

In `HomeGallery.jsx`, change only the non-compact runway multiplier:

```js
const scrollRunwayMultiplier = compactScene ? 0.44 : 0.48;
```

Keep `viewportRunwayMultiplier`, progress easing, touch handling, and intro/outro thresholds unchanged.

- [ ] **Step 3: Make the homepage gallery and package images read as dark atmosphere**

Use these focused values in `night-home-film.css`:

```css
.fa-work__sticky::before {
  opacity: 0.15;
  filter: saturate(1.24) contrast(1.08) brightness(0.5);
  transform: scale(1.08);
}

.fa-packages::before {
  opacity: 0.14;
  filter: saturate(1.18) contrast(1.08) brightness(0.46);
  transform: scale(1.08);
}
```

Add a second restrained warm radial wash to `.fa-work__sticky::after`; keep the existing top handoff gradient first in the background stack so the hero transition remains seamless.

- [ ] **Step 4: Reframe Home About as a blurred full-section photograph**

Apply:

```css
.fa-about__image {
  inset: -6%;
}

.fa-about__image img {
  opacity: 0.58;
  object-position: center 44%;
  filter: blur(18px) saturate(1.16) contrast(1.08) brightness(0.48);
  transform: scale(1.08);
}

.fa-about__shade {
  background:
    radial-gradient(circle at 72% 70%, rgba(65, 114, 255, 0.2), transparent 34%),
    linear-gradient(90deg, rgba(2, 5, 9, 0.86), rgba(2, 5, 9, 0.56) 62%, rgba(2, 5, 9, 0.74));
}
```

At the existing compact breakpoint, cap the Home gallery/package pseudo-element opacity at `0.11` and Home About image opacity at `0.48`.

```css
@media (max-width: 899px), (hover: none) and (pointer: coarse) {
  .fa-work__sticky::before,
  .fa-packages::before {
    opacity: 0.11;
    filter: saturate(1.12) contrast(1.05) brightness(0.44);
  }

  .fa-about__image img {
    opacity: 0.48;
    filter: blur(14px) saturate(1.1) contrast(1.06) brightness(0.46);
  }
}
```

- [ ] **Step 5: Apply the approved package copy**

In `HomePackages.jsx`, use:

```jsx
<header className="fa-packages__header">
  <p className="fa-kicker">Pachete FireArtRo</p>
  <h2 id="fa-packages-title">Fiecare noapte cere alt spectacol.</h2>
</header>
```

Change `.fa-packages__header` to a single-column grid and retain the existing title maximum width.

- [ ] **Step 6: Run homepage tests and verify green**

Run:

```powershell
npx playwright test e2e/night-runway-atmosphere.spec.js e2e/night-runway-home-refactor.spec.js e2e/night-runway-transitions.spec.js --project=desktop-chromium
```

Expected: the homepage atmosphere test passes; gallery motion and transition tests remain green.

- [ ] **Step 7: Commit the homepage implementation**

```powershell
git add frontend/src/styles/night-home.css frontend/src/styles/night-home-film.css frontend/src/components/night/HomeGallery.jsx frontend/src/components/night/HomePackages.jsx
git commit -m "feat: deepen homepage atmospheric scenes"
```

---

### Task 3: Add route-specific atmospheric photographs

**Files:**
- Modify: `frontend/src/styles/night-contact.css:1-20`
- Modify: `frontend/src/styles/night-faq.css:1-20`
- Modify: `frontend/src/styles/night-gallery.css:1-30`
- Modify: `frontend/src/styles/night-packages.css:1-30`
- Test: `frontend/e2e/night-runway-atmosphere.spec.js`

**Interfaces:**
- Consumes: `.nr-contact-main`, `.nr-faq-route`, `.nr-gallery-page`, and `.nr-packages-page` route roots.
- Produces: one isolated `::before` photographic layer and one dark/color `::after` veil per route, with route content stacked at `z-index: 1`.

- [ ] **Step 1: Add the Contact atmosphere**

Add `isolation: isolate` and `overflow: hidden` to `.nr-contact-main`, then create:

```css
.nr-contact-main::before {
  position: absolute;
  z-index: 0;
  inset: -8%;
  content: "";
  pointer-events: none;
  opacity: 0.14;
  background: url("../../public/media/gallery/fireartro-artificii-noapte-spectacol-070.webp") 46% 48% / cover no-repeat;
  filter: blur(26px) saturate(1.12) brightness(0.44);
  transform: scale(1.08);
}

.nr-contact-main::after {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle at 28% 36%, rgba(191, 52, 71, 0.16), transparent 35%), linear-gradient(90deg, rgba(3, 5, 10, 0.7), rgba(3, 5, 10, 0.9));
}

.nr-contact-layout { position: relative; z-index: 1; }
```

- [ ] **Step 2: Add the FAQ atmosphere**

Use:

```css
.nr-faq-route {
  position: relative;
  isolation: isolate;
  overflow: clip;
}

.nr-faq-route::before {
  position: absolute;
  z-index: 0;
  top: -5rem;
  right: -6%;
  left: -6%;
  height: clamp(44rem, 100dvh, 64rem);
  content: "";
  pointer-events: none;
  opacity: 0.13;
  background: url("../../public/media/gallery/fireartro-drone-show-neversea-show-img-4351.webp") 50% 32% / cover no-repeat;
  filter: blur(28px) saturate(1.2) brightness(0.46);
  transform: scale(1.08);
}

.nr-faq-route::after {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle at 68% 22%, rgba(81, 74, 255, 0.17), transparent 28rem), linear-gradient(180deg, rgba(5, 6, 8, 0.54), #050608 62rem);
}

.nr-faq-page,
.nr-faq-route > footer { position: relative; z-index: 1; }
```

- [ ] **Step 3: Add the Gallery atmosphere**

Use:

```css
.nr-gallery-page::before {
  position: absolute;
  z-index: 0;
  top: -6rem;
  right: -6%;
  left: -6%;
  height: clamp(48rem, 110dvh, 72rem);
  content: "";
  pointer-events: none;
  opacity: 0.13;
  background: url("../../public/media/gallery/fireartro-drone-show-untold-img-6900-2.webp") 50% 38% / cover no-repeat;
  filter: blur(28px) saturate(1.18) brightness(0.44);
  transform: scale(1.08);
}

.nr-gallery-page::after {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle at 72% 18%, rgba(105, 61, 230, 0.15), transparent 30rem), linear-gradient(180deg, rgba(6, 8, 11, 0.48), #06080b 68rem);
}

.nr-gallery-stage,
.nr-gallery-page > footer { position: relative; z-index: 1; }
```

Retain the existing mosaic card backgrounds.

- [ ] **Step 4: Add the Packages atmosphere**

Use:

```css
.nr-packages-page {
  position: relative;
  isolation: isolate;
}

.nr-packages-page::before {
  position: absolute;
  z-index: 0;
  top: -5rem;
  right: -6%;
  left: -6%;
  height: clamp(46rem, 105dvh, 68rem);
  content: "";
  pointer-events: none;
  opacity: 0.14;
  background: url("../../public/media/gallery/fireartro-artificii-noapte-spectacol-091.webp") 52% 42% / cover no-repeat;
  filter: blur(24px) saturate(1.16) brightness(0.43);
  transform: scale(1.08);
}

.nr-packages-page::after {
  position: absolute;
  z-index: 0;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(circle at 28% 28%, rgba(201, 58, 49, 0.15), transparent 30rem), linear-gradient(180deg, rgba(2, 4, 8, 0.48), var(--nr-obsidian) 64rem);
}

.nr-package-comparator,
.nr-packages-page > footer { position: relative; z-index: 1; }
```

Do not change package media, tabs, or actions.

- [ ] **Step 5: Apply mobile visibility caps**

Add these exact compact overrides to the corresponding existing `@media (max-width: 899px)` blocks:

```css
.nr-contact-main::before {
  opacity: 0.1;
  background-position: 40% 50%;
  filter: blur(18px) saturate(1.08) brightness(0.42);
}

.nr-faq-route::before {
  opacity: 0.11;
  background-position: 50% 28%;
  filter: blur(18px) saturate(1.14) brightness(0.44);
}

.nr-gallery-page::before {
  opacity: 0.1;
  background-position: 52% 20%;
  filter: blur(18px) saturate(1.12) brightness(0.42);
}

.nr-packages-page::before {
  opacity: 0.11;
  background-position: 48% 30%;
  filter: blur(18px) saturate(1.1) brightness(0.41);
}
```

- [ ] **Step 6: Run route tests and verify green**

Run:

```powershell
npx playwright test e2e/night-runway-atmosphere.spec.js e2e/night-runway-contact.spec.js e2e/night-runway-faq.spec.js e2e/night-runway-packages.spec.js --project=desktop-chromium
```

Expected: all assigned images are reported by computed styles, the contact form and route content remain visible, and no horizontal overflow appears.

- [ ] **Step 7: Commit the route backgrounds**

```powershell
git add frontend/src/styles/night-contact.css frontend/src/styles/night-faq.css frontend/src/styles/night-gallery.css frontend/src/styles/night-packages.css
git commit -m "feat: add route-specific FireArt atmosphere"
```

---

### Task 4: Responsive visual QA, build, and delivery

**Files:**
- No source modification is planned; a failed assertion returns to the owning task before verification continues.
- Test: `frontend/e2e/night-runway-atmosphere.spec.js`

**Interfaces:**
- Consumes: all implementation from Tasks 2 and 3.
- Produces: verified responsive behavior, clean build, final commit state, and an updated `main` remote branch.

- [ ] **Step 1: Run the responsive matrix**

Run:

```powershell
npx playwright test e2e/night-runway-atmosphere.spec.js e2e/night-runway-responsive-matrix.spec.js e2e/night-runway-full-bleed.spec.js --project=desktop-chromium
```

Use the matrix `375×812`, `430×932`, `768×1024`, `1366×768`, `1512×982`, `1920×1080`, `3440×1440`, and `5120×1440`. Confirm `scrollWidth - clientWidth <= 1` for every route.

- [ ] **Step 2: Capture and inspect focused screenshots**

Save homepage gallery, Home About, Home Packages, Contact, FAQ, Gallery, and Packages screenshots under `output/playwright/atmosphere-review/` at `430×932` and `1512×982`. Verify the image remains atmospheric rather than legible as a second hero, text contrast stays clear, and the gallery caption remains inside the viewport.

- [ ] **Step 3: Run cross-browser focused checks**

Run:

```powershell
npx playwright test e2e/night-runway-atmosphere.spec.js --project=desktop-firefox --project=desktop-webkit --project=mobile-webkit --project=tablet-webkit
```

Expected: every project passes with the same copy, asset assignment, and no overflow.

- [ ] **Step 4: Run the production build**

Run:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=8192'
yarn build
```

Expected: `Compiled successfully.` with no build error.

- [ ] **Step 5: Clean generated screenshot artifacts after inspection**

Remove only `output/playwright/atmosphere-review/` after confirming the images; preserve tracked project assets and Playwright source files.

- [ ] **Step 6: Commit any QA-only corrections**

```powershell
git add frontend/src frontend/e2e/night-runway-atmosphere.spec.js
git commit -m "fix: polish responsive atmospheric scenes"
```

Skip this commit when QA required no source correction.

- [ ] **Step 7: Push the completed work to `main`**

```powershell
git fetch origin main
git push origin HEAD:main
```

Do not force-push. Confirm the remote reports the final commit on `main` and keep the development server running on `http://localhost:3000/`.
