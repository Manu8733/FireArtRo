# FireArtRo Admin Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the complete operator-facing Admin workspace: every intended page-content module, dashboard, media library, Blog, quote requests, preview, and revisions.

**Architecture:** The Admin shell is split into focused React components driven by the authenticated draft context. Managed fields remain schema-driven, while Blog, media, quote requests, preview, and revision history use dedicated panels. Vercel Blob client uploads handle large public media without sending video bodies through the Python Function request limit.

**Tech Stack:** React 19, Lucide React, existing FireArtRo CSS system, FastAPI, Motor/PyMongo, Vercel Blob, `@vercel/blob`, Node Vercel Function, Jest, pytest, Playwright.

## Global Constraints

- Owner amendment 2026-09-03: prepare and verify locally only; do not connect or deploy to Vercel or provision Blob yet. Use isolated test providers where a real cloud resource would be required and disclose the remaining platform acceptance checks.

- Preserve the current FireArtRo public visual design; Admin is an operational extension, not a generic dashboard template.
- Typed fields are the primary editor; raw JSON is restricted to validated import/export.
- Every autosave status reflects a confirmed server result.
- Every destructive action names its target and requires confirmation.
- Mobile supports essential editing and publishing without horizontal overflow.
- Review-provider credentials remain server-only and Admin shows status, never values.
- Public media may be served from Vercel Blob; private quote details may not.

**Cross-plan order:** Run Task 1 after Content Publishing Tasks 1-3, then return to Content Publishing Tasks 4-5. Run Tasks 2-7 after the publishing workflow is complete.

---

## File structure

- `frontend/src/admin/adminConfig.js`: complete managed modules and field metadata.
- `frontend/src/data/businessContent.js`: checked-in fallback content extended with page/legal/review settings.
- `frontend/src/pages/*` and `frontend/src/components/night/*`: consume managed page copy instead of editable hard-coded text.
- `frontend/src/admin/AdminLayout.jsx`: Admin navigation and responsive workspace frame.
- `frontend/src/admin/AdminDashboard.jsx`: operational summary and primary actions.
- `frontend/src/admin/AdminContentEditor.jsx`: object/collection module editor.
- `frontend/src/admin/AdminField.jsx`: typed, accessible field renderer.
- `frontend/src/admin/AdminCollectionList.jsx`: search, add, duplicate, reorder, and delete.
- `frontend/src/admin/AdminPreview.jsx`: authenticated draft preview.
- `frontend/src/admin/AdminMediaLibrary.jsx`: uploads, metadata, usage, and deletion.
- `frontend/src/admin/AdminQuotes.jsx`: request inbox and statuses.
- `frontend/src/admin/AdminBlogPanel.jsx`: Blog editor using the global session.
- `frontend/src/admin/AdminIntegrations.jsx`: safe provider/database/storage health.
- `backend/media.py`: media metadata and protected FastAPI operations.
- `backend/integrations.py`: sanitized protected integration status.
- `api/admin/blob-upload.js`: authenticated Vercel Blob client-upload token exchange and completion callback.
- `backend/quotes.py`: quote repository/service/protected routes.
- Focused Jest, pytest, and Playwright tests beside those units.

### Task 1: Make every intended public text/data area manageable

**Files:**
- Modify: `frontend/src/data/businessContent.js`
- Modify: `frontend/src/admin/adminConfig.js`
- Modify: `frontend/src/components/site/Hero.jsx`
- Modify: `frontend/src/components/site/HeroTypingTitle.jsx`
- Modify: `frontend/src/components/night/HomeGallery.jsx`
- Modify: `frontend/src/components/night/HomePackages.jsx`
- Modify: `frontend/src/components/night/HomeAbout.jsx`
- Modify: `frontend/src/components/night/HomePartners.jsx`
- Modify: `frontend/src/components/night/HomeBrief.jsx`
- Modify: `frontend/src/pages/GalleryPage.jsx`
- Modify: `frontend/src/pages/PackagesPage.jsx`
- Modify: `frontend/src/pages/FaqPage.jsx`
- Modify: `frontend/src/components/site/QuoteForm.jsx`
- Modify: `frontend/src/pages/BlogPage.jsx`
- Modify: `frontend/src/pages/LegalPage.jsx`
- Test: `frontend/src/admin/adminConfig.test.js`

**Interfaces:**
- Consumes: the `SiteContent` shape from the content-publishing plan.
- Produces: complete `ADMIN_DEFAULTS`, `ADMIN_MODULES`, and `MODULE_ORDER` entries for `site`, `home`, `galleryPage`, `packagesPage`, `faqPage`, `contactPage`, `blogPage`, `legalPages`, and the existing collections.

- [ ] **Step 1: Write failing coverage tests for every managed public surface**

```javascript
const requiredModules = [
  "siteDetails", "contactSettings", "businessHours", "socialLinks",
  "navigation", "footer",
  "homePage", "galleryPage", "packagesPage", "faqPage", "contactPage",
  "blogPage", "mediaItems", "packages", "faqs", "testimonials",
  "partners", "reviewSettings", "cookieSettings", "legalPages",
];

test.each(requiredModules)("%s has defaults and an editor definition", (key) => {
  expect(ADMIN_DEFAULTS[key]).toBeDefined();
  expect(ADMIN_MODULES[key]).toBeDefined();
  expect(MODULE_ORDER).toContain(key);
});
```

Add assertions that every collection template has a stable ID and that every field key exists in its corresponding default object/item.

- [ ] **Step 2: Run the config test and verify missing modules**

Run: `cd frontend && yarn test --watchAll=false src/admin/adminConfig.test.js`

Expected: FAIL for missing page/legal/review modules.

- [ ] **Step 3: Add explicit fallback page-content objects**

```javascript
export const HOME_PAGE_DEFAULT = {
  hero: {
    eyebrow: "DRONE · ARTIFICII · EFECTE SCENICE",
    titleLead: "Spectacole",
    titleTail: "în lumină.",
    description: "Momente care rămân.",
    primaryCtaLabel: "Cere ofertă",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "Vezi galeria",
    secondaryCtaHref: "/galerie",
  },
  gallery: { eyebrow: "Selecție FireArtRo", title: "Trei momente. O singură noapte.", ctaLabel: "Vezi galeria" },
  packages: { eyebrow: "Pachete FireArtRo", title: "Fiecare noapte cere alt spectacol.", ctaLabel: "Vezi toate pachetele" },
  about: { eyebrow: "Despre FireArtRo", title: "Suntem echipa din spatele spectacolului.", body: [] },
  partners: { eyebrow: "Împreună în producție", title: "Parteneriate care duc ideea până la capăt.", description: "" },
  brief: { eyebrow: "Începem cu reperele", title: "Spune-ne ce pregătești.", description: "" },
};
```

Add equally explicit objects for Gallery, Packages, FAQ, Contact, Blog, reviews, navigation/footer, and legal page sections. Preserve the exact currently approved Romanian copy as fallback; do not invent sample testimonials or articles.

- [ ] **Step 4: Add schema-driven editor definitions**

Use field types `text`, `textarea`, `url`, `select`, `checkbox`, `number`, `date`, `tags`, `lines`, `media`, and nested `sections`. Legal section bodies are arrays of plain-text paragraphs; raw HTML is not exposed.

- [ ] **Step 5: Replace hard-coded editable copy with managed values**

Each listed page/component reads its page object once with `useManagedContent`. Functional route paths, accessible control labels, structural headings, and animation timing remain code-owned.

Example:

```jsx
const homePage = useManagedContent("homePage", HOME_PAGE_DEFAULT);
const copy = homePage.packages;

<p className="fa-kicker">{copy.eyebrow}</p>
<h2>{copy.title}</h2>
```

- [ ] **Step 6: Run config tests and a production build**

Run: `cd frontend && yarn test --watchAll=false src/admin/adminConfig.test.js`

Expected: PASS.

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

- [ ] **Step 7: Commit managed surface coverage**

```bash
git add frontend/src/data/businessContent.js frontend/src/admin/adminConfig.js frontend/src/admin/adminConfig.test.js frontend/src/components frontend/src/pages
git commit -m "feat: expose public content in Admin"
```

### Task 2: Split and rebuild the Admin editing workspace

**Files:**
- Create: `frontend/src/admin/AdminLayout.jsx`
- Create: `frontend/src/admin/AdminDashboard.jsx`
- Create: `frontend/src/admin/AdminContentEditor.jsx`
- Create: `frontend/src/admin/AdminField.jsx`
- Create: `frontend/src/admin/AdminCollectionList.jsx`
- Create: `frontend/src/admin/AdminLayout.test.jsx`
- Create: `frontend/src/admin/AdminContentEditor.test.jsx`
- Modify: `frontend/src/pages/AdminPage.jsx`
- Modify: `frontend/src/admin.css`

**Interfaces:**
- Consumes: `useAdminSession()`, `useAdminDraft()`, `ADMIN_MODULES`, and `MODULE_ORDER`.
- Produces: focused Admin routes/panels selected through URL query `?sectiune=<key>` without losing draft state.

- [ ] **Step 1: Write failing dashboard and editor tests**

```javascript
test("dashboard exposes publication state and the three primary actions", () => {
  renderAdmin({ draftStatus: "saved", unpublishedChanges: 3 });
  expect(screen.getByText("3 modificări nepublicate")).toBeVisible();
  expect(screen.getByRole("button", { name: "Continuă editarea" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Previzualizează" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Publică modificările" })).toBeEnabled();
});
```

Add tests for module navigation, search, add/duplicate/delete confirmation, reorder buttons, field errors, unsaved status, and retaining selection after autosave.

- [ ] **Step 2: Run tests and verify missing components**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminLayout.test.jsx src/admin/AdminContentEditor.test.jsx`

Expected: FAIL because the split Admin components do not exist.

- [ ] **Step 3: Reduce `AdminPage` to orchestration**

```jsx
export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDraftProvider>
        <AdminLayout />
      </AdminDraftProvider>
    </AdminGate>
  );
}
```

Move field rendering, collection mutations, navigation, and dashboard metrics out of the current monolithic page. Keep each component below approximately 300 lines by responsibility rather than splitting arbitrary fragments.

- [ ] **Step 4: Implement deterministic collection commands**

```javascript
const moveItem = (items, index, delta) => {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, order) => ({ ...item, order: order + 1 }));
};
```

Add, duplicate, reorder, and delete operate only through `update(path, value)` from the draft context. Deletion dialogs include the selected item's visible title.

- [ ] **Step 5: Implement operational status and validation navigation**

The header shows `Se salvează`, `Salvat`, `Eroare la salvare`, `Conflict`, or `Offline`. The publication error summary groups errors by module and clicking one focuses the corresponding field.

- [ ] **Step 6: Style desktop, tablet, and mobile Admin layouts**

Use the site's black atmospheric surface, white text, restrained blue focus/publish accent, square-to-subtle-radius controls, and no translucent blue page wash. At widths below 900 px the sidebar becomes an accessible drawer; fields form one column below 620 px.

- [ ] **Step 7: Run component tests and build**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminLayout.test.jsx src/admin/AdminContentEditor.test.jsx`

Expected: PASS.

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

- [ ] **Step 8: Commit the Admin workspace**

```bash
git add frontend/src/admin frontend/src/pages/AdminPage.jsx frontend/src/admin.css
git commit -m "feat: rebuild complete Admin workspace"
```

### Task 3: Add authenticated Vercel Blob media management

**Files:**
- Create: `backend/media.py`
- Create: `backend/tests/test_media.py`
- Create: `api/admin/blob-upload.js`
- Create: `api/lib/admin-session.js`
- Create: `api/lib/mongodb.js`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `api/admin/blob-upload.test.js`
- Modify: `frontend/package.json`
- Modify: `backend/requirements.txt`
- Modify: `backend/server.py`
- Create: `frontend/src/admin/AdminMediaLibrary.jsx`
- Create: `frontend/src/admin/AdminMediaLibrary.test.jsx`
- Create: `frontend/src/lib/mediaApi.js`
- Modify: `vercel.json`

**Interfaces:**
- Consumes: Admin session cookie/CSRF token, `MONGODB_URI`, `DB_NAME`, `ADMIN_SESSION_SECRET`, and `BLOB_READ_WRITE_TOKEN`.
- Produces: protected media list/metadata/delete endpoints plus `/api/admin/blob-upload` for direct browser-to-Blob uploads.

- [ ] **Step 1: Write failing backend media tests**

```python
async def test_referenced_media_cannot_be_deleted(media_service):
    item = await media_service.record_upload(valid_blob(), admin_id="admin")
    await media_service.mark_referenced(item.id, "site-content:revision-1")
    with pytest.raises(MediaInUse):
        await media_service.delete(item.id)
```

Add tests for allowed image/video MIME types, normalized pathnames, maximum image/video sizes, alt-text update, unreferenced deletion, and missing Blob configuration failing closed.

- [ ] **Step 2: Run tests and verify missing media module**

Run: `python -m pytest backend/tests/test_media.py -q`

Expected: FAIL because `backend/media.py` does not exist.

- [ ] **Step 3: Implement metadata and safe deletion**

```python
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_VIDEO_BYTES = 500 * 1024 * 1024


async def delete(self, media_id: str):
    media = await self.repository.get(media_id)
    if not media:
        raise MediaNotFound()
    if media.references:
        raise MediaInUse()
    await self.blob_client.delete(media.url)
    await self.repository.delete(media_id)
```

Use the official `vercel` Python SDK for deletion and small server-side operations. Add `vercel>=0.5,<1` to backend requirements.

- [ ] **Step 4: Write Node upload-handler tests**

Test that the handler rejects missing session cookie, wrong CSRF value in `clientPayload`, unsupported MIME types, oversized declared files, and expired sessions before calling `handleUpload`. Test successful token constraints and completion insertion into `cms_media`.

Create this root package and generate its lockfile with `npm install --package-lock-only`:

```json
{
  "name": "fireartro-vercel-functions",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": { "test:api": "node --test api/admin/blob-upload.test.js" },
  "dependencies": {
    "@vercel/blob": "2.8.0",
    "mongodb": "7.6.0"
  }
}
```

Add `@vercel/blob` version `2.8.0` to `frontend/package.json`. Update Vercel's install command to run locked installs in both roots: `npm ci --ignore-scripts && yarn --cwd frontend install --frozen-lockfile`.

Run: `npm run test:api`

Expected: FAIL because the Node upload handler does not exist.

- [ ] **Step 5: Implement direct client upload token exchange**

```javascript
const result = await handleUpload({
  request,
  body,
  onBeforeGenerateToken: async (pathname, clientPayload) => {
    const payload = JSON.parse(clientPayload || "{}");
    await requireAdminUploadSession(request, payload.csrfToken);
    return {
      allowedContentTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
      maximumSizeInBytes: MAX_VIDEO_BYTES,
      addRandomSuffix: true,
      tokenPayload: JSON.stringify({ mediaId: payload.mediaId, adminId: payload.adminId }),
    };
  },
  onUploadCompleted: async ({ blob, tokenPayload }) => {
    await mediaCollection().insertOne(toMediaDocument(blob, JSON.parse(tokenPayload)));
  },
});
```

`requireAdminUploadSession` hashes the opaque cookie and CSRF value with the same HMAC-SHA256 contract as Python, loads the unexpired non-revoked MongoDB session, and verifies same origin.

- [ ] **Step 6: Implement the React media library**

Use `upload()` from `@vercel/blob/client` with `handleUploadUrl: "/api/admin/blob-upload"`, `multipart: true` for video, and `onUploadProgress`. The `/api/admin` path ensures the strict Admin session cookie is sent. Client-side image optimization remains, but the server/Blob constraints remain authoritative.

After completion, poll `GET /api/admin/media/{media_id}` until the completion callback record exists, then attach that media ID through the draft context. Keep the old value on every upload failure.

- [ ] **Step 7: Extend CSP only to the connected Blob hostname**

Generate `VERCEL_BLOB_MEDIA_ORIGIN` during deployment setup and render that exact origin in `img-src` and `media-src`. Do not allow wildcard `https:` for media.

- [ ] **Step 8: Run media tests and commit**

Run: `python -m pytest backend/tests/test_media.py -q`

Expected: PASS.

Run: `npm run test:api`

Expected: PASS.

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminMediaLibrary.test.jsx`

Expected: PASS.

```bash
git add backend/media.py backend/tests/test_media.py backend/server.py backend/requirements.txt api package.json package-lock.json frontend/package.json frontend/yarn.lock frontend/src/admin/AdminMediaLibrary.jsx frontend/src/admin/AdminMediaLibrary.test.jsx frontend/src/lib/mediaApi.js vercel.json
git commit -m "feat: manage Admin media with Vercel Blob"
```

### Task 4: Move Blog operations onto the global Admin session

**Files:**
- Modify: `backend/blog.py`
- Modify: `backend/server.py`
- Modify: `backend/tests/test_blog.py`
- Modify: `frontend/src/lib/blogApi.js`
- Modify: `frontend/src/lib/blogApi.test.js`
- Modify: `frontend/src/admin/AdminBlogPanel.jsx`
- Modify: `frontend/src/admin/AdminMediaLibrary.jsx`

**Interfaces:**
- Consumes: `require_admin_session`, Admin `request()`, and the existing Blog article model.
- Produces: session-protected Blog mutations with no `X-Admin-Key` prompt or browser credential state, plus Vercel Blob-backed cover selection.

- [ ] **Step 1: Rewrite failing authorization tests around session and CSRF**

```python
def test_blog_create_requires_session_and_csrf(client, valid_create):
    assert client.post("/api/admin/blog/posts", json=valid_create).status_code == 401
    assert client.post(
        "/api/admin/blog/posts",
        json=valid_create,
        cookies=admin_cookie,
    ).status_code == 403
```

Keep all existing publication, slug, validation, media, and public-route tests.

- [ ] **Step 2: Run Blog tests and verify old-key behavior fails the new contract**

Run: `python -m pytest backend/tests/test_blog.py -q`

Expected: FAIL because Blog still accepts `X-Admin-Key`.

- [ ] **Step 3: Replace Admin-key dependencies**

Pass `require_admin_session` into `create_blog_router` and attach it with `Depends` to protected handlers. Remove `admin_key` comparisons and `X-Admin-Key` from CORS configuration after quotes also migrate.

- [ ] **Step 4: Simplify the frontend Blog API and panel**

```javascript
export const listAdminPosts = (request) => request("/api/admin/blog/posts");
export const saveAdminPost = (request, article) => request(
  article.id ? `/api/admin/blog/posts/${article.id}` : "/api/admin/blog/posts",
  { method: article.id ? "PUT" : "POST", body: JSON.stringify(articlePayload(article)) },
);
```

Delete the key-entry form/state and the old Admin GridFS upload action. The cover picker selects a `cms_media` image and saves its identifier and alternative text. Preserve the public GridFS media route temporarily for existing covers; add a protected `Migrează coperțile vechi` action that copies each referenced GridFS image to Blob, updates the article only after a successful copy, and deletes the GridFS object only after the article update is acknowledged.

- [ ] **Step 5: Run Blog backend/frontend tests**

Run: `python -m pytest backend/tests/test_blog.py -q`

Expected: PASS.

Run: `cd frontend && yarn test --watchAll=false src/lib/blogApi.test.js src/admin/AdminBlogPanel.test.jsx`

Expected: PASS.

- [ ] **Step 6: Commit session-based Blog administration**

```bash
git add backend/blog.py backend/server.py backend/tests/test_blog.py frontend/src/lib/blogApi.js frontend/src/lib/blogApi.test.js frontend/src/admin/AdminBlogPanel.jsx frontend/src/admin/AdminBlogPanel.test.jsx
git commit -m "feat: unify Blog Admin authentication"
```

### Task 5: Add the quote-request inbox

**Files:**
- Create: `backend/quotes.py`
- Modify: `backend/server.py`
- Modify: `backend/tests/test_quotes.py`
- Create: `frontend/src/lib/quotesApi.js`
- Create: `frontend/src/lib/quotesApi.test.js`
- Create: `frontend/src/admin/AdminQuotes.jsx`
- Create: `frontend/src/admin/AdminQuotes.test.jsx`

**Interfaces:**
- Consumes: existing public `QuoteCreate`, MongoDB `quotes`, and global Admin session.
- Produces: protected list/detail/status/note API and a responsive Admin inbox.

- [ ] **Step 1: Add failing quote service/route tests**

```python
def test_admin_can_filter_and_update_quote(client, admin_headers, seeded_quotes):
    listed = client.get("/api/admin/quotes?status=new&q=cluj", headers=admin_headers)
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()["items"]] == [seeded_quotes[0]["id"]]
    updated = client.patch(
        f"/api/admin/quotes/{seeded_quotes[0]['id']}",
        json={"status": "contacted", "internal_note": "Sunat la 14:30"},
        headers=admin_headers,
    )
    assert updated.json()["status"] == "contacted"
```

Add invalid-status, note-length, not-found, authorization, pagination, and public-data-separation tests.

- [ ] **Step 2: Run quote tests and verify missing protected API**

Run: `python -m pytest backend/tests/test_quotes.py -q`

Expected: FAIL because protected quote status/note endpoints do not exist.

- [ ] **Step 3: Extract quote repository/service/router**

```python
class QuoteAdminUpdate(StrictModel):
    status: Literal["new", "contacted", "qualified", "closed", "spam"]
    internal_note: str = Field(default="", max_length=4000)
```

Preserve public validation and honeypot behavior. Replace the process-local rate window with a `quote_rate_limits` MongoDB collection using an atomic increment and TTL expiry so limits hold across Vercel Function instances. Protected responses may contain customer details; public responses and logs may not.

- [ ] **Step 4: Build the responsive inbox**

The list shows created time, name, event date/type, locality, selected package, and status. Search and status filters are URL-backed. Selecting a row opens detail, direct phone/email actions, private note, and status control. No external message is sent automatically.

- [ ] **Step 5: Run quote tests and commit**

Run: `python -m pytest backend/tests/test_quotes.py -q`

Expected: PASS.

Run: `cd frontend && yarn test --watchAll=false src/lib/quotesApi.test.js src/admin/AdminQuotes.test.jsx`

Expected: PASS.

```bash
git add backend/quotes.py backend/server.py backend/tests/test_quotes.py frontend/src/lib/quotesApi.js frontend/src/lib/quotesApi.test.js frontend/src/admin/AdminQuotes.jsx frontend/src/admin/AdminQuotes.test.jsx
git commit -m "feat: add Admin quote inbox"
```

### Task 6: Show integration health without exposing credentials

**Files:**
- Create: `backend/integrations.py`
- Create: `backend/tests/test_integrations.py`
- Modify: `backend/server.py`
- Create: `frontend/src/lib/integrationsApi.js`
- Create: `frontend/src/lib/integrationsApi.test.js`
- Create: `frontend/src/admin/AdminIntegrations.jsx`
- Create: `frontend/src/admin/AdminIntegrations.test.jsx`
- Modify: `frontend/src/admin/AdminDashboard.jsx`

**Interfaces:**
- Consumes: server environment, review service cached health, MongoDB ping, and Blob configuration.
- Produces: protected `GET /api/admin/integrations` with booleans/timestamps only and a read-only Admin status panel.

- [ ] **Step 1: Write failing secret-redaction tests**

```python
def test_integration_status_never_returns_secret_values(client, admin_headers, monkeypatch):
    monkeypatch.setenv("GOOGLE_PLACES_API_KEY", "google-secret-value")
    monkeypatch.setenv("META_PAGE_ACCESS_TOKEN", "meta-secret-value")
    response = client.get("/api/admin/integrations", headers=admin_headers)
    body = response.text
    assert response.status_code == 200
    assert "google-secret-value" not in body
    assert "meta-secret-value" not in body
    assert response.json()["google"]["configured"] is True
    assert response.json()["facebook"]["configured"] is True
```

Add tests for anonymous rejection, unconfigured providers, database ping failure, missing Blob token, and refresh throttling.

- [ ] **Step 2: Run tests and verify missing endpoint**

Run: `python -m pytest backend/tests/test_integrations.py -q`

Expected: FAIL with `404`.

- [ ] **Step 3: Implement safe integration summaries**

```python
class IntegrationState(BaseModel):
    configured: bool
    healthy: bool | None = None
    checked_at: datetime | None = None
    message: str = ""


class IntegrationsResponse(BaseModel):
    database: IntegrationState
    blob: IntegrationState
    google: IntegrationState
    facebook: IntegrationState
```

The endpoint reports presence and a sanitized health result only. Error messages come from an allowlisted Romanian mapping and never concatenate provider responses, URLs containing tokens, or exception strings.

- [ ] **Step 4: Implement the Admin panel and dashboard cards**

Render `Configurat`, `Necesită configurare`, `Funcțional`, or `Eroare temporară` with text and icon. `Verifică din nou` performs one protected refresh and is disabled during the request. There are no credential inputs.

- [ ] **Step 5: Run integration tests and commit**

Run: `python -m pytest backend/tests/test_integrations.py -q`

Expected: PASS.

Run: `cd frontend && yarn test --watchAll=false src/lib/integrationsApi.test.js src/admin/AdminIntegrations.test.jsx`

Expected: PASS.

```bash
git add backend/integrations.py backend/tests/test_integrations.py backend/server.py frontend/src/lib/integrationsApi.js frontend/src/lib/integrationsApi.test.js frontend/src/admin/AdminIntegrations.jsx frontend/src/admin/AdminIntegrations.test.jsx frontend/src/admin/AdminDashboard.jsx
git commit -m "feat: expose safe Admin integration health"
```

### Task 7: Add authenticated preview and complete accessibility/responsive QA

**Files:**
- Create: `frontend/src/admin/AdminPreview.jsx`
- Create: `frontend/src/admin/AdminPreview.test.jsx`
- Modify: `frontend/src/content/ManagedContentProvider.jsx`
- Modify: `frontend/src/pages/AdminPage.jsx`
- Modify: `frontend/src/admin.css`
- Create: `frontend/e2e/admin-cms.spec.js`

**Interfaces:**
- Consumes: current in-memory draft, public route components, and Admin layout.
- Produces: non-shareable draft preview plus keyboard/mobile acceptance coverage.

- [ ] **Step 1: Write failing preview isolation tests**

```javascript
test("preview renders the draft while a normal route keeps published content", () => {
  render(<ManagedContentProvider><TestSurface /></ManagedContentProvider>, {
    wrapper: draftPreviewWrapper({ siteDetails: { name: "Draft name" } }),
  });
  expect(screen.getByText("Draft name")).toBeVisible();
  expect(fetchPublishedContent).not.toHaveBeenCalled();
});
```

Add tests for closing preview, viewport controls, `noindex` meta, session expiry, and no draft token in the URL.

- [ ] **Step 2: Implement context-scoped preview**

`AdminPreview` renders a same-page modal containing the real route tree wrapped in a preview content provider whose value is the current draft. It does not serialize the draft into query parameters, localStorage, sessionStorage, or an unauthenticated endpoint.

- [ ] **Step 3: Add Playwright Admin workflow**

```javascript
test("draft autosaves, preview changes, and publish updates the public page", async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole("link", { name: "Pagina principală" }).click();
  await page.getByLabel("Titlu secțiune Pachete").fill("Titlu editorial test");
  await expect(page.getByText("Salvat")).toBeVisible();
  await page.getByRole("button", { name: "Previzualizează" }).click();
  await expect(page.getByText("Titlu editorial test")).toBeVisible();
  await page.getByRole("button", { name: "Publică modificările" }).click();
  await confirmPublication(page);
  await page.goto("/");
  await expect(page.getByText("Titlu editorial test")).toBeVisible();
});
```

Use a dedicated preview database and restore the baseline revision in `afterEach`.

- [ ] **Step 4: Add keyboard and overflow acceptance checks**

Run the Admin at 1440×900, 1024×1366, 834×1194, 430×932, and 390×844. Assert `document.documentElement.scrollWidth <= window.innerWidth`, keyboard access to all primary actions, dialog focus trap/return, textual status announcements, and reorder buttons independent of drag-and-drop.

- [ ] **Step 5: Run focused and E2E tests**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminPreview.test.jsx`

Expected: PASS.

Run: `cd frontend && npx playwright test e2e/admin-cms.spec.js --project=desktop-chromium --project=tablet-webkit --project=mobile-chromium`

Expected: PASS.

- [ ] **Step 6: Commit preview and Admin acceptance coverage**

```bash
git add frontend/src/admin/AdminPreview.jsx frontend/src/admin/AdminPreview.test.jsx frontend/src/content/ManagedContentProvider.jsx frontend/src/pages/AdminPage.jsx frontend/src/admin.css frontend/e2e/admin-cms.spec.js
git commit -m "feat: add secure Admin preview and QA"
```

## Operations completion gate

This plan is complete only when every listed content surface is editable, Admin credentials are absent from Blog/UI storage, Blob upload progress and safe deletion work, quote requests can be triaged, preview never exposes draft data, and desktop/tablet/mobile accessibility checks pass.
