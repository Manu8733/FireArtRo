# FireArtRo Blog Compact Scale Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce every public Blog surface by roughly 40% so the archive content is visible in the initial desktop viewport without changing non-Blog pages.

**Architecture:** Keep the existing Blog components and data flow unchanged. Add measurable Playwright layout assertions first, then update only `night-blog.css` with route-scoped size and spacing overrides; finish with fresh build, desktop/mobile flow tests, and visual screenshots.

**Tech Stack:** React 18, CSS, Playwright, Create React App/CRACO

## Global Constraints

- Change only landing Blog, `/blog`, and `/blog/:slug` visual scale.
- Keep the archive hero at or below 360 px at 1920×1080.
- Cap archive title at 88 px desktop and 52 px mobile.
- Cap landing Blog title at 56 px desktop and 36 px mobile; section padding must not exceed 88 px per side on wide desktop.
- Cap article title at 56 px desktop and 42 px mobile.
- Keep 44 px action targets, visible focus, reduced motion, safe text rendering, and zero horizontal overflow.
- Do not change API, Admin, content, footer structure, navbar scale, routes, or other site sections.

---

## File map

- `frontend/e2e/night-runway-blog.spec.js`: owns public Blog flow and measurable responsive regression assertions.
- `frontend/src/styles/night-blog.css`: owns all landing, archive, card, and article Blog styling.
- No component, route, or data file should change for this correction.

### Task 1: Lock compact scale with a failing browser test

**Files:**
- Modify: `frontend/e2e/night-runway-blog.spec.js`
- Test: `frontend/e2e/night-runway-blog.spec.js`

**Interfaces:**
- Consumes: existing `mockBlog(page, posts)` helper and Blog selectors `.fa-home-blog`, `.fa-blog-hero`, `.fa-blog-archive`, `.fa-blog-card`, `.fa-blog-article`.
- Produces: one regression test named `Blog surfaces use the approved compact scale`.

- [ ] **Step 1: Add the failing scale test**

Insert before the Admin test:

```js
test("Blog surfaces use the approved compact scale", async ({ page }) => {
  await mockBlog(page);
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const landing = await page.getByTestId("home-blog").evaluate((section) => {
    const heading = section.querySelector("h2");
    const lead = section.querySelector(".fa-blog-card.is-lead");
    const styles = window.getComputedStyle(section);
    return {
      headingSize: Number.parseFloat(window.getComputedStyle(heading).fontSize),
      paddingTop: Number.parseFloat(styles.paddingTop),
      leadHeight: lead.getBoundingClientRect().height,
    };
  });
  expect(landing.headingSize).toBeLessThanOrEqual(56);
  expect(landing.paddingTop).toBeLessThanOrEqual(88);
  expect(landing.leadHeight).toBeLessThanOrEqual(400);

  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  const archive = await page.locator(".fa-blog-hero").evaluate((hero) => ({
    height: hero.getBoundingClientRect().height,
    titleSize: Number.parseFloat(
      window.getComputedStyle(hero.querySelector("h1")).fontSize,
    ),
  }));
  expect(archive.height).toBeLessThanOrEqual(360);
  expect(archive.titleSize).toBeLessThanOrEqual(88);
  await expect(page.getByTestId("blog-card").first()).toBeInViewport();

  await page.goto("/blog/articol-nou", { waitUntil: "domcontentloaded" });
  const articleTitleSize = await page.locator(".fa-blog-article h1").evaluate(
    (heading) => Number.parseFloat(window.getComputedStyle(heading).fontSize),
  );
  expect(articleTitleSize).toBeLessThanOrEqual(56);

  await page.setViewportSize({ width: 430, height: 932 });
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  const mobileTitleSize = await page.locator(".fa-blog-hero h1").evaluate(
    (heading) => Number.parseFloat(window.getComputedStyle(heading).fontSize),
  );
  expect(mobileTitleSize).toBeLessThanOrEqual(52);
  expect(await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  )).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Build the current frontend**

Run:

```powershell
cd frontend
yarn build
```

Expected: build succeeds so Playwright serves the current CSS.

- [ ] **Step 3: Run the scale test and verify RED**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium --grep "approved compact scale"
```

Expected: FAIL because the current landing padding/title, archive hero/title, lead card, or article title exceeds the approved limits.

- [ ] **Step 4: Commit the regression test only after the complete task is green**

Do not commit at RED. Task 2 will make this test pass, then both files are committed together.

### Task 2: Compact all Blog surfaces in scoped CSS

**Files:**
- Modify: `frontend/src/styles/night-blog.css`
- Test: `frontend/e2e/night-runway-blog.spec.js`

**Interfaces:**
- Consumes: the existing Blog class names and responsive breakpoints at 1080 px, 900 px, 680 px, and short landscape.
- Produces: the same public markup with reduced Blog-only dimensions.

- [ ] **Step 1: Replace the landing scale values**

Apply these exact CSS values:

```css
.fa-home-blog.nr-section {
  padding-block: clamp(4rem, 5.5vw, 5.5rem);
}

.fa-home-blog__head {
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

.fa-home-blog__head h2 {
  font-size: clamp(2rem, 3.2vw, 3.5rem);
}

.fa-home-blog__grid,
.fa-home-blog__secondary {
  gap: clamp(0.85rem, 1.5vw, 1.25rem);
}

.fa-blog-card.is-lead {
  min-height: clamp(21rem, 28vw, 25rem);
}

.fa-blog-card.is-compact {
  min-height: 11.5rem;
}

.fa-home-blog .nr-button {
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}
```

Reduce lead-card copy padding to `clamp(1.25rem, 2vw, 1.75rem)` and lead title size to `clamp(1.75rem, 3vw, 3rem)`. Reduce compact-card copy padding to `clamp(0.9rem, 1.3vw, 1.15rem)`.

- [ ] **Step 2: Replace the archive scale values**

Apply these exact CSS values:

```css
.fa-blog-hero {
  padding: 7rem 0 2.75rem;
}

.fa-blog-hero h1 {
  font-size: clamp(3.5rem, 5vw, 5.5rem);
  line-height: 0.9;
}

.fa-blog-archive.nr-section {
  padding-block: clamp(3.5rem, 5vw, 5rem);
}

.fa-blog-card.is-standard {
  min-height: 20rem;
}

.fa-blog-state {
  padding: clamp(1.5rem, 3vw, 2.5rem);
}
```

Keep the existing three/two/one-column breakpoints and all 44 px action targets.

- [ ] **Step 3: Replace the article scale values**

Apply these exact CSS values:

```css
.fa-blog-article {
  padding: 7rem 0 clamp(4.5rem, 7vw, 7rem);
}

.fa-blog-article__head {
  margin-top: clamp(1.5rem, 3vw, 2.5rem);
}

.fa-blog-article__head h1 {
  font-size: clamp(2.25rem, 4vw, 3.5rem);
}

.fa-blog-article__cover {
  margin-top: clamp(2rem, 4vw, 3rem);
}

.fa-blog-body {
  margin-top: clamp(2.25rem, 4vw, 3.5rem);
}
```

Remove the large translated article error state and use `transform: none` with compact top spacing.

- [ ] **Step 4: Tighten mobile and landscape values**

At `max-width: 680px`, use:

```css
.fa-home-blog__head h2 { font-size: clamp(2rem, 8vw, 2.25rem); }
.fa-blog-card.is-lead,
.fa-blog-card.is-standard { min-height: 18rem; }
.fa-blog-card.is-compact { min-height: 10.5rem; }
.fa-blog-hero { padding-top: 6.5rem; padding-bottom: 2.25rem; }
.fa-blog-hero h1 { font-size: clamp(3rem, 12vw, 3.25rem); }
.fa-blog-article { padding-top: 6.5rem; }
.fa-blog-article__head h1 { font-size: clamp(2.1rem, 9vw, 2.625rem); }
```

At short landscape, reduce hero/article top padding to `5.5rem` and archive padding to `2.5rem`.

- [ ] **Step 5: Build and run the scale test GREEN**

Run:

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium --grep "approved compact scale"
```

Expected: build succeeds and the compact scale test passes.

- [ ] **Step 6: Run the complete Blog regression suite**

Run:

```powershell
cd frontend
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium
yarn playwright test e2e/night-runway-blog.spec.js --project=mobile-chromium --grep-invert "admin creates"
```

Expected: all desktop and public mobile Blog scenarios pass.

- [ ] **Step 7: Commit the scale correction**

```powershell
git add frontend/e2e/night-runway-blog.spec.js frontend/src/styles/night-blog.css
git commit -m "fix: compact public blog scale"
```

### Task 3: Visual and final verification

**Files:**
- Verify: `frontend/src/styles/night-blog.css`
- Verify: `frontend/e2e/night-runway-blog.spec.js`

**Interfaces:**
- Consumes: production build and mocked Blog API fixtures.
- Produces: visual evidence for desktop and mobile plus a clean verification report.

- [ ] **Step 1: Capture fresh screenshots**

Serve the production build on `http://127.0.0.1:4173`, mock the public Blog API with three articles, and capture:

```text
output/playwright/blog-compact-home-1920.png
output/playwright/blog-compact-archive-1920.png
output/playwright/blog-compact-article-1920.png
output/playwright/blog-compact-archive-430.png
```

- [ ] **Step 2: Inspect each screenshot**

Confirm visually that the archive state/card begins in the initial desktop viewport, the landing section no longer has excessive vertical bands, titles stay within their caps, mobile remains single-column, and no text is clipped.

- [ ] **Step 3: Run fresh final verification**

Run:

```powershell
cd frontend
$env:CI='true'; yarn test --watchAll=false --runInBand
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium
git diff --check -- e2e/night-runway-blog.spec.js src/styles/night-blog.css
```

Expected: unit tests pass, build succeeds, all desktop Blog scenarios pass, and `git diff --check` reports no whitespace errors.
