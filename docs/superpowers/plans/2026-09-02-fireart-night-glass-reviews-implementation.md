# FireArtRo Night Glass and Verified Reviews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the approved homepage/contact/footer presentation and add credential-gated Google and Facebook review rails that never expose provider secrets.

**Architecture:** Keep shared page placement in `PageEnd`, move review acquisition behind a small FastAPI provider gateway, and let React render only normalized provider data. Apply the existing Night Runway tokens and NightButton component to the approved visual changes without changing form behavior or legal-page business data.

**Tech Stack:** React 19, React Router, CSS, FastAPI, Pydantic, httpx, pytest, Playwright.

## Global Constraints

- Execute inline in the current worktree; do not dispatch subagents.
- Keep Google and Meta credentials server-side and out of all `REACT_APP_*` variables.
- Render no review placeholder, empty section, fabricated name, fabricated rating, or raw provider response.
- Keep review rails immediately before the shared footer on every public route and absent from `/admin`.
- Google moves left-to-right; Facebook moves right-to-left; reduced-motion users receive a static scrollable row.
- Use the homepage Gallery atmosphere as the darkness reference for Packages and About.
- Preserve all form fields, validation, submission behavior, copy, routes, and legal-page business data.
- Remove the company name/CUI string from the footer presentation only.

---

### Task 1: Add the server-side review provider gateway

**Files:**
- Create: `backend/reviews.py`
- Create: `backend/tests/test_reviews.py`
- Modify: `backend/server.py`
- Modify: `backend/.env.example`

**Interfaces:**
- Produces: `ReviewsService.get_snapshot() -> dict` returning `{ "providers": [{ "id", "href", "reviews" }] }`.
- Produces: `create_reviews_router(service: ReviewsService) -> APIRouter` exposing `GET /api/reviews`.
- Review fields: `id`, `provider`, `author`, `text`, optional `rating`, optional `published_at`, optional `url`.

- [ ] **Step 1: Write provider contract tests**

Cover empty credentials, partial credentials, normalization, one-provider failure isolation, secret omission, and cache reuse with a fake async HTTP client. Assert that empty or failed providers produce an empty `providers` array and status remains successful.

```python
async def test_missing_credentials_hide_all_providers():
    service = ReviewsService(env={}, http_client=FakeClient({}))
    assert await service.get_snapshot() == {"providers": []}

async def test_google_failure_does_not_hide_facebook():
    service = ReviewsService(env=FACEBOOK_ENV | GOOGLE_ENV, http_client=fake_provider_client())
    snapshot = await service.get_snapshot()
    assert [provider["id"] for provider in snapshot["providers"]] == ["facebook"]
    assert "access_token" not in str(snapshot)
```

- [ ] **Step 2: Run the focused backend test and confirm the missing module failure**

Run: `python -m pytest backend/tests/test_reviews.py -q`

Expected: collection fails because `backend.reviews` does not exist.

- [ ] **Step 3: Implement provider adapters and bounded cache**

Create a focused module with these boundaries:

```python
class ReviewsService:
    def __init__(self, env, http_client=None, ttl_seconds=900, now=monotonic): ...
    async def get_snapshot(self) -> dict: ...

async def fetch_google_reviews(client, api_key: str, place_id: str) -> dict | None: ...
async def fetch_facebook_reviews(client, page_id: str, access_token: str, api_version: str) -> dict | None: ...
def create_reviews_router(service: ReviewsService) -> APIRouter: ...
```

Use a five-second provider timeout. Query Google Place Details with an API-key header and a narrow field mask. Query Meta through a versioned Graph URL, with the version read from `META_GRAPH_API_VERSION` and a conservative default isolated in this module. Normalize text and omit entries without real review text. Catch provider-specific `httpx` and payload errors without exposing them to the browser.

- [ ] **Step 4: Wire the route and document private environment variables**

Instantiate one `ReviewsService(os.environ)` in `backend/server.py`, include its router, and add only these server variables to `backend/.env.example`:

```dotenv
GOOGLE_PLACES_API_KEY=
GOOGLE_PLACE_ID=
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
META_GRAPH_API_VERSION=
```

- [ ] **Step 5: Run backend tests and commit**

Run: `python -m pytest backend/tests/test_reviews.py -q`

Expected: all review gateway tests pass.

Commit: `feat: add secure reviews gateway`

---

### Task 2: Replace browser-managed reviews with API-backed rendering

**Files:**
- Create: `frontend/src/lib/reviewsApi.js`
- Create: `frontend/src/lib/reviewsApi.test.js`
- Modify: `frontend/src/components/night/HomeReviews.jsx`
- Modify: `frontend/e2e/night-runway-home-refactor.spec.js`

**Interfaces:**
- Consumes: `GET /api/reviews` from Task 1.
- Produces: `getPublicReviews({ signal } = {}) -> Promise<{providers: Provider[]}>`.
- `HomeReviews` renders zero or one shared section and zero or more provider lanes.

- [ ] **Step 1: Add frontend API contract tests**

Assert URL construction from `REACT_APP_BACKEND_URL`, valid provider filtering, abort propagation, and graceful empty fallback on malformed data.

```javascript
test("returns only providers containing usable reviews", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ providers: [{ id: "google", href: "https://maps.google.com/", reviews: [{ id: "g1", text: "Excelent", author: "Ana" }] }] }),
  });
  await expect(getPublicReviews()).resolves.toHaveLength(1);
});
```

- [ ] **Step 2: Run the focused test and confirm the missing module failure**

Run: `yarn test --watchAll=false src/lib/reviewsApi.test.js`

Expected: FAIL because `reviewsApi.js` does not exist.

- [ ] **Step 3: Implement the API reader and component loading state**

Use `AbortController` cleanup in `HomeReviews`. Render nothing while loading, on network failure, or when `providers` is empty. Remove `useManagedContent`, `TESTIMONIAL_ITEMS`, and social-link-derived provider visibility from this component.

Build each lane from backend data and preserve the approved mapping:

```javascript
const DIRECTIONS = {
  google: "left-to-right",
  facebook: "right-to-left",
};
```

Generate two identical, assistive-technology-safe track groups from real provider reviews so the loop has no hard reset.

- [ ] **Step 4: Update the page-placement contract**

Keep `PageEnd.jsx` unchanged. Update the existing E2E fixture to intercept `/api/reviews`, then assert no section for `{ providers: [] }`, correct directions for connected data, and immediate sibling placement before `footer.fa-footer` on every public route.

- [ ] **Step 5: Run focused frontend tests and commit**

Run: `yarn test --watchAll=false src/lib/reviewsApi.test.js`

Expected: PASS.

Commit: `feat: load verified reviews from backend`

---

### Task 3: Restyle and harden the two review marquees

**Files:**
- Modify: `frontend/src/components/night/HomeReviews.jsx`
- Modify: `frontend/src/styles/night-reviews.css`

**Interfaces:**
- Consumes: normalized provider lanes from Task 2.
- Produces: `.fa-page-reviews__group` pairs whose width defines a seamless marquee distance.

- [ ] **Step 1: Add semantic provider/card metadata**

Render a compact provider label, optional rating, review text, author, optional date, and provider link. Mark the duplicated group `aria-hidden="true"`; do not duplicate focusable links inside the hidden group.

- [ ] **Step 2: Implement Night Glass card styling**

Use square editorial cards with fluid width `clamp(17rem, 26vw, 25rem)`, translucent obsidian fill, low-contrast blue-gray border, and a restrained top highlight. Keep the moving viewport full-width while aligning the heading and provider links to `var(--nr-layout-max)`.

- [ ] **Step 3: Implement stable opposite-direction motion**

Animate one group-width plus the inter-group gap, pause on `:hover` and `:focus-within`, and expose horizontal touch scrolling when reduced motion is requested.

```css
.fa-page-reviews__lane[data-direction="right-to-left"] .fa-page-reviews__track {
  animation-name: pageReviewRailLeft;
}
.fa-page-reviews__lane[data-direction="left-to-right"] .fa-page-reviews__track {
  animation-name: pageReviewRailRight;
}
```

- [ ] **Step 4: Commit**

Commit: `style: align review rails with night glass system`

---

### Task 4: Unify Gallery, Packages, and About atmosphere

**Files:**
- Modify: `frontend/src/styles/night-home-film.css`
- Modify: `frontend/e2e/night-runway-atmosphere.spec.js`

**Interfaces:**
- Produces: shared CSS custom properties for atmospheric image, opacity, blur, saturation, brightness, and overlay darkness.

- [ ] **Step 1: Define the shared atmospheric values on `.fa-film`**

Use one image URL and one desktop/mobile treatment for `.fa-work__sticky::before`, `.fa-packages::before`, and `.fa-about__image`. Move the Gallery darkness values into reusable custom properties instead of copying three independent declarations.

- [ ] **Step 2: Remove the About-only color cast**

Replace the current blue/red full-section shade with a restrained local text-readability gradient. Match Packages and About base/overlay darkness to Gallery and keep the existing absence of a separator line.

- [ ] **Step 3: Update the atmosphere contract and commit**

Assert identical computed image opacity/filter across all three sections at desktop and mobile widths.

Commit: `style: unify homepage atmosphere depth`

---

### Task 5: Apply Night Glass to Contact and direct actions

**Files:**
- Modify: `frontend/src/components/site/QuoteForm.jsx`
- Modify: `frontend/src/styles/night-contact.css`
- Modify: `frontend/e2e/night-runway-global.spec.js`

**Interfaces:**
- Consumes: `NightButton` with `variant="secondary"` and `showArrow={false}`.
- Produces: three `.nr-contact-direct__action` links with existing `tel:`, `mailto:`, and WhatsApp destinations.

- [ ] **Step 1: Reuse NightButton for direct-contact actions**

Replace only the three raw visual action wrappers. Keep their current URLs, accessible labels, icons, target behavior, and conditional rendering.

```jsx
<NightButton href={`tel:${phoneHref}`} variant="secondary" showArrow={false} className="nr-contact-direct__action">
  <Phone aria-hidden="true" /><span>Telefon</span>
</NightButton>
```

- [ ] **Step 2: Restyle the form shell and controls**

Use a translucent obsidian surface, clipped corners matching `.nr-button`, one quiet top rail, low-contrast group dividers, and translucent inset fields. Keep blue emphasis for hover/focus, red for validation, and all current responsive grid breakpoints.

- [ ] **Step 3: Protect behavior and commit**

Assert every field id/name, error focus order, optional details control, consent, and submit button still exist. Assert all direct links carry both `.nr-button` and `.nr-button--secondary`.

Commit: `style: refine contact with night glass controls`

---

### Task 6: Simplify and balance the footer legal row

**Files:**
- Modify: `frontend/src/components/site/Footer.jsx`
- Modify: `frontend/src/styles/night-footer.css`
- Modify: `frontend/e2e/night-runway-global.spec.js`

**Interfaces:**
- Produces: a two-part `.fa-footer__bottom` containing copyright and `.fa-footer__legal` only.

- [ ] **Step 1: Remove the visible company/CUI node**

Delete only this footer node:

```jsx
<span>{siteDetails.legalName} · CUI {siteDetails.taxId}</span>
```

Keep managed company data and legal-page copy unchanged.

- [ ] **Step 2: Rebalance desktop and mobile layout**

Use `grid-template-columns: auto minmax(0, 1fr)` on desktop, align legal links to the end, and stack copyright above a left-aligned wrapping legal group on narrow screens. Preserve minimum 44px touch targets on mobile.

- [ ] **Step 3: Add the footer contract and commit**

Assert the company/CUI string is absent from the footer, copyright remains, all five legal links remain, and Setari cookies remains a button.

Commit: `style: simplify footer legal row`

---

### Task 7: Focused integration verification

**Files:**
- Modify only files implicated by a failing focused check.

**Interfaces:**
- Consumes: all tasks above.
- Produces: a clean public build with no credential leakage or horizontal overflow in the changed surfaces.

- [ ] **Step 1: Run focused backend and frontend unit tests**

Run:

```powershell
python -m pytest backend/tests/test_reviews.py -q
Set-Location frontend
yarn test --watchAll=false src/lib/reviewsApi.test.js
```

- [ ] **Step 2: Run the three affected browser specifications**

Run:

```powershell
yarn playwright test e2e/night-runway-home-refactor.spec.js e2e/night-runway-atmosphere.spec.js e2e/night-runway-global.spec.js
```

- [ ] **Step 3: Build production assets and scan for secrets**

Run:

```powershell
$env:NODE_OPTIONS='--max-old-space-size=8192'
yarn build
rg -n "META_PAGE_ACCESS_TOKEN|GOOGLE_PLACES_API_KEY" build
```

Expected: build succeeds and the secret-name scan returns no bundled credential values.

- [ ] **Step 4: Verify repository state and push**

Run `git status --short`, review the final diff, commit any focused corrections, and push the completed branch to `origin/main` only after all changed behavior is accounted for.
