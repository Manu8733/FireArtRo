# FireArtRo Content Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace browser-local managed content with a validated, versioned MongoDB draft/publication service consumed by every public page.

**Architecture:** The backend stores one mutable draft, one atomic public snapshot, and immutable publication revisions. React loads public content through a top-level provider with checked-in defaults as a resilient fallback; Admin edits through a separate draft store with optimistic concurrency, debounced autosave, preview, publish, and revision restore.

**Tech Stack:** FastAPI, Pydantic v2, Motor/PyMongo, React 19 Context, Jest, pytest.

## Global Constraints

- Every field change autosaves to the server-side draft after a short debounce.
- Autosave never changes the public site.
- `Publică modificările` atomically promotes the complete valid draft.
- Public pages read only the active publication and refresh/revalidate without a frontend redeploy.
- A stale editor receives `409 Conflict`; last-write-wins is forbidden.
- Checked-in defaults remain a public fallback, not an ongoing publishing store.
- Raw HTML, scripts, secrets, and arbitrary CSS are not managed content.

**Cross-plan order:** Run Tasks 1-3 after the Foundation plan. Run Admin Operations Task 1 next so the checked-in fallback matches the new schema, then return here for Tasks 4-5.

---

## File structure

- `backend/cms_models.py`: authoritative Pydantic content schema and publication DTOs.
- `backend/cms_repository.py`: MongoDB draft/publication/revision persistence.
- `backend/cms_service.py`: bootstrap, optimistic autosave, atomic publish, and restore rules.
- `backend/cms_routes.py`: public and protected CMS endpoints.
- `backend/tests/test_cms_models.py`: schema and cross-field validation.
- `backend/tests/test_cms_service.py`: repository-independent publication behavior.
- `backend/tests/test_cms_routes.py`: HTTP authorization, ETag, conflict, and error contracts.
- `backend/server.py`: CMS service/router wiring and indexes.
- `frontend/src/lib/contentApi.js`: public content requests and payload normalization.
- `frontend/src/lib/contentApi.test.js`: public API behavior.
- `frontend/src/content/ManagedContentProvider.jsx`: one coherent public snapshot.
- `frontend/src/content/managedContentSchema.js`: frontend defensive shape validation and default merge.
- `frontend/src/hooks/useManagedContent.js`: compatibility hook backed by context instead of localStorage.
- `frontend/src/admin/AdminDraftContext.jsx`: server draft state, debounce, conflicts, preview, and publish.
- `frontend/src/admin/AdminPublishDialog.jsx`: change summary and publication confirmation.
- `frontend/src/admin/AdminRevisions.jsx`: revision list and restore action.
- `frontend/src/App.js`: mounts the public provider and Admin providers.

### Task 1: Define the authoritative content schema

**Files:**
- Create: `backend/cms_models.py`
- Create: `backend/tests/test_cms_models.py`

**Interfaces:**
- Consumes: JSON-compatible content submitted by Admin.
- Produces: `SiteContent`, `DraftResponse`, `DraftUpdate`, `PublishRequest`, `PublicationResponse`, `RevisionSummary`, and `RevisionResponse`.

- [ ] **Step 1: Write failing schema tests**

```python
def test_site_content_rejects_duplicate_package_ids(default_content):
    default_content["packages"].append(default_content["packages"][0].copy())
    with pytest.raises(ValidationError, match="packages.*identificatori unici"):
        SiteContent.model_validate(default_content)


def test_site_content_rejects_javascript_links(default_content):
    default_content["socialLinks"][0]["href"] = "javascript:alert(1)"
    with pytest.raises(ValidationError, match="http"):
        SiteContent.model_validate(default_content)
```

Cover required company fields, normalized phone/link fields, package/media/category enums, FAQ non-empty values, maximum lengths, positive retention days, legal text, and duplicate IDs in every collection.

- [ ] **Step 2: Run the schema tests and verify missing model failure**

Run: `python -m pytest backend/tests/test_cms_models.py -q`

Expected: FAIL because `cms_models.py` does not exist.

- [ ] **Step 3: Implement strict reusable field models**

```python
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class SocialLink(StrictModel):
    id: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9-]*$")
    label: str = Field(min_length=1, max_length=80)
    href: HttpUrl
    placeholder: bool = False


class FaqItem(StrictModel):
    id: str = Field(min_length=1, max_length=80)
    q: str = Field(min_length=3, max_length=240)
    a: str = Field(min_length=3, max_length=4000)
```

Implement typed models for company/contact/hours, navigation/footer, homepage sections, media, packages, FAQ, testimonials, partners, review display, contact options, cookies, and three legal documents. Use a `model_validator` on `SiteContent` to enforce unique IDs and referenced-media existence.

- [ ] **Step 4: Define versioned envelopes**

```python
class SiteContent(StrictModel):
    schema_version: Literal[1] = 1
    siteDetails: SiteDetails
    contactSettings: ContactSettings
    businessHours: BusinessHours
    socialLinks: list[SocialLink]
    navigation: NavigationContent
    footer: FooterContent
    homePage: HomePageContent
    galleryPage: InteriorPageContent
    packagesPage: InteriorPageContent
    faqPage: InteriorPageContent
    contactPage: ContactPageContent
    blogPage: InteriorPageContent
    mediaItems: list[MediaItem]
    packages: list[PackageItem]
    faqs: list[FaqItem]
    testimonials: list[TestimonialItem]
    partners: list[PartnerItem]
    reviewSettings: ReviewSettings
    cookieSettings: CookieSettings
    legalPages: LegalPages


class DraftUpdate(StrictModel):
    version: int = Field(ge=0)
    content: SiteContent
```

Set `PublishRequest.summary` to optional text with maximum 240 characters.

- [ ] **Step 5: Run schema tests**

Run: `python -m pytest backend/tests/test_cms_models.py -q`

Expected: PASS.

- [ ] **Step 6: Commit the content contract**

```bash
git add backend/cms_models.py backend/tests/test_cms_models.py
git commit -m "feat: define managed content schema"
```

### Task 2: Implement draft, publication, revision, and bootstrap behavior

**Files:**
- Create: `backend/cms_repository.py`
- Create: `backend/cms_service.py`
- Create: `backend/tests/test_cms_service.py`

**Interfaces:**
- Consumes: `SiteContent`, authenticated Admin identity, expected draft version, and Mongo collections.
- Produces: `CmsService.get_publication()`, `get_or_create_draft()`, `save_draft()`, `publish()`, `list_revisions()`, `get_revision()`, `restore_revision()`, and `bootstrap()`.

- [ ] **Step 1: Write failing service tests against an in-memory repository**

```python
async def test_save_draft_uses_optimistic_version(cms_service, seed_content):
    await cms_service.bootstrap(seed_content, "admin")
    saved = await cms_service.save_draft(seed_content, expected_version=0, admin_id="admin")
    assert saved.version == 1
    with pytest.raises(DraftConflict):
        await cms_service.save_draft(seed_content, expected_version=0, admin_id="admin")


async def test_publish_is_atomic_and_creates_immutable_revision(cms_service, seed_content):
    await cms_service.bootstrap(seed_content, "admin")
    result = await cms_service.publish(expected_version=0, admin_id="admin", summary="Lansare")
    public = await cms_service.get_publication()
    assert public.revision_id == result.revision_id
    assert public.content == seed_content
    assert (await cms_service.get_revision(result.revision_id)).summary == "Lansare"
```

Add tests for idempotent bootstrap, force refusal, publish validation failure preserving the prior public revision, revision ordering, unknown revision, and restore creating a new draft version without publishing.

- [ ] **Step 2: Run service tests and verify missing repository/service failures**

Run: `python -m pytest backend/tests/test_cms_service.py -q`

Expected: FAIL because the CMS repository and service are absent.

- [ ] **Step 3: Implement repository compare-and-swap operations**

```python
async def update_draft(self, content: dict, expected_version: int, admin_id: str) -> dict | None:
    return await self.drafts.find_one_and_update(
        {"id": "primary", "version": expected_version},
        {
            "$set": {"content": content, "updated_at": utc_now(), "updated_by": admin_id},
            "$inc": {"version": 1},
        },
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )
```

Implement immutable revision insert and public `replace_one({"id": "current"}, document, upsert=True)` inside one MongoDB transaction. The same transaction updates the draft's `base_revision_id`, so a process interruption cannot leave a public version without its revision or a falsely synchronized draft.

- [ ] **Step 4: Implement service rules**

```python
async def publish(self, expected_version: int, admin_id: str, summary: str = ""):
    draft = await self.repository.get_draft()
    if not draft or draft["version"] != expected_version:
        raise DraftConflict()
    content = SiteContent.model_validate(draft["content"])
    return await self.repository.publish_transaction(
        content.model_dump(mode="json"), admin_id, summary, expected_version
    )
```

`restore_revision` validates the historical schema, writes it through the same compare-and-swap draft path, and records `base_revision_id` without updating `site_content_publications`.

- [ ] **Step 5: Run service tests**

Run: `python -m pytest backend/tests/test_cms_service.py -q`

Expected: PASS.

- [ ] **Step 6: Commit the CMS domain**

```bash
git add backend/cms_repository.py backend/cms_service.py backend/tests/test_cms_service.py
git commit -m "feat: add versioned content publishing service"
```

### Task 3: Expose public and protected CMS endpoints

**Files:**
- Create: `backend/cms_routes.py`
- Create: `backend/tests/test_cms_routes.py`
- Modify: `backend/server.py`

**Interfaces:**
- Consumes: `CmsService` from Task 2 and `require_admin_session` from the foundation plan.
- Produces: `/api/content` and `/api/admin/content/*` HTTP contracts from the design specification.

- [ ] **Step 1: Write failing route tests**

```python
def test_public_content_supports_etag_revalidation(client, published_content):
    first = client.get("/api/content")
    assert first.status_code == 200
    assert first.headers["cache-control"] == "no-cache, must-revalidate"
    second = client.get("/api/content", headers={"If-None-Match": first.headers["etag"]})
    assert second.status_code == 304
    assert second.content == b""


def test_stale_autosave_returns_409(client, admin_headers, content_payload):
    response = client.put(
        "/api/admin/content/draft",
        json={"version": 0, "content": content_payload},
        headers=admin_headers,
    )
    assert response.status_code == 409
```

Add authorization/CSRF tests for every mutation, validation `422`, publish success, restore-to-draft, revision not-found, and no sensitive fields in public responses.

- [ ] **Step 2: Run route tests and verify 404 responses**

Run: `python -m pytest backend/tests/test_cms_routes.py -q`

Expected: FAIL because the CMS router is not mounted.

- [ ] **Step 3: Implement public ETag behavior**

```python
@router.get("/api/content", response_model=PublicationResponse)
async def get_public_content(request: Request, response: Response):
    publication = await service.get_publication()
    etag = f'"{publication.revision_id}"'
    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag, "Cache-Control": "no-cache, must-revalidate"})
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "no-cache, must-revalidate"
    return publication
```

- [ ] **Step 4: Implement protected draft/publication routes**

Use `Depends(require_admin_session)` on every Admin route. Map `DraftConflict` to Romanian `409`, missing revisions to `404`, and validation failures to FastAPI's structured `422` response. Admin routes explicitly emit `Cache-Control: no-store`.

- [ ] **Step 5: Wire Mongo collections and indexes**

```python
cms_repository = MongoCmsRepository(
    drafts=db.site_content_drafts,
    publications=db.site_content_publications,
    revisions=db.site_content_revisions,
)
cms_service = CmsService(cms_repository)
app.include_router(create_cms_router(cms_service))
```

Create unique indexes on draft/publication `id`, revision `id`, and descending `published_at`.

- [ ] **Step 6: Run all backend tests**

Run: `python -m pytest backend/tests -q`

Expected: PASS.

- [ ] **Step 7: Commit the CMS HTTP API**

```bash
git add backend/cms_routes.py backend/server.py backend/tests/test_cms_routes.py
git commit -m "feat: expose draft and publication API"
```

### Task 4: Load one published snapshot across the public React application

**Files:**
- Create: `frontend/src/lib/contentApi.js`
- Create: `frontend/src/lib/contentApi.test.js`
- Create: `frontend/src/content/managedContentSchema.js`
- Create: `frontend/src/content/managedContentSchema.test.js`
- Create: `frontend/src/content/ManagedContentProvider.jsx`
- Create: `frontend/src/content/ManagedContentProvider.test.jsx`
- Modify: `frontend/src/hooks/useManagedContent.js`
- Modify: `frontend/src/App.js`

**Interfaces:**
- Consumes: `GET /api/content` and checked-in `ADMIN_DEFAULTS`.
- Produces: `useManagedContent(key, fallback)`, `useManagedContentSnapshot()`, and `refreshManagedContent()` backed by React context.

- [ ] **Step 1: Write failing public-client and schema tests**

```javascript
test("loads the same-origin published snapshot", async () => {
  global.fetch = jest.fn().mockResolvedValue(jsonResponse(publication));
  await expect(fetchPublishedContent()).resolves.toEqual(publication);
  expect(global.fetch).toHaveBeenCalledWith("/api/content", expect.objectContaining({
    cache: "no-cache",
  }));
});


test("rejects a partial remote snapshot instead of merging it", () => {
  expect(() => normalizePublishedContent({ siteDetails: {} })).toThrow("Conținut public invalid");
});
```

- [ ] **Step 2: Run focused tests and verify missing modules**

Run: `cd frontend && yarn test --watchAll=false src/lib/contentApi.test.js src/content/managedContentSchema.test.js`

Expected: FAIL because the content modules do not exist.

- [ ] **Step 3: Implement fetch and defensive normalization**

```javascript
export async function fetchPublishedContent({ signal } = {}) {
  const response = await fetch("/api/content", { signal, cache: "no-cache" });
  if (!response.ok) throw new ContentApiError(response.status, "Conținutul public nu a putut fi încărcat.");
  return response.json();
}
```

`normalizePublishedContent` checks schema version, all top-level keys, collection arrays, required strings, unique IDs, and safe `http:`, `https:`, `/`, `tel:`, or `mailto:` URLs. It returns a deep-cloned immutable-compatible object.

- [ ] **Step 4: Implement provider fallback and coherent replacement**

```jsx
const [state, setState] = useState({
  content: ADMIN_DEFAULTS,
  revisionId: "fallback",
  status: "fallback",
});

const refresh = useCallback(async () => {
  try {
    const publication = await fetchPublishedContent();
    setState({
      content: normalizePublishedContent(publication.content),
      revisionId: publication.revision_id,
      status: "ready",
    });
  } catch {
    setState((current) => ({ ...current, status: "fallback" }));
  }
}, []);
```

Mount the provider once above all routes. Do not partially merge a malformed API payload.

- [ ] **Step 5: Convert the compatibility hook**

```javascript
export default function useManagedContent(key, fallback) {
  const { content } = useManagedContentSnapshot();
  return content?.[key] ?? fallback;
}
```

Keep the old localStorage reader exported only for the later authenticated migration tool; remove public event listeners and localStorage writes.

- [ ] **Step 6: Run provider and existing frontend API tests**

Run: `cd frontend && yarn test --watchAll=false src/lib/contentApi.test.js src/content/managedContentSchema.test.js src/content/ManagedContentProvider.test.jsx src/lib/blogApi.test.js src/lib/reviewsApi.test.js`

Expected: PASS.

- [ ] **Step 7: Build and commit the public provider**

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

```bash
git add frontend/src/lib/contentApi.js frontend/src/lib/contentApi.test.js frontend/src/content frontend/src/hooks/useManagedContent.js frontend/src/App.js
git commit -m "feat: load published content across public site"
```

### Task 5: Add Admin draft state, autosave, preview, publish, and revisions

**Files:**
- Create: `frontend/src/admin/AdminDraftContext.jsx`
- Create: `frontend/src/admin/AdminDraftContext.test.jsx`
- Create: `frontend/src/admin/AdminPublishDialog.jsx`
- Create: `frontend/src/admin/AdminPublishDialog.test.jsx`
- Create: `frontend/src/admin/AdminRevisions.jsx`
- Create: `frontend/src/admin/AdminRevisions.test.jsx`
- Modify: `frontend/src/lib/adminApi.js`
- Modify: `frontend/src/pages/AdminPage.jsx`

**Interfaces:**
- Consumes: Task 3 CMS endpoints and Task 4 public-content refresh.
- Produces: `useAdminDraft()` with `draft`, `update`, `status`, `errors`, `publish`, `restoreRevision`, `reloadAfterConflict`, and `previewMode`.

- [ ] **Step 1: Write failing autosave tests using fake timers**

```javascript
test("debounces field edits and never publishes during autosave", async () => {
  jest.useFakeTimers();
  renderDraftProvider({ version: 4 });
  act(() => result.current.update("siteDetails.name", "FireArt România"));
  act(() => jest.advanceTimersByTime(699));
  expect(adminRequest).not.toHaveBeenCalled();
  act(() => jest.advanceTimersByTime(1));
  await waitFor(() => expect(adminRequest).toHaveBeenCalledWith(
    "/api/admin/content/draft",
    expect.objectContaining({ method: "PUT" }),
  ));
  expect(adminRequest).not.toHaveBeenCalledWith(
    "/api/admin/content/publish",
    expect.anything(),
  );
});
```

Add tests for saving/saved/error status, pending-upload publish blocking, `409` conflict preservation, explicit publish, publication failure, and restore-to-draft.

- [ ] **Step 2: Run focused tests and verify missing context failure**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminDraftContext.test.jsx`

Expected: FAIL because `AdminDraftContext.jsx` does not exist.

- [ ] **Step 3: Implement draft loading and 700 ms autosave**

```jsx
useEffect(() => {
  if (!dirty || status === "conflict" || pendingUploads > 0) return undefined;
  const timer = window.setTimeout(() => saveDraft(draft, version), 700);
  return () => window.clearTimeout(timer);
}, [dirty, draft, pendingUploads, saveDraft, status, version]);
```

Only a confirmed API response advances `version` and changes status to `saved`. A failed request keeps `dirty=true`.

- [ ] **Step 4: Implement publish comparison and confirmation**

`AdminPublishDialog` receives the loaded public snapshot and current draft, computes changed top-level modules plus changed collection item counts, validates there are no field errors or pending saves/uploads, accepts an optional 240-character summary, and calls only `POST /api/admin/content/publish`.

After success, set the new revision metadata, mark the draft synchronized, and call `refreshManagedContent()`.

- [ ] **Step 5: Implement revision restore**

`AdminRevisions` lists metadata newest-first, loads details only when requested, and labels the action `Restaurează ca draft`. The action calls the restore endpoint with the current draft version, replaces local draft only after success, and leaves the public revision unchanged.

- [ ] **Step 6: Run Admin state tests and build**

Run: `cd frontend && yarn test --watchAll=false src/admin/AdminDraftContext.test.jsx src/admin/AdminPublishDialog.test.jsx src/admin/AdminRevisions.test.jsx`

Expected: PASS.

Run: `cd frontend && $env:NODE_OPTIONS='--max-old-space-size=8192'; yarn build`

Expected: `Compiled successfully.`

- [ ] **Step 7: Commit the editorial workflow**

```bash
git add frontend/src/admin/AdminDraftContext.jsx frontend/src/admin/AdminDraftContext.test.jsx frontend/src/admin/AdminPublishDialog.jsx frontend/src/admin/AdminPublishDialog.test.jsx frontend/src/admin/AdminRevisions.jsx frontend/src/admin/AdminRevisions.test.jsx frontend/src/lib/adminApi.js frontend/src/pages/AdminPage.jsx
git commit -m "feat: add draft preview and publishing workflow"
```

## Publishing completion gate

This plan is complete only when two editor sessions cannot overwrite each other, autosave never changes public data, one publish changes all public consumers together, refresh immediately observes the new revision, restore creates only a draft, malformed API data leaves the checked-in fallback intact, and all focused/backend regression tests pass.
