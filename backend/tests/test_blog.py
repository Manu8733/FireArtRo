"""Behavior tests for the FireArtRo Blog API."""

from copy import deepcopy

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
        return deepcopy(next((
            item
            for item in self.posts
            if item["slug"] == slug and item["status"] == "published"
        ), None))

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
    def __init__(self):
        self.items = {}
        self.deleted = []

    async def save(self, filename, content_type, data):
        media_id = "507f1f77bcf86cd799439011"
        self.items[media_id] = {
            "filename": filename,
            "content_type": content_type,
            "data": data,
        }
        return media_id

    async def open(self, media_id):
        return deepcopy(self.items.get(media_id))

    async def delete(self, media_id):
        self.deleted.append(media_id)
        self.items.pop(media_id, None)


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
    assert all("body" not in item for item in response.json())


def test_public_detail_hides_drafts_as_not_found():
    posts = [article("2", "draft", "draft", None, "Draft")]

    response = public_client(posts).get("/api/blog/posts/draft")

    assert response.status_code == 404
    assert response.json() == {"detail": "Articolul nu a fost găsit."}


def test_public_list_rejects_out_of_range_limit():
    response = public_client([]).get("/api/blog/posts?limit=101")

    assert response.status_code == 422
