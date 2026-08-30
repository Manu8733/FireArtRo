# FireArtRo Public Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real MongoDB-backed FireArtRo Blog that is edited from Admin, shows the three newest published articles near the landing-page footer, exposes archive and detail routes, and contains no invented initial content.

**Architecture:** A focused FastAPI Blog module owns validation, protected mutations, public reads, stable slugs, and GridFS covers. A small frontend API client feeds public Blog components and a dedicated remote Admin panel; existing browser-local Admin modules keep their current storage contract. Public pages reuse the Night Runway shell, metadata hook, connected reviews, and footer.

**Tech Stack:** Python 3, FastAPI 0.110.1, Pydantic 2, Motor/MongoDB GridFS, React 19, React Router 7, CRA/Craco/Jest, Playwright 1.62, CSS.

## Global Constraints

- The initial Blog contains no demonstration or seeded articles, invented company news, authors, quotes, or images.
- New articles always start as `draft`; publishing requires a later explicit status update.
- Article limits are exact: title 160 characters, excerpt 320, body 50,000, category 80.
- Normal API request limit remains 32 KB; Blog article writes use 128 KB; Blog media upload uses 6 MB.
- Keep `ADMIN_API_KEY` server-side. Never place it in `REACT_APP_*`, URLs, MongoDB article documents, exports, or local storage.
- The Blog Admin key exists only in React memory and is lost on refresh.
- Public reads return only `published` articles, newest `published_at` first.
- Slugs normalize Romanian diacritics, are unique, and never change after creation.
- Raw article HTML is never interpreted. Blank-line blocks become paragraphs and single newlines become `<br>` elements through React text rendering.
- Missing optional data renders no empty label and no decorative image substitute.
- The landing Blog section hides on a confirmed empty response and on request failure.
- Preserve every unrelated modified or untracked workspace file and hunk.
- Before each commit, inspect `git status --short` and `git diff`. Use selective staging for files that were already modified; never stage unrelated existing changes. Leave a pre-existing untracked target unstaged if its old content cannot be separated safely.
- Build the CRA app before serving `build` for Playwright checks.
- Acceptance viewports: 1440×900, 430×932, 844×390, and 568×320, with no horizontal overflow.

---

## File map

### Backend

- Create `backend/blog.py`: Blog models, repository protocol/adapter, service, route factory, Admin authorization, and GridFS adapter.
- Create `backend/tests/test_blog.py`: in-memory repository/media doubles and behavior tests for public reads, protected CRUD, publication, slugs, media, and request contracts.
- Modify `backend/server.py`: construct Blog repository/media store, include the Blog router, add path-specific size limits, and permit `PUT`/`DELETE` CORS methods.
- Modify `backend/requirements.txt`: pin `httpx==0.27.2` for FastAPI `TestClient` compatibility.

### Frontend shared Blog layer

- Create `frontend/src/lib/blogApi.js`: public/Admin request functions, media upload, URL construction, and typed error normalization.
- Create `frontend/src/lib/blogApi.test.js`: Jest tests for public limits, Admin headers, failures, and body paragraph parsing.
- Create `frontend/src/components/blog/BlogCard.jsx`: one semantic reusable public article card.
- Create `frontend/src/components/blog/BlogBody.jsx`: safe paragraph/line-break renderer.
- Create `frontend/src/components/blog/HomeBlog.jsx`: three-item landing preview that hides on empty/error.
- Create `frontend/src/pages/BlogPage.jsx`: complete public archive with loading, empty, error, and retry states.
- Create `frontend/src/pages/BlogArticlePage.jsx`: detail/not-found view and `BlogPosting` metadata.
- Create `frontend/src/styles/night-blog.css`: public Blog visual system and responsive layouts.

### Frontend integration and Admin

- Create `frontend/src/admin/AdminBlogPanel.jsx`: remote article authentication, list, draft editor, publish flow, upload, save, and delete.
- Modify `frontend/src/App.js`: lazy Blog archive and detail routes.
- Modify `frontend/src/components/site/PageEnd.jsx`: insert `HomeBlog` before reviews only when requested by its caller.
- Modify `frontend/src/pages/Home.jsx`: request the Blog-enabled page ending.
- Modify `frontend/src/components/site/Footer.jsx`: add `Blog` to `Explorează`.
- Modify `frontend/src/admin/adminConfig.js`: register the remote Blog module.
- Modify `frontend/src/pages/AdminPage.jsx`: mount the remote Blog panel and keep local save controls out of that module.
- Modify `frontend/src/admin.css`: responsive Blog Admin panel styles.
- Create `frontend/e2e/night-runway-blog.spec.js`: public and Admin user-flow acceptance coverage.

---

### Task 1: Backend public Blog contract

**Files:**
- Create: `backend/blog.py`
- Create: `backend/tests/test_blog.py`
- Modify: `backend/requirements.txt`

**Interfaces:**
- Consumes: FastAPI `APIRouter`, Pydantic 2, and an injected repository with async methods.
- Produces: `BlogArticleCreate`, `BlogArticleUpdate`, `BlogArticleResponse`, `BlogSummaryResponse`, `BlogRepository`, `MongoBlogRepository`, `BlogService`, `slugify_ro(title)`, and `create_blog_router(service, admin_key)`.

- [ ] **Step 1: Add the FastAPI test-client pin**

Append this exact dependency to `backend/requirements.txt`:

```text
httpx==0.27.2
```

Install backend requirements in the active Python environment:

```powershell
python -m pip install -r backend/requirements.txt
```

- [ ] **Step 2: Write failing public-service and public-route tests**

Create `backend/tests/test_blog.py` with an in-memory repository that implements the production protocol. The fixtures use complete article documents so later fields cannot silently disappear:

```python
import asyncio
from copy import deepcopy
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.testclient import TestClient

from blog import BlogService, create_blog_router, slugify_ro


def article(article_id, slug, status, published_at, title):
    now = "2026-08-30T10:00:00+00:00"
    return {
        "id": article_id,
        "slug": slug,
        "title": title,
        "excerpt": f"Rezumat {title}",
        "body": f"Primul paragraf {title}.\n\nAl doilea paragraf.",
        "category": "Noutăți",
        "cover_media_id": "",
        "cover_alt": "",
        "status": status,
        "created_at": now,
        "updated_at": now,
        "published_at": published_at,
    }


class FakeBlogRepository:
    def __init__(self, posts=None):
        self.posts = [deepcopy(item) for item in (posts or [])]

    async def list_published(self, limit=None):
        items = [item for item in self.posts if item["status"] == "published"]
        items.sort(key=lambda item: item["published_at"] or "", reverse=True)
        return deepcopy(items[:limit] if limit else items)

    async def get_published_by_slug(self, slug):
        return deepcopy(next((item for item in self.posts if item["slug"] == slug and item["status"] == "published"), None))

    async def list_all(self):
        return deepcopy(sorted(self.posts, key=lambda item: item["updated_at"], reverse=True))

    async def get_by_id(self, article_id):
        return deepcopy(next((item for item in self.posts if item["id"] == article_id), None))

    async def slug_exists(self, slug):
        return any(item["slug"] == slug for item in self.posts)

    async def insert(self, document):
        self.posts.append(deepcopy(document))
        return deepcopy(document)

    async def replace(self, article_id, document):
        index = next((index for index, item in enumerate(self.posts) if item["id"] == article_id), -1)
        if index < 0:
            return None
        self.posts[index] = deepcopy(document)
        return deepcopy(document)

    async def delete(self, article_id):
        item = await self.get_by_id(article_id)
        self.posts = [post for post in self.posts if post["id"] != article_id]
        return item


class FakeMediaStore:
    async def save(self, filename, content_type, data):
        return "507f1f77bcf86cd799439011"

    async def open(self, media_id):
        return None

    async def delete(self, media_id):
        return None


def public_client(posts):
    app = FastAPI()
    service = BlogService(FakeBlogRepository(posts), FakeMediaStore())
    app.include_router(create_blog_router(service, "test-admin-key"))
    return TestClient(app)


def test_slugify_ro_normalizes_diacritics_and_symbols():
    assert slugify_ro("Știri: Artificii în Țară") == "stiri-artificii-in-tara"


def test_public_list_returns_only_published_newest_first_and_honors_limit():
    posts = [
        article("1", "vechi", "published", "2026-08-10T09:00:00+00:00", "Vechi"),
        article("2", "draft", "draft", None, "Draft"),
        article("3", "nou", "published", "2026-08-30T09:00:00+00:00", "Nou"),
        article("4", "mijloc", "published", "2026-08-20T09:00:00+00:00", "Mijloc"),
    ]
    response = public_client(posts).get("/api/blog/posts?limit=2")
    assert response.status_code == 200
    assert [item["slug"] for item in response.json()] == ["nou", "mijloc"]
    assert all(item["slug"] != "draft" for item in response.json())


def test_public_detail_hides_drafts_as_not_found():
    posts = [article("2", "draft", "draft", None, "Draft")]
    response = public_client(posts).get("/api/blog/posts/draft")
    assert response.status_code == 404
    assert response.json() == {"detail": "Articolul nu a fost găsit."}


def test_public_list_rejects_out_of_range_limit():
    response = public_client([]).get("/api/blog/posts?limit=101")
    assert response.status_code == 422
```

- [ ] **Step 3: Run the public tests and verify the intended failure**

Run from `backend`:

```powershell
python -m pytest tests/test_blog.py -q
```

Expected: collection fails because `blog.py` and its exported Blog interfaces do not exist.

- [ ] **Step 4: Implement models, slug normalization, repository, service public reads, and public routes**

Create `backend/blog.py`. Use these exact public interfaces and constraints:

```python
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional, Protocol

from fastapi import APIRouter, Header, HTTPException, Query, UploadFile
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def utc_now():
    return datetime.now(timezone.utc).isoformat()


def slugify_ro(value):
    translated = str(value or "").translate(str.maketrans({
        "ă": "a", "â": "a", "î": "i", "ș": "s", "ş": "s", "ț": "t", "ţ": "t",
        "Ă": "A", "Â": "A", "Î": "I", "Ș": "S", "Ş": "S", "Ț": "T", "Ţ": "T",
    }))
    ascii_value = unicodedata.normalize("NFKD", translated).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-") or "articol"


class BlogArticleBase(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    excerpt: str = Field(default="", max_length=320)
    body: str = Field(min_length=1, max_length=50_000)
    category: str = Field(default="", max_length=80)
    cover_media_id: str = ""
    cover_alt: str = Field(default="", max_length=240)

    @field_validator("cover_media_id")
    @classmethod
    def validate_cover_media_id(cls, value):
        value = str(value or "").strip().lower()
        if value and not re.fullmatch(r"[0-9a-f]{24}", value):
            raise ValueError("Identificatorul imaginii nu este valid.")
        return value

    @model_validator(mode="after")
    def normalize_and_validate(self):
        self.title = " ".join(self.title.strip().split())
        self.excerpt = " ".join(self.excerpt.strip().split())
        self.category = " ".join(self.category.strip().split())
        self.body = self.body.strip()
        self.cover_alt = " ".join(self.cover_alt.strip().split())
        if not self.title or not self.body:
            raise ValueError("Titlul și conținutul sunt obligatorii.")
        if self.cover_media_id and not self.cover_alt:
            raise ValueError("Textul alternativ este obligatoriu pentru imagine.")
        return self


class BlogArticleCreate(BlogArticleBase):
    pass


class BlogArticleUpdate(BlogArticleBase):
    status: Literal["draft", "published"]


class BlogArticleResponse(BlogArticleBase):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    status: Literal["draft", "published"]
    created_at: str
    updated_at: str
    published_at: Optional[str] = None


class BlogSummaryResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    title: str
    excerpt: str = ""
    category: str = ""
    cover_media_id: str = ""
    cover_alt: str = ""
    published_at: str
    updated_at: str


class BlogRepository(Protocol):
    async def list_published(self, limit=None):
        raise NotImplementedError

    async def get_published_by_slug(self, slug):
        raise NotImplementedError

    async def list_all(self):
        raise NotImplementedError

    async def get_by_id(self, article_id):
        raise NotImplementedError

    async def slug_exists(self, slug):
        raise NotImplementedError

    async def insert(self, document):
        raise NotImplementedError

    async def replace(self, article_id, document):
        raise NotImplementedError

    async def delete(self, article_id):
        raise NotImplementedError


class MongoBlogRepository:
    def __init__(self, collection):
        self.collection = collection

    async def list_published(self, limit=None):
        cursor = self.collection.find({"status": "published"}, {"_id": 0, "body": 0}).sort("published_at", -1)
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(length=limit or 10_000)

    async def get_published_by_slug(self, slug):
        return await self.collection.find_one({"slug": slug, "status": "published"}, {"_id": 0})

    async def list_all(self):
        return await self.collection.find({}, {"_id": 0}).sort("updated_at", -1).to_list(length=10_000)

    async def get_by_id(self, article_id):
        return await self.collection.find_one({"id": article_id}, {"_id": 0})

    async def slug_exists(self, slug):
        return await self.collection.count_documents({"slug": slug}, limit=1) > 0

    async def insert(self, document):
        await self.collection.insert_one(dict(document))
        return document

    async def replace(self, article_id, document):
        result = await self.collection.replace_one({"id": article_id}, dict(document))
        return document if result.matched_count else None

    async def delete(self, article_id):
        existing = await self.get_by_id(article_id)
        if existing:
            await self.collection.delete_one({"id": article_id})
        return existing


class BlogService:
    def __init__(self, repository, media_store):
        self.repository = repository
        self.media_store = media_store

    async def list_public(self, limit=None):
        return await self.repository.list_published(limit)

    async def get_public(self, slug):
        item = await self.repository.get_published_by_slug(slug)
        if not item:
            raise HTTPException(status_code=404, detail="Articolul nu a fost găsit.")
        return item
```

Add the public routes inside `create_blog_router(service, admin_key)`:

```python
def create_blog_router(service, admin_key):
    router = APIRouter(prefix="/api")

    @router.get("/blog/posts", response_model=list[BlogSummaryResponse])
    async def list_public_posts(limit: Optional[int] = Query(default=None, ge=1, le=100)):
        return await service.list_public(limit)

    @router.get("/blog/posts/{slug}", response_model=BlogArticleResponse)
    async def get_public_post(slug: str):
        return await service.get_public(slugify_ro(slug))

    return router
```

- [ ] **Step 5: Run the public Blog tests until green**

```powershell
cd backend
python -m pytest tests/test_blog.py -q
```

Expected: public tests pass with no warnings introduced by Blog code.

- [ ] **Step 6: Commit only the clean Task 1 files**

```powershell
git status --short
git diff -- backend/blog.py backend/tests/test_blog.py backend/requirements.txt
git add -- backend/blog.py backend/tests/test_blog.py backend/requirements.txt
git diff --cached --check
git commit -m "feat: add public blog API contract"
```

### Task 2: Protected article creation, publication, update, and deletion

**Files:**
- Modify: `backend/blog.py`
- Modify: `backend/tests/test_blog.py`

**Interfaces:**
- Consumes: `BlogService`, `BlogArticleCreate`, `BlogArticleUpdate`, `BlogRepository`, and `create_blog_router` from Task 1.
- Produces: `BlogService.list_admin()`, `create_article(payload)`, `update_article(id, payload)`, `delete_article(id)`, plus authenticated `/api/admin/blog/posts` routes.

- [ ] **Step 1: Write failing Admin behavior tests**

Append tests that catch unauthorized access, accidental immediate publication, unstable slugs, publication-date resets, and missing deletion:

```python
def admin_client(posts=None):
    repository = FakeBlogRepository(posts)
    media_store = FakeMediaStore()
    service = BlogService(repository, media_store)
    app = FastAPI()
    app.include_router(create_blog_router(service, "test-admin-key"))
    return TestClient(app), repository, media_store


def valid_create(**overrides):
    payload = {
        "title": "Știri din culise",
        "excerpt": "Un rezumat administrat.",
        "body": "Primul paragraf.\n\nAl doilea paragraf.",
        "category": "Noutăți",
        "cover_media_id": "",
        "cover_alt": "",
    }
    payload.update(overrides)
    return payload


def test_admin_routes_reject_missing_or_wrong_key():
    client, _, _ = admin_client()
    assert client.get("/api/admin/blog/posts").status_code == 401
    assert client.get("/api/admin/blog/posts", headers={"X-Admin-Key": "wrong"}).status_code == 401


def test_create_always_starts_as_draft_and_duplicate_title_gets_unique_slug():
    client, _, _ = admin_client()
    headers = {"X-Admin-Key": "test-admin-key"}
    first = client.post("/api/admin/blog/posts", json=valid_create(), headers=headers)
    second = client.post("/api/admin/blog/posts", json=valid_create(), headers=headers)
    assert first.status_code == 201
    assert first.json()["status"] == "draft"
    assert first.json()["published_at"] is None
    assert first.json()["slug"] == "stiri-din-culise"
    assert second.json()["slug"] == "stiri-din-culise-2"


def test_publish_sets_date_once_and_title_edit_keeps_slug_and_publication_date():
    client, _, _ = admin_client()
    headers = {"X-Admin-Key": "test-admin-key"}
    created = client.post("/api/admin/blog/posts", json=valid_create(), headers=headers).json()
    publish_payload = {**valid_create(), "status": "published"}
    published = client.put(f"/api/admin/blog/posts/{created['id']}", json=publish_payload, headers=headers).json()
    first_published_at = published["published_at"]
    edited = client.put(
        f"/api/admin/blog/posts/{created['id']}",
        json={**publish_payload, "title": "Titlu schimbat"},
        headers=headers,
    ).json()
    assert edited["slug"] == created["slug"]
    assert edited["published_at"] == first_published_at


def test_delete_removes_article_from_admin_and_public_lists():
    client, _, _ = admin_client()
    headers = {"X-Admin-Key": "test-admin-key"}
    created = client.post("/api/admin/blog/posts", json=valid_create(), headers=headers).json()
    response = client.delete(f"/api/admin/blog/posts/{created['id']}", headers=headers)
    assert response.status_code == 204
    assert client.get("/api/admin/blog/posts", headers=headers).json() == []
    assert client.get("/api/blog/posts").json() == []


def test_article_rejects_malformed_cover_identifier():
    client, _, _ = admin_client()
    response = client.post(
        "/api/admin/blog/posts",
        json=valid_create(cover_media_id="not-an-object-id", cover_alt="Copertă"),
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert response.status_code == 422


def test_admin_update_rejects_malformed_article_identifier():
    client, _, _ = admin_client()
    response = client.put(
        "/api/admin/blog/posts/not-a-uuid",
        json={**valid_create(), "status": "draft"},
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert response.status_code == 422
```

- [ ] **Step 2: Run the Admin tests and verify failure for missing routes**

```powershell
cd backend
python -m pytest tests/test_blog.py -q
```

Expected: the new Admin tests fail with `404` because protected routes do not exist.

- [ ] **Step 3: Implement Admin authorization and service mutations**

Inside `BlogService`, add stable unique slug generation and server-owned timestamps:

```python
    async def _unique_slug(self, title):
        base = slugify_ro(title)
        candidate = base
        suffix = 2
        while await self.repository.slug_exists(candidate):
            candidate = f"{base}-{suffix}"
            suffix += 1
        return candidate

    async def list_admin(self):
        return await self.repository.list_all()

    async def create_article(self, payload):
        now = utc_now()
        document = {
            **payload.model_dump(),
            "id": str(uuid.uuid4()),
            "slug": await self._unique_slug(payload.title),
            "status": "draft",
            "created_at": now,
            "updated_at": now,
            "published_at": None,
        }
        return await self.repository.insert(document)

    async def update_article(self, article_id, payload):
        current = await self.repository.get_by_id(article_id)
        if not current:
            raise HTTPException(status_code=404, detail="Articolul nu a fost găsit.")
        published_at = current.get("published_at")
        if payload.status == "published" and not published_at:
            published_at = utc_now()
        updated = {
            **payload.model_dump(),
            "id": current["id"],
            "slug": current["slug"],
            "created_at": current["created_at"],
            "updated_at": utc_now(),
            "published_at": published_at,
        }
        saved = await self.repository.replace(article_id, updated)
        old_cover = current.get("cover_media_id")
        if saved and old_cover and old_cover != updated.get("cover_media_id"):
            await self.media_store.delete(old_cover)
        return saved

    async def delete_article(self, article_id):
        deleted = await self.repository.delete(article_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Articolul nu a fost găsit.")
        if deleted.get("cover_media_id"):
            await self.media_store.delete(deleted["cover_media_id"])
```

Inside `create_blog_router`, add the exact dependency and protected routes below:

```python
from fastapi import Depends

    def require_admin_key(x_admin_key: Optional[str] = Header(default=None)):
        if not admin_key or x_admin_key != admin_key:
            raise HTTPException(status_code=401, detail="Acces neautorizat.")

    @router.get("/admin/blog/posts", response_model=list[BlogArticleResponse])
    async def list_admin_posts(_: None = Depends(require_admin_key)):
        return await service.list_admin()

    @router.post("/admin/blog/posts", response_model=BlogArticleResponse, status_code=201)
    async def create_admin_post(payload: BlogArticleCreate, _: None = Depends(require_admin_key)):
        return await service.create_article(payload)

    @router.put("/admin/blog/posts/{article_id}", response_model=BlogArticleResponse)
    async def update_admin_post(article_id: uuid.UUID, payload: BlogArticleUpdate, _: None = Depends(require_admin_key)):
        return await service.update_article(str(article_id), payload)

    @router.delete("/admin/blog/posts/{article_id}", status_code=204)
    async def delete_admin_post(article_id: uuid.UUID, _: None = Depends(require_admin_key)):
        await service.delete_article(str(article_id))
```

- [ ] **Step 4: Run all Blog backend tests until green**

```powershell
cd backend
python -m pytest tests/test_blog.py -q
```

Expected: authorization, creation, stable slug, publish, edit, and delete tests all pass.

- [ ] **Step 5: Commit Task 2 changes**

```powershell
git status --short
git diff -- backend/blog.py backend/tests/test_blog.py
git add -- backend/blog.py backend/tests/test_blog.py
git diff --cached --check
git commit -m "feat: add protected blog publishing"
```

### Task 3: GridFS covers and backend integration

**Files:**
- Modify: `backend/blog.py`
- Modify: `backend/tests/test_blog.py`
- Modify: `backend/server.py`

**Interfaces:**
- Consumes: `BlogService.media_store` and protected-route dependency from Task 2.
- Produces: `GridFsBlogMediaStore`, `POST /api/admin/blog/media`, `GET /api/blog/media/{media_id}`, and a fully mounted Blog router in `server.py`.

- [ ] **Step 1: Extend the fake media store and write failing media/lifecycle tests**

Make `FakeMediaStore` retain bytes and deleted IDs, then add these tests:

```python
class FakeMediaStore:
    def __init__(self):
        self.items = {}
        self.deleted = []

    async def save(self, filename, content_type, data):
        media_id = "507f1f77bcf86cd799439011"
        self.items[media_id] = {"filename": filename, "content_type": content_type, "data": data}
        return media_id

    async def open(self, media_id):
        return deepcopy(self.items.get(media_id))

    async def delete(self, media_id):
        self.deleted.append(media_id)
        self.items.pop(media_id, None)


def test_media_upload_requires_admin_and_public_read_returns_exact_bytes():
    client, _, _ = admin_client()
    webp_bytes = b"RIFF\x04\x00\x00\x00WEBP"
    files = {"file": ("coperta.webp", webp_bytes, "image/webp")}
    assert client.post("/api/admin/blog/media", files=files).status_code == 401
    uploaded = client.post(
        "/api/admin/blog/media",
        files=files,
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert uploaded.status_code == 201
    media_id = uploaded.json()["id"]
    public = client.get(f"/api/blog/media/{media_id}")
    assert public.status_code == 200
    assert public.content == webp_bytes
    assert public.headers["content-type"].startswith("image/webp")


def test_media_upload_rejects_non_image_content_type():
    client, _, _ = admin_client()
    response = client.post(
        "/api/admin/blog/media",
        files={"file": ("payload.txt", b"not-an-image", "text/plain")},
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert response.status_code == 415


def test_media_upload_rejects_false_image_mime_type():
    client, _, _ = admin_client()
    response = client.post(
        "/api/admin/blog/media",
        files={"file": ("payload.webp", b"not-an-image", "image/webp")},
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert response.status_code == 415


def test_replacing_cover_deletes_old_media_only_after_article_save():
    old_cover = "507f1f77bcf86cd799439012"
    article_id = "6f69e970-5d5d-46fc-8593-62c00bf46101"
    posts = [article(article_id, "articol", "draft", None, "Articol") | {"cover_media_id": old_cover, "cover_alt": "Copertă veche"}]
    client, _, media_store = admin_client(posts)
    response = client.put(
        f"/api/admin/blog/posts/{article_id}",
        json={**valid_create(), "status": "draft", "cover_media_id": "507f1f77bcf86cd799439013", "cover_alt": "Copertă nouă"},
        headers={"X-Admin-Key": "test-admin-key"},
    )
    assert response.status_code == 200
    assert media_store.deleted == [old_cover]
```

- [ ] **Step 2: Run the media tests and verify `404` failures**

```powershell
cd backend
python -m pytest tests/test_blog.py -q
```

Expected: upload/public media tests fail because media routes do not exist.

- [ ] **Step 3: Implement the GridFS adapter and media routes**

Add imports and the production media adapter in `backend/blog.py`:

```python
from bson import ObjectId
from bson.errors import InvalidId
from fastapi.responses import Response
from gridfs.errors import NoFile


ALLOWED_BLOG_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/avif"}
MAX_BLOG_MEDIA_BYTES = 6 * 1024 * 1024


def image_signature_matches(content_type, data):
    signatures = {
        "image/jpeg": data.startswith(b"\xff\xd8\xff"),
        "image/png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        "image/webp": len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP",
        "image/avif": len(data) >= 12 and data[4:12] in {b"ftypavif", b"ftypavis"},
    }
    return signatures.get(content_type, False)


class GridFsBlogMediaStore:
    def __init__(self, bucket):
        self.bucket = bucket

    async def save(self, filename, content_type, data):
        media_id = await self.bucket.upload_from_stream(
            filename,
            data,
            metadata={"content_type": content_type},
        )
        return str(media_id)

    async def open(self, media_id):
        try:
            stream = await self.bucket.open_download_stream(ObjectId(media_id))
        except (InvalidId, NoFile):
            return None
        return {
            "filename": stream.filename,
            "content_type": (stream.metadata or {}).get("content_type", "application/octet-stream"),
            "data": await stream.read(),
        }

    async def delete(self, media_id):
        try:
            await self.bucket.delete(ObjectId(media_id))
        except (InvalidId, NoFile):
            return
```

Use explicit validation in the routes:

```python
    @router.post("/admin/blog/media", status_code=201)
    async def upload_blog_media(file: UploadFile, _: None = Depends(require_admin_key)):
        if file.content_type not in ALLOWED_BLOG_IMAGE_TYPES:
            raise HTTPException(status_code=415, detail="Fișierul trebuie să fie o imagine JPG, PNG, WebP sau AVIF.")
        data = await file.read(MAX_BLOG_MEDIA_BYTES + 1)
        if len(data) > MAX_BLOG_MEDIA_BYTES:
            raise HTTPException(status_code=413, detail="Imaginea depășește 6 MB.")
        if not image_signature_matches(file.content_type, data):
            raise HTTPException(status_code=415, detail="Conținutul fișierului nu corespunde formatului imaginii.")
        media_id = await service.media_store.save(file.filename or "coperta.webp", file.content_type, data)
        return {"id": media_id, "url": f"/api/blog/media/{media_id}"}

    @router.get("/blog/media/{media_id}")
    async def read_blog_media(media_id: str):
        media = await service.media_store.open(media_id)
        if not media:
            raise HTTPException(status_code=404, detail="Imaginea nu a fost găsită.")
        return Response(
            content=media["data"],
            media_type=media["content_type"],
            headers={"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"},
        )
```

- [ ] **Step 4: Mount Blog infrastructure and implement exact request/CORS limits**

Modify `backend/server.py`:

```python
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from blog import BlogService, GridFsBlogMediaStore, MongoBlogRepository, create_blog_router


blog_repository = MongoBlogRepository(db.blog_posts)
blog_media_store = GridFsBlogMediaStore(AsyncIOMotorGridFSBucket(db, bucket_name="blog_media"))
blog_service = BlogService(blog_repository, blog_media_store)
app.include_router(create_blog_router(blog_service, os.environ.get("ADMIN_API_KEY", "")))
```

Place the Blog router include after the base `/api` router include. Add startup indexes so MongoDB enforces slug uniqueness and accelerates public ordering:

```python
@app.on_event("startup")
async def ensure_blog_indexes():
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index([("status", 1), ("published_at", -1)])
```

Replace the single 32 KB middleware threshold with:

```python
    path = request.url.path
    if path == "/api/admin/blog/media":
        max_request_bytes = 6 * 1024 * 1024
    elif path.startswith("/api/admin/blog/posts") and request.method in {"POST", "PUT"}:
        max_request_bytes = 128 * 1024
    else:
        max_request_bytes = 32_768

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_request_bytes:
                return JSONResponse(status_code=413, content={"detail": "Cererea este prea mare."})
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Content-Length invalid."})
```

Change CORS methods to:

```python
allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
```

Replace the unconditional middleware `Cache-Control: no-store` assignment with:

```python
    if not request.url.path.startswith("/api/blog/media/"):
        response.headers["Cache-Control"] = "no-store"
```

- [ ] **Step 5: Run backend Blog and quote regression tests**

```powershell
cd backend
python -m pytest tests/test_blog.py tests/test_quotes.py -q
```

Expected: Blog unit/API tests pass. If quote contract tests require a live backend, run `tests/test_blog.py` locally and record the exact external-service limitation for `test_quotes.py`; do not misreport it as passing.

- [ ] **Step 6: Commit Task 3 backend changes**

```powershell
git status --short
git diff -- backend/blog.py backend/tests/test_blog.py backend/server.py
git add -- backend/blog.py backend/tests/test_blog.py backend/server.py
git diff --cached --check
git commit -m "feat: add blog cover media storage"
```

### Task 4: Frontend Blog API and safe text formatting

**Files:**
- Create: `frontend/src/lib/blogApi.js`
- Create: `frontend/src/lib/blogApi.test.js`
- Create: `frontend/src/components/blog/BlogBody.jsx`

**Interfaces:**
- Consumes: `REACT_APP_BACKEND_URL`, public/Admin endpoint contracts from Tasks 1–3.
- Produces: `listPublishedPosts({limit})`, `getPublishedPost(slug)`, `listAdminPosts(key)`, `createAdminPost(key, payload)`, `updateAdminPost(key, id, payload)`, `deleteAdminPost(key, id)`, `uploadAdminCover(key, preparedImage)`, `blogMediaUrl(id)`, `splitBlogBody(text)`, and `<BlogBody body />`.

- [ ] **Step 1: Write failing Jest tests for request boundaries and text safety**

Create `frontend/src/lib/blogApi.test.js`:

```javascript
import {
  BlogApiError,
  listPublishedPosts,
  listAdminPosts,
  splitBlogBody,
} from "./blogApi";

const fullPost = {
  id: "post-1",
  slug: "primul-articol",
  title: "Primul articol",
  excerpt: "Rezumat",
  body: "Paragraf unu.\nLinia doi.\n\n<script>alert(1)</script>",
  category: "Noutăți",
  cover_media_id: "",
  cover_alt: "",
  status: "published",
  created_at: "2026-08-30T10:00:00+00:00",
  updated_at: "2026-08-30T10:00:00+00:00",
  published_at: "2026-08-30T10:00:00+00:00",
};

afterEach(() => {
  jest.restoreAllMocks();
});

test("public preview requests exactly limit three and returns complete API data", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: true,
    json: async () => [fullPost],
  });
  await expect(listPublishedPosts({ limit: 3 })).resolves.toEqual([fullPost]);
  expect(global.fetch).toHaveBeenCalledWith("/api/blog/posts?limit=3", expect.objectContaining({ signal: undefined }));
});

test("admin listing sends the supplied key only in X-Admin-Key", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => [] });
  await listAdminPosts("secret-session-key");
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/admin/blog/posts",
    expect.objectContaining({ headers: { "X-Admin-Key": "secret-session-key" } }),
  );
  expect(JSON.stringify(global.fetch.mock.calls)).not.toContain("REACT_APP_ADMIN");
});

test("failed requests expose status and Romanian detail", async () => {
  jest.spyOn(global, "fetch").mockResolvedValue({
    ok: false,
    status: 401,
    json: async () => ({ detail: "Acces neautorizat." }),
  });
  await expect(listAdminPosts("wrong")).rejects.toEqual(
    expect.objectContaining({ name: "BlogApiError", status: 401, message: "Acces neautorizat." }),
  );
});

test("body splitting preserves text and separates blank-line paragraphs", () => {
  expect(splitBlogBody(fullPost.body)).toEqual([
    ["Paragraf unu.", "Linia doi."],
    ["<script>alert(1)</script>"],
  ]);
});
```

- [ ] **Step 2: Run the focused Jest test and verify module-not-found failure**

```powershell
cd frontend
$env:CI='true'; yarn test --watchAll=false --runTestsByPath src/lib/blogApi.test.js
```

Expected: FAIL because `blogApi.js` is absent.

- [ ] **Step 3: Implement the API client and body splitter**

Create `frontend/src/lib/blogApi.js` with explicit request behavior:

```javascript
const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND_URL}/api`;

export class BlogApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "BlogApiError";
    this.status = status;
  }
}

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new BlogApiError(payload.detail || "Conținutul nu a putut fi încărcat.", response.status);
  }
  return payload;
}

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  if (response.status === 204) return null;
  return readJson(response);
}

const adminHeaders = (key, json = false) => ({
  "X-Admin-Key": key,
  ...(json ? { "Content-Type": "application/json" } : {}),
});

export function listPublishedPosts({ limit, signal } = {}) {
  const query = Number.isInteger(limit) ? `?limit=${limit}` : "";
  return jsonRequest(`/blog/posts${query}`, { signal });
}

export function getPublishedPost(slug, { signal } = {}) {
  return jsonRequest(`/blog/posts/${encodeURIComponent(slug)}`, { signal });
}

export function listAdminPosts(key) {
  return jsonRequest("/admin/blog/posts", { headers: adminHeaders(key) });
}

export function createAdminPost(key, payload) {
  return jsonRequest("/admin/blog/posts", {
    method: "POST",
    headers: adminHeaders(key, true),
    body: JSON.stringify(payload),
  });
}

export function updateAdminPost(key, id, payload) {
  return jsonRequest(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: adminHeaders(key, true),
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPost(key, id) {
  return jsonRequest(`/admin/blog/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(key),
  });
}

export async function uploadAdminCover(key, preparedImage) {
  const blob = await fetch(preparedImage.dataUrl).then((response) => response.blob());
  const form = new FormData();
  const baseName = String(preparedImage.originalName || "coperta").replace(/\.[^.]+$/, "");
  form.append("file", blob, `${baseName}.webp`);
  return jsonRequest("/admin/blog/media", {
    method: "POST",
    headers: adminHeaders(key),
    body: form,
  });
}

export function blogMediaUrl(mediaId) {
  return mediaId ? `${API}/blog/media/${encodeURIComponent(mediaId)}` : "";
}

export function splitBlogBody(value) {
  return String(value || "")
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.split(/\r?\n/))
    .filter((lines) => lines.some((line) => line.trim()));
}
```

Create `frontend/src/components/blog/BlogBody.jsx` using only text nodes:

```jsx
import { Fragment } from "react";
import { splitBlogBody } from "@/lib/blogApi";

export default function BlogBody({ body }) {
  return (
    <div className="fa-blog-body" data-testid="blog-body">
      {splitBlogBody(body).map((lines, paragraphIndex) => (
        <p key={`${paragraphIndex}-${lines[0]}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={`${lineIndex}-${line}`}>
              {lineIndex > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run Jest until green**

```powershell
cd frontend
$env:CI='true'; yarn test --watchAll=false --runTestsByPath src/lib/blogApi.test.js
```

Expected: all Blog API/format tests pass.

- [ ] **Step 5: Commit the focused frontend Blog client**

```powershell
git status --short
git diff -- frontend/src/lib/blogApi.js frontend/src/lib/blogApi.test.js frontend/src/components/blog/BlogBody.jsx
git add -- frontend/src/lib/blogApi.js frontend/src/lib/blogApi.test.js frontend/src/components/blog/BlogBody.jsx
git diff --cached --check
git commit -m "feat: add blog frontend data client"
```

### Task 5: Public Blog preview, archive, detail, routing, and footer discovery

**Files:**
- Create: `frontend/src/components/blog/BlogCard.jsx`
- Create: `frontend/src/components/blog/HomeBlog.jsx`
- Create: `frontend/src/pages/BlogPage.jsx`
- Create: `frontend/src/pages/BlogArticlePage.jsx`
- Create: `frontend/e2e/night-runway-blog.spec.js`
- Modify: `frontend/src/App.js`
- Modify: `frontend/src/components/site/PageEnd.jsx`
- Modify: `frontend/src/pages/Home.jsx`
- Modify: `frontend/src/components/site/Footer.jsx`

**Interfaces:**
- Consumes: Task 4 API functions, `BlogBody`, existing `Navbar`, `PageEnd`, `ScrollProgress`, `usePageMeta`, `NightButton`, and Night Runway shell.
- Produces: `<BlogCard article variant />`, `<HomeBlog />`, `<BlogPage />`, `<BlogArticlePage />`, `/blog`, `/blog/:slug`, landing CTA, and footer discovery.

- [ ] **Step 1: Write failing public Playwright flows with real components and API-boundary fixtures**

Create `frontend/e2e/night-runway-blog.spec.js` with complete API fixtures and route interception at the network boundary:

```javascript
const { test, expect } = require("@playwright/test");

const posts = [
  {
    id: "post-3", slug: "articol-nou", title: "Articol nou", excerpt: "Rezumat nou",
    body: "Primul paragraf.\n\n<script>alert(1)</script>", category: "Noutăți",
    cover_media_id: "", cover_alt: "", status: "published",
    created_at: "2026-08-30T10:00:00+00:00", updated_at: "2026-08-30T10:00:00+00:00",
    published_at: "2026-08-30T10:00:00+00:00",
  },
  {
    id: "post-2", slug: "articol-doi", title: "Articol doi", excerpt: "Rezumat doi",
    body: "Conținut doi.", category: "Culise", cover_media_id: "", cover_alt: "",
    status: "published", created_at: "2026-08-20T10:00:00+00:00",
    updated_at: "2026-08-20T10:00:00+00:00", published_at: "2026-08-20T10:00:00+00:00",
  },
  {
    id: "post-1", slug: "articol-unu", title: "Articol unu", excerpt: "Rezumat unu",
    body: "Conținut unu.", category: "Evenimente", cover_media_id: "", cover_alt: "",
    status: "published", created_at: "2026-08-10T10:00:00+00:00",
    updated_at: "2026-08-10T10:00:00+00:00", published_at: "2026-08-10T10:00:00+00:00",
  },
];

async function mockBlog(page, items = posts) {
  await page.route("**/api/blog/posts**", async (route) => {
    const url = new URL(route.request().url());
    const slug = url.pathname.split("/api/blog/posts/")[1];
    if (slug) {
      const post = items.find((item) => item.slug === decodeURIComponent(slug));
      await route.fulfill({
        status: post ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(post || { detail: "Articolul nu a fost găsit." }),
      });
      return;
    }
    const limit = Number(url.searchParams.get("limit") || items.length);
    await route.fulfill({ contentType: "application/json", body: JSON.stringify(items.slice(0, limit)) });
  });
}

test("landing renders the newest three and links to the complete Blog", async ({ page }) => {
  await mockBlog(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const section = page.getByTestId("home-blog");
  await expect(section).toBeVisible();
  await expect(section.getByTestId("blog-card")).toHaveCount(3);
  await expect(section.getByTestId("blog-card").locator("h3")).toHaveText(["Articol nou", "Articol doi", "Articol unu"]);
  await expect(section.getByRole("link", { name: "Vezi tot blogul" })).toHaveAttribute("href", "/blog");
});

test("landing hides the complete Blog section when the API is empty", async ({ page }) => {
  await mockBlog(page, []);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-blog")).toHaveCount(0);
});

test("landing also hides the Blog section when its request fails", async ({ page }) => {
  await page.route("**/api/blog/posts**", (route) => route.abort("failed"));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("home-blog")).toHaveCount(0);
});

test("archive, article text safety, and footer navigation use approved routes", async ({ page }) => {
  await mockBlog(page);
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByTestId("blog-card")).toHaveCount(3);
  await expect(page.getByTestId("night-runway-footer").getByRole("link", { name: "Blog", exact: true })).toHaveAttribute("href", "/blog");
  await page.getByTestId("blog-card").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/blog\/articol-nou$/);
  await expect(page.getByTestId("blog-body").locator("p")).toHaveCount(2);
  await expect(page.getByTestId("blog-body").locator("script")).toHaveCount(0);
  await expect(page.getByTestId("blog-body")).toContainText("<script>alert(1)</script>");
});

test("archive distinguishes empty and failed requests", async ({ page }) => {
  await mockBlog(page, []);
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Nu există articole publicate momentan.")).toBeVisible();

  await page.unroute("**/api/blog/posts**");
  await page.route("**/api/blog/posts**", (route) => route.abort("failed"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("button", { name: "Încearcă din nou" })).toBeVisible();
});

test("missing article shows an accessible route back to the Blog", async ({ page }) => {
  await mockBlog(page, []);
  await page.goto("/blog/articol-inexistent", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Articolul nu a fost găsit.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Înapoi la Blog" })).toHaveAttribute("href", "/blog");
});
```

- [ ] **Step 2: Build and run the public Blog spec to verify red**

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium
```

Expected: tests fail because `/blog`, Blog cards, and landing section are absent.

- [ ] **Step 3: Implement the reusable card and fail-closed landing preview**

Create `BlogCard.jsx` with a semantic article and optional managed fields:

```jsx
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { blogMediaUrl } from "@/lib/blogApi";

const roDate = new Intl.DateTimeFormat("ro-RO", { day: "2-digit", month: "long", year: "numeric" });

export default function BlogCard({ article, variant = "standard" }) {
  const href = `/blog/${article.slug}`;
  const date = article.published_at ? roDate.format(new Date(article.published_at)) : "";
  const cover = blogMediaUrl(article.cover_media_id);
  return (
    <article className={`fa-blog-card is-${variant}`} data-testid="blog-card">
      {cover && <Link className="fa-blog-card__media" to={href} tabIndex={-1}><img src={cover} alt={article.cover_alt} loading="lazy" /></Link>}
      <div className="fa-blog-card__copy">
        {(article.category || date) && <p className="fa-blog-card__meta">{article.category && <span>{article.category}</span>}{date && <time dateTime={article.published_at}>{date}</time>}</p>}
        <h3><Link to={href}>{article.title}</Link></h3>
        {article.excerpt && <p className="fa-blog-card__excerpt">{article.excerpt}</p>}
        <Link className="fa-blog-card__link" to={href}>Citește articolul <ArrowUpRight aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
```

Create `HomeBlog.jsx`. Abort on unmount and return `null` for loading, empty, or error so the landing layout does not shift into an error panel:

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BlogCard from "@/components/blog/BlogCard";
import { listPublishedPosts } from "@/lib/blogApi";

export default function HomeBlog() {
  const [posts, setPosts] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    listPublishedPosts({ limit: 3, signal: controller.signal })
      .then((items) => setPosts(items.slice(0, 3)))
      .catch((error) => { if (error.name !== "AbortError") setPosts([]); });
    return () => controller.abort();
  }, []);
  if (!posts?.length) return null;
  return (
    <section className="fa-home-blog nr-section" data-testid="home-blog" aria-labelledby="home-blog-title">
      <div className="nr-shell">
        <header className="fa-home-blog__head"><p className="fa-kicker">Jurnal FireArtRo</p><h2 id="home-blog-title">Ultimele articole</h2></header>
        <div className="fa-home-blog__grid">
          <BlogCard article={posts[0]} variant="lead" />
          <div>{posts.slice(1).map((post) => <BlogCard article={post} variant="compact" key={post.id} />)}</div>
        </div>
        <Link className="nr-button nr-button--secondary" to="/blog">Vezi tot blogul</Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implement archive/detail pages and metadata**

`BlogPage.jsx` must fetch on mount/retry, render a status role while loading, an exact empty message for `[]`, and `Încearcă din nou` only after errors. Use:

```jsx
usePageMeta({
  title: "Blog — FireArtRo",
  description: "Articole FireArtRo despre spectacole cu drone, artificii și producția evenimentelor.",
  path: "/blog",
  schema: { "@context": "https://schema.org", "@type": "Blog", name: "Blog FireArtRo", url: `${SITE_DETAILS.siteUrl}/blog` },
});
```

`BlogArticlePage.jsx` reads `slug` with `useParams`, distinguishes a `404` from other errors, renders `BlogBody`, and sets metadata from fetched data:

```jsx
usePageMeta({
  title: post ? `${post.title} — FireArtRo` : "Articol — FireArtRo",
  description: post?.excerpt || "Articol din Blogul FireArtRo.",
  path: `/blog/${slug}`,
  image: post?.cover_media_id ? blogMediaUrl(post.cover_media_id) : "/media/fireart-hero-poster.webp",
  noindex: notFound,
  schema: post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    image: post.cover_media_id ? blogMediaUrl(post.cover_media_id) : undefined,
    mainEntityOfPage: `${SITE_DETAILS.siteUrl}/blog/${post.slug}`,
  } : undefined,
});
```

Both pages use the exact shell order `main.fa-blog-page[data-design="night-runway"]`, `ScrollProgress`, `Navbar`, their route-specific archive/article section, then `PageEnd`. The archive section renders the loading/empty/error/grid branches; the detail section renders loading/not-found/error/article branches and `BlogBody` for the successful article.

- [ ] **Step 5: Add routing, conditional page ending, landing insertion, and footer link**

Modify `App.js`:

```jsx
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogArticlePage"));

<Route path="/blog" element={<BlogPage />} />
<Route path="/blog/:slug" element={<BlogArticlePage />} />
```

Change `PageEnd` to opt into the landing Blog without placing it on every public route:

```jsx
import HomeBlog from "@/components/blog/HomeBlog";

export default function PageEnd({ showBlog = false }) {
  return (
    <>
      {showBlog && <HomeBlog />}
      <HomeReviews />
      <Footer />
    </>
  );
}
```

In `Home.jsx`, change only the existing page-ending call:

```jsx
<PageEnd showBlog />
```

In `Footer.jsx`, insert the exact item after Galerie:

```javascript
{ label: "Blog", href: "/blog" },
```

- [ ] **Step 6: Build and rerun focused public Blog flows**

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium
```

Expected: functional public tests pass before final visual refinement.

- [ ] **Step 7: Commit only separable Task 5 changes**

Inspect shared dirty files first. Stage new Blog files and clean routing changes normally; selectively stage only Blog hunks in pre-modified files. Leave the pre-existing untracked `PageEnd.jsx` unstaged if its complete prior contents cannot be isolated:

```powershell
git status --short
git diff -- frontend/src/App.js frontend/src/components/site/PageEnd.jsx frontend/src/pages/Home.jsx frontend/src/components/site/Footer.jsx
git add -- frontend/src/components/blog/BlogCard.jsx frontend/src/components/blog/HomeBlog.jsx frontend/src/pages/BlogPage.jsx frontend/src/pages/BlogArticlePage.jsx frontend/e2e/night-runway-blog.spec.js frontend/src/App.js
git add -p -- frontend/src/pages/Home.jsx frontend/src/components/site/Footer.jsx
git diff --cached --check
git commit -m "feat: add public blog pages"
```

### Task 6: Dedicated remote Blog Admin panel

**Files:**
- Create: `frontend/src/admin/AdminBlogPanel.jsx`
- Modify: `frontend/src/admin/adminConfig.js`
- Modify: `frontend/src/pages/AdminPage.jsx`
- Modify: `frontend/src/admin.css`
- Modify: `frontend/e2e/night-runway-blog.spec.js`

**Interfaces:**
- Consumes: Admin API functions and `prepareAdminImage`.
- Produces: remote `blog` Admin module with in-memory key, explicit first draft save, later publish update, cover upload, and confirmed deletion.

- [ ] **Step 1: Add failing Admin Playwright coverage**

Append a test that handles API requests with an in-memory fixture and asserts the real panel behavior:

```javascript
test("Admin authenticates, creates a draft, then explicitly publishes it", async ({ page }) => {
  let storedPosts = [];
  await page.route("**/api/admin/blog/media", async (route) => {
    if (route.request().headers()["x-admin-key"] !== "valid-key") {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "Acces neautorizat." }) });
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ id: "507f1f77bcf86cd799439011", url: "/api/blog/media/507f1f77bcf86cd799439011" }),
    });
  });
  await page.route("**/api/admin/blog/posts**", async (route) => {
    const request = route.request();
    if (request.headers()["x-admin-key"] !== "valid-key") {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ detail: "Acces neautorizat." }) });
      return;
    }
    if (request.method() === "GET") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(storedPosts) });
      return;
    }
    if (request.method() === "POST") {
      const payload = request.postDataJSON();
      const created = {
        ...payload, id: "admin-post-1", slug: "primul-articol", status: "draft",
        created_at: "2026-08-30T10:00:00+00:00", updated_at: "2026-08-30T10:00:00+00:00", published_at: null,
      };
      storedPosts = [created];
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify(created) });
      return;
    }
    if (request.method() === "PUT") {
      const updated = { ...storedPosts[0], ...request.postDataJSON(), published_at: "2026-08-30T11:00:00+00:00" };
      storedPosts = [updated];
      await route.fulfill({ contentType: "application/json", body: JSON.stringify(updated) });
      return;
    }
    storedPosts = [];
    await route.fulfill({ status: 204, body: "" });
  });

  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /Blog/ }).click();
  await page.getByLabel("Cheie Admin").fill("valid-key");
  await page.getByRole("button", { name: "Accesează Blogul" }).click();
  await expect(page.getByText("Nu există articole. Creează primul articol.")).toBeVisible();
  await page.getByRole("button", { name: "Articol nou" }).click();
  await page.getByLabel("Titlu").fill("Primul articol");
  await page.getByLabel("Conținut").fill("Text real introdus din Admin.");
  await page.getByLabel("Imagine de copertă").setInputFiles("public/media/fireart-hero-poster.webp");
  await expect(page.getByText(/Imaginea a fost încărcată/)).toBeVisible();
  await page.getByLabel("Text alternativ").fill("Spectacol FireArtRo pe timp de noapte");
  await expect(page.getByLabel("Publicat")).toBeDisabled();
  await page.getByRole("button", { name: "Salvează articolul" }).click();
  await expect(page.getByText("primul-articol")).toBeVisible();
  await page.getByLabel("Publicat").check();
  await page.getByRole("button", { name: "Salvează articolul" }).click();
  await expect(page.getByText("Articol publicat.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Șterge articolul" }).click();
  await expect(page.getByText("Nu există articole. Creează primul articol.")).toBeVisible();
});
```

- [ ] **Step 2: Build and verify the Admin flow fails for a missing module**

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium --grep "Admin authenticates"
```

Expected: FAIL because the Blog module and panel are absent.

- [ ] **Step 3: Register a remote module without placing Blog in local defaults**

Add to `ADMIN_MODULES` in `adminConfig.js`:

```javascript
blog: {
  label: "Blog",
  description: "Articole publicate online",
  kind: "remote",
},
```

Add `"blog"` after `"mediaItems"` in `MODULE_ORDER`. Do not add Blog data to `ADMIN_DEFAULTS`, `MANAGED_CONTENT_DEFAULTS`, JSON export, or localStorage migrations.

- [ ] **Step 4: Implement `AdminBlogPanel.jsx` state and authenticated CRUD**

Use one immutable empty draft shape:

```jsx
const EMPTY_ARTICLE = {
  id: "",
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  category: "",
  cover_media_id: "",
  cover_alt: "",
  status: "draft",
};
```

The panel must keep `adminKey` only in component state. Authentication is proven by `listAdminPosts(key)`, not by comparing the key in the browser. Save behavior is exact:

```jsx
const saveArticle = async () => {
  if (!draft.title.trim() || !draft.body.trim()) {
    setStatus({ tone: "error", message: "Titlul și conținutul sunt obligatorii." });
    return;
  }
  if (draft.cover_media_id && !draft.cover_alt.trim()) {
    setStatus({ tone: "error", message: "Descrie imaginea de copertă." });
    return;
  }
  setSaving(true);
  try {
    const base = {
      title: draft.title,
      excerpt: draft.excerpt,
      body: draft.body,
      category: draft.category,
      cover_media_id: draft.cover_media_id,
      cover_alt: draft.cover_alt,
    };
    const saved = draft.id
      ? await updateAdminPost(adminKey, draft.id, { ...base, status: draft.status })
      : await createAdminPost(adminKey, base);
    setDraft(saved);
    setPosts((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
    setStatus({
      tone: "success",
      message: saved.status === "published" ? "Articol publicat." : "Draft salvat.",
    });
  } catch (error) {
    setStatus({ tone: "error", message: error.message || "Articolul nu a putut fi salvat." });
  } finally {
    setSaving(false);
  }
};
```

The `Publicat` checkbox uses `checked={draft.status === "published"}`, changes status, and is `disabled={!draft.id || saving}`. This enforces first save as draft. Image upload calls `prepareAdminImage(file)`, then `uploadAdminCover(adminKey, prepared)`, and updates only `cover_media_id`; it never clears title/body after an upload error.

Delete behavior calls `window.confirm("Ștergi definitiv acest articol?")`, waits for `deleteAdminPost`, removes the item, then selects the next item or `EMPTY_ARTICLE`.

Render these accessible labels exactly: `Cheie Admin`, `Titlu`, `Descriere scurtă`, `Conținut`, `Categorie`, `Imagine de copertă`, `Text alternativ`, and `Publicat`.

- [ ] **Step 5: Mount the remote panel without invoking local save/reset paths**

Modify `AdminPage.jsx`:

```jsx
import { Newspaper } from "lucide-react";
import AdminBlogPanel from "@/admin/AdminBlogPanel";

const MODULE_ICONS = {
  blog: Newspaper,
};
```

Merge `blog: Newspaper` into the existing icon map rather than replacing other entries. Define:

```jsx
const isRemoteModule = activeModule?.kind === "remote";
```

Guard the raw JSON effect:

```jsx
if (!activeModule || isRemoteModule) return;
```

In the existing main rendering ternary, replace the delimiter between the complete overview branch and the complete local-module branch with this exact remote branch:

```jsx
) : isRemoteModule ? (
  <AdminBlogPanel />
) : (
```

Preserve the complete existing overview JSX before this delimiter and the complete existing local-module JSX after it.

Hide the local auto-save, `Salvat local`, global Save, and bottom local footer bar while Blog is active. Replace the app-bar cluster with one non-secret label `Conținut online` for the remote module. Change the sidebar note to state accurately that Blog publishes online while the other modules remain browser-local.

- [ ] **Step 6: Add focused responsive Admin styles**

Append `.admin-blog-*` classes to `admin.css` without altering current rules. The layout uses the existing Admin tokens:

```css
.admin-blog { width: min(100%, 1480px); margin-inline: auto; }
.admin-blog__layout { display: grid; grid-template-columns: minmax(260px, 320px) minmax(0, 1fr); gap: 16px; }
.admin-blog__list,
.admin-blog__editor,
.admin-blog__login { border: 1px solid var(--admin-border); background: var(--admin-surface); }
.admin-blog__editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 17px 18px; padding: 20px; }
.admin-blog__editor-grid .is-wide { grid-column: 1 / -1; }
.admin-blog__editor textarea[name="body"] { min-height: 320px; }
.admin-blog__status[role="status"] { margin: 12px 20px; color: var(--admin-muted); }

@media (max-width: 860px) {
  .admin-blog__layout,
  .admin-blog__editor-grid { grid-template-columns: minmax(0, 1fr); }
  .admin-blog__editor-grid { padding: 16px; }
}
```

- [ ] **Step 7: Build and rerun the Admin flow until green**

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium --grep "Admin authenticates"
```

Expected: Admin login, first draft, slug display, and explicit publish pass.

- [ ] **Step 8: Commit only Blog Admin changes and preserve unrelated Admin work**

```powershell
git status --short
git diff -- frontend/src/admin/AdminBlogPanel.jsx frontend/src/admin/adminConfig.js frontend/src/pages/AdminPage.jsx frontend/src/admin.css frontend/e2e/night-runway-blog.spec.js
git add -- frontend/src/admin/AdminBlogPanel.jsx frontend/src/admin/adminConfig.js frontend/src/pages/AdminPage.jsx frontend/src/admin.css frontend/e2e/night-runway-blog.spec.js
git diff --cached --check
git commit -m "feat: add blog publishing to admin"
```

### Task 7: Public visual refinement, responsive matrix, metadata, and complete verification

**Files:**
- Create: `frontend/src/styles/night-blog.css`
- Modify: `frontend/src/components/blog/BlogCard.jsx`
- Modify: `frontend/src/components/blog/HomeBlog.jsx`
- Modify: `frontend/src/pages/BlogPage.jsx`
- Modify: `frontend/src/pages/BlogArticlePage.jsx`
- Modify: `frontend/e2e/night-runway-blog.spec.js`

**Interfaces:**
- Consumes: functional public Blog from Task 5 and Night Runway variables in `night-runway.css`.
- Produces: asymmetric lead-plus-two landing composition, archive grid, readable detail page, visible focus, reduced motion, and viewport acceptance evidence.

- [ ] **Step 1: Read the frontend-design skill and derive the Blog plan from existing FireArtRo tokens**

Record the implementation decisions in the task notes before CSS:

```text
Palette: existing --nr-obsidian, --nr-carbon, --nr-paper, --nr-ice, --nr-electric, --nr-muted.
Type: existing Sora display/lead and Inter utility/body roles.
Layout: newest article occupies the larger left editorial field; the next two stack on the right; mobile preserves chronological order in one column.
Signature: hierarchy communicates recency through scale and composition, never decorative numbering.
Motion: one restrained cover lift and link-arrow shift on fine pointers; all transitions disabled under prefers-reduced-motion.
```

- [ ] **Step 2: Add failing responsive, focus, and raw-HTML acceptance assertions**

Append:

```javascript
test("Blog layouts keep readable controls and zero horizontal overflow", async ({ page }) => {
  await mockBlog(page);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 430, height: 932 },
    { width: 844, height: 390 },
    { width: 568, height: 320 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    const firstLink = page.getByTestId("blog-card").first().getByRole("link").last();
    await firstLink.focus();
    await expect(firstLink).toBeFocused();
    const box = await firstLink.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("Blog removes decorative motion when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mockBlog(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const transition = await page.getByTestId("home-blog").getByTestId("blog-card").first().evaluate((node) => getComputedStyle(node).transitionDuration);
  expect(transition).toBe("0s");
});
```

- [ ] **Step 3: Run the focused visual tests and verify red**

```powershell
cd frontend
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium --grep "overflow|reduced motion"
```

Expected: assertions fail until CSS supplies final geometry, touch targets, and reduced-motion overrides.

- [ ] **Step 4: Implement the public Blog stylesheet and import it from public Blog entry components**

Create `night-blog.css` with these exact layout foundations, then refine values only if screenshots show clipping:

```css
.fa-home-blog,
.fa-blog-page { color: var(--nr-paper); background: var(--nr-obsidian); }
.fa-home-blog { border-top: 1px solid rgba(141, 211, 255, .16); }
.fa-home-blog__head { display: flex; align-items: end; justify-content: space-between; gap: 2rem; margin-bottom: clamp(2rem, 5vw, 4rem); }
.fa-home-blog__head h2,
.fa-blog-hero h1 { margin: 0; font-family: "Sora", sans-serif; font-weight: 520; line-height: .98; text-wrap: balance; }
.fa-home-blog__head h2 { font-size: clamp(2.4rem, 5vw, 5rem); }
.fa-home-blog__grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(18rem, .75fr); gap: clamp(1rem, 2.5vw, 2rem); margin-bottom: 2rem; }
.fa-home-blog__grid > div { display: grid; gap: clamp(1rem, 2vw, 1.5rem); }
.fa-blog-card { min-width: 0; border: 1px solid rgba(141, 211, 255, .15); background: rgba(8, 12, 20, .78); transition: border-color .2s ease, transform .2s ease; }
.fa-blog-card__media { display: block; aspect-ratio: 16 / 9; overflow: hidden; }
.fa-blog-card__media img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s cubic-bezier(.16, 1, .3, 1); }
.fa-blog-card__copy { display: grid; gap: 1rem; padding: clamp(1.25rem, 3vw, 2.25rem); }
.fa-blog-card__meta { display: flex; flex-wrap: wrap; gap: .75rem; margin: 0; color: var(--nr-ice); font: 600 .72rem/1.3 "Inter", sans-serif; text-transform: uppercase; }
.fa-blog-card h3 { margin: 0; font: 520 clamp(1.45rem, 2.6vw, 2.7rem)/1.04 "Sora", sans-serif; }
.fa-blog-card.is-compact h3 { font-size: clamp(1.2rem, 1.8vw, 1.75rem); }
.fa-blog-card__excerpt { margin: 0; color: var(--nr-muted); line-height: 1.7; }
.fa-blog-card__link { display: inline-flex; min-height: 44px; align-items: center; gap: .6rem; color: var(--nr-paper); }
.fa-blog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(1rem, 2vw, 1.75rem); }
.fa-blog-article { width: min(calc(100% - (2 * var(--nr-gutter))), 54rem); margin-inline: auto; padding-block: clamp(8rem, 14vw, 12rem) var(--nr-section-space); }
.fa-blog-body { color: #dce4ef; font-size: clamp(1.05rem, 1.4vw, 1.18rem); line-height: 1.85; }
.fa-blog-body p { margin: 0 0 1.5em; }

@media (hover: hover) and (pointer: fine) {
  .fa-blog-card:hover { border-color: rgba(141, 211, 255, .55); transform: translateY(-3px); }
  .fa-blog-card:hover .fa-blog-card__media img { transform: scale(1.025); }
}

@media (max-width: 900px) {
  .fa-home-blog__grid,
  .fa-blog-grid { grid-template-columns: minmax(0, 1fr); }
  .fa-home-blog__grid > div { display: contents; }
  .fa-home-blog__head { align-items: start; flex-direction: column; }
}

@media (prefers-reduced-motion: reduce) {
  .fa-blog-card,
  .fa-blog-card__media img,
  .fa-blog-card__link svg { transition: none; }
}
```

Import the stylesheet once from `HomeBlog.jsx`, `BlogPage.jsx`, and `BlogArticlePage.jsx`. Repeated imports are deduplicated by the build and make every lazy route self-sufficient.

- [ ] **Step 5: Run focused tests, full unit tests, and production build**

```powershell
cd frontend
$env:CI='true'; yarn test --watchAll=false
yarn build
yarn playwright test e2e/night-runway-blog.spec.js --project=desktop-chromium
```

Expected: Jest is green, CRA production build exits 0, and focused Chromium Blog flows pass.

- [ ] **Step 6: Run regression flows affected by routing/PageEnd/footer/Admin changes**

```powershell
cd frontend
yarn playwright test e2e/night-runway-home-refactor.spec.js e2e/night-runway-footer.spec.js e2e/night-runway-navigation-flow.spec.js e2e/night-runway-responsive-matrix.spec.js --project=desktop-chromium
```

Expected: existing landing order, conditional reviews, footer directory, route transitions, and responsive navigation remain green.

- [ ] **Step 7: Inspect desktop and mobile screenshots**

Serve the freshly rebuilt `build` through the existing Playwright server. Capture landing Blog, archive, and article at 1440×900 and 430×932. Inspect:

```text
Landing: one lead story plus two chronological secondary stories; CTA visible before reviews/footer.
Archive: readable card hierarchy; empty/error states centered and explicit.
Article: line length remains near 54rem maximum; text and optional cover do not collide with navbar.
Mobile: one chronological column, 44px actions, no clipped titles, no horizontal scrollbar.
No-cover state: typography carries the card without a blank media frame.
```

If a screenshot violates one of these statements, add a Playwright assertion that reproduces the defect before changing CSS, then rerun the failing assertion and full focused spec.

- [ ] **Step 8: Run backend verification fresh**

```powershell
cd backend
python -m pytest tests/test_blog.py -q
```

Expected: all Blog backend tests pass with zero failures.

- [ ] **Step 9: Audit requirement coverage and diff boundaries**

Check each observable requirement directly:

```powershell
git status --short
git diff --check
git diff --stat
rg -n "Blog|Vezi tot blogul|/blog|showBlog" frontend/src frontend/e2e/night-runway-blog.spec.js
rg -n "blog/posts|admin/blog|GridFs|X-Admin-Key|128 \* 1024|6 \* 1024" backend
```

Confirm:

```text
No seeded articles exist.
Landing uses at most three published API results.
Footer contains Blog.
Archive and detail routes are lazy loaded.
Draft public detail returns 404.
Admin key is absent from frontend environment constants and localStorage.
Only Blog media request gets the media limit.
Existing dirty files/hunks remain preserved.
```

- [ ] **Step 10: Commit only final separable Blog refinement files**

```powershell
git status --short
git diff -- frontend/src/styles/night-blog.css frontend/src/components/blog frontend/src/pages/BlogPage.jsx frontend/src/pages/BlogArticlePage.jsx frontend/e2e/night-runway-blog.spec.js
git add -- frontend/src/styles/night-blog.css frontend/src/components/blog frontend/src/pages/BlogPage.jsx frontend/src/pages/BlogArticlePage.jsx frontend/e2e/night-runway-blog.spec.js
git diff --cached --check
git commit -m "feat: finish responsive FireArtRo blog"
```

Do not claim completion until the fresh backend tests, full Jest run, production build, focused Blog Playwright spec, affected regression specs, viewport checks, and diff audit above have all been read and their actual results reported.
