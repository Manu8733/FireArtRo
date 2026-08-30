# FireArtRo Contact, Navigation, and Ambient Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution only. Do not dispatch subagents because the user requested no subagents.

**Goal:** Remove the interior meteor canvas, hide team identities without breaking the About navigation target, and deliver a compact contact brief with verified cross-route navigation.

**Architecture:** The homepage replaces `HomeTeam` with a dedicated anonymous `HomeAbout` scene at the existing `#intro` anchor. Interior routes stop mounting `GalleryThreadsCanvas`; this makes the canvas and its shared CSS dead code, which are removed. `QuoteForm` keeps its request and prefill logic and receives only semantic grouping markup; `night-contact.css` owns the visual redesign.

**Tech Stack:** React 19, React Router, GSAP, Framer Motion, Lucide, CSS, Playwright.

## Global Constraints

- Preserve exact quote payload fields and package/query prefill behavior.
- Keep the existing `/#acasa`, `#intro`, and `#spectacole` navigation contract.
- Do not show team member names, portraits, cutouts, or interaction controls.
- Do not replace the removed ambient animation with a new moving decoration.
- Keep the form usable at 390px, 768px, and 1440px with no horizontal overflow.

---

### Task 1: Homepage about replacement and navigation contract

**Files:**
- Create: `frontend/src/components/night/HomeAbout.jsx`
- Modify: `frontend/src/components/night/HomeRunway.jsx`
- Modify: `frontend/e2e/night-runway-home.spec.js`
- Test: `frontend/e2e/night-runway-navigation-flow.spec.js`

**Interfaces:**
- Consumes: `HomeRunway` scene ordering and `Navbar` href values from `NAV_LINKS`.
- Produces: `[data-testid='home-about']` at `id='intro'`, with no `[data-testid='home-team']`.

- [ ] **Step 1: Write the failing test**

```js
test("replaces identifiable team content with the anonymous About section", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-team")).toHaveCount(0);
  await expect(page.getByTestId("home-about")).toHaveAttribute("id", "intro");
  await expect(page.getByTestId("home-about").locator("[data-team-person], [data-team-cutout]")).toHaveCount(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-navigation-flow.spec.js --project=desktop-chromium`

Expected: FAIL because the homepage still renders `home-team` and has no `home-about`.

- [ ] **Step 3: Write minimal implementation**

```jsx
<section id="intro" className="fa-about" data-home-scene="about" data-testid="home-about">
  <div className="nr-shell fa-about__inner">
    <p className="fa-kicker">Despre FireArtRo</p>
    <h2>Construim imaginea<br />unui moment care ramane.</h2>
  </div>
</section>
```

Replace `<HomeTeam />` in `HomeRunway` with `<HomeAbout />`. Use existing image data only when a non-person image is needed.

- [ ] **Step 4: Run targeted tests to verify they pass**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-navigation-flow.spec.js e2e/night-runway-home.spec.js --project=desktop-chromium`

Expected: PASS with an accessible `#intro` target and no team content.

### Task 2: Remove the interior ambient meteor field

**Files:**
- Modify: `frontend/src/pages/GalleryPage.jsx`
- Modify: `frontend/src/pages/PackagesPage.jsx`
- Modify: `frontend/src/pages/ContactPage.jsx`
- Modify: `frontend/src/pages/FaqPage.jsx`
- Delete: `frontend/src/components/night/GalleryThreadsCanvas.jsx`
- Delete: `frontend/src/styles/night-ambient-threads.css`
- Modify: `frontend/e2e/shared-ambient-threads.spec.js`

**Interfaces:**
- Consumes: interior page route components.
- Produces: no `[data-testid='ambient-threads']` on gallery, packages, FAQ, or contact.

- [ ] **Step 1: Write a failing absence test**

```js
for (const path of ["/galerie", "/pachete", "/intrebari-frecvente", "/contact"]) {
  test(`${path} has no ambient meteor canvas`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("ambient-threads")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js --project=desktop-chromium`

Expected: FAIL because each route mounts `GalleryThreadsCanvas`.

- [ ] **Step 3: Write minimal implementation**

Delete the `GalleryThreadsCanvas` import and JSX mount from each of the four page components. Delete the component and its stylesheet after confirming no imports remain with:

```powershell
rg -n "GalleryThreadsCanvas|ambient-threads|night-ambient-threads" frontend/src frontend/e2e
```

- [ ] **Step 4: Run the absence and route smoke tests**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/shared-ambient-threads.spec.js e2e/night-runway-global.spec.js --project=desktop-chromium`

Expected: PASS with route content visible and no ambient canvas.

### Task 3: Compact contact brief presentation

**Files:**
- Modify: `frontend/src/components/site/QuoteForm.jsx`
- Modify: `frontend/src/styles/night-contact.css`
- Modify: `frontend/e2e/night-runway-contact.spec.js`

**Interfaces:**
- Consumes: the existing `QuoteForm` state, `validate`, `postQuote`, `readContactPrefill`, and `NightButton` APIs.
- Produces: `.nr-contact-form__group` semantic groups without changing form field IDs or submitted payload.

- [ ] **Step 1: Write the failing visual-structure test**

```js
test("uses a grouped compact event brief without the ambient layer", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("contact-section").locator(".nr-contact-form__group")).toHaveCount(2);
  await expect(page.getByTestId("contact-section").locator(".nr-contact-main__rail")).toBeVisible();
  await expect(page.getByTestId("ambient-threads")).toHaveCount(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-contact.spec.js --project=desktop-chromium`

Expected: FAIL because groups and the contact rail do not exist.

- [ ] **Step 3: Write minimal implementation**

Keep every form control ID and input name stable. Place event type, date, locality, and service in the first field group; place name, phone, and email in the second. Add a short form heading and static status rail. Style only one form surface with concise rules, readable fields, responsive two-column layout, and the existing `NightButton` submit control.

- [ ] **Step 4: Run contact behavior and responsive checks**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-contact.spec.js --project=desktop-chromium --project=mobile-chromium --project=mobile-webkit`

Expected: PASS for validation, payload, package prefill, success/error, visibility, and no horizontal overflow.

### Task 4: Cross-page navigation flow

**Files:**
- Create: `frontend/e2e/night-runway-navigation-flow.spec.js`

**Interfaces:**
- Consumes: `Navbar`, `RouteShutter`, `scrollNavigation`, and the `#intro`/ `#spectacole` anchors.
- Produces: regression coverage for homepage anchors, homepage-to-contact, gallery-to-contact, and logo-to-home flows.

- [ ] **Step 1: Write failing navigation regression tests**

```js
test("navigates between homepage anchors and interior routes from any scroll position", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByTestId("nav-link-intro").click();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("#intro");
  await page.getByTestId("nav-link-contact").click();
  await expect(page).toHaveURL(/\\/contact$/);
  await page.getByTestId("nav-logo").click();
  await expect(page).toHaveURL(/\\/#acasa$/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-navigation-flow.spec.js --project=desktop-chromium`

Expected: FAIL before the anonymous `#intro` target exists.

- [ ] **Step 3: Preserve navigation functions; change only broken targets**

Do not alter `navigateToHref`, `scrollToHash`, or `RouteShutter` unless the regression test identifies a concrete failure. The new `#intro` section must make the current navbar implementation succeed without a special-case route.

- [ ] **Step 4: Run desktop and touch navigation verification**

Run: `PLAYWRIGHT_USE_EXISTING_SERVER=1 npx playwright test e2e/night-runway-navigation-flow.spec.js --project=desktop-chromium --project=mobile-chromium --project=tablet-webkit`

Expected: PASS for About, Services, Contact, Gallery-to-Contact, and logo-to-home paths.

### Task 5: Production verification

**Files:**
- No source files beyond prior tasks.

- [ ] **Step 1: Build the application**

Run: `npm run build`

Expected: exit code 0.

- [ ] **Step 2: Serve fresh build**

Run: `node scripts/serve-build.js`

Expected: HTTP 200 at `http://127.0.0.1:4173/`.

- [ ] **Step 3: Capture browser evidence**

Use Playwright CLI snapshots and screenshots at desktop 1440x900, mobile 390x844, and tablet 768x1024 for `/`, `/contact`, `/galerie`, and `/pachete`.

- [ ] **Step 4: Run whitespace check**

Run: `git diff --check`

Expected: no whitespace errors.

## Plan Self-Review

- Spec coverage: Tasks 1-4 cover hidden people, canvas deletion, compact contact styling, and all requested navigation flows. Task 5 verifies the fresh build and representative frames.
- Placeholder scan: no implementation placeholders or ambiguous behavior remain.
- Interface consistency: `home-about`, `ambient-threads`, `nr-contact-form__group`, and the existing navbar test IDs are used consistently by code and tests.
