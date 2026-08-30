"""Public and administrative Blog domain for FireArtRo."""

import re
import unicodedata
from typing import Literal, Optional, Protocol

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def slugify_ro(value):
    """Create a stable URL segment while preserving Romanian word meaning."""
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
        normalized = str(value or "").strip().lower()
        if normalized and not re.fullmatch(r"[0-9a-f]{24}", normalized):
            raise ValueError("Identificatorul imaginii nu este valid.")
        return normalized

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
        cursor = self.collection.find(
            {"status": "published"},
            {"_id": 0, "body": 0, "status": 0, "created_at": 0},
        ).sort("published_at", -1)
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(length=limit or 10_000)

    async def get_published_by_slug(self, slug):
        return await self.collection.find_one(
            {"slug": slug, "status": "published"},
            {"_id": 0},
        )

    async def list_all(self):
        cursor = self.collection.find({}, {"_id": 0}).sort("updated_at", -1)
        return await cursor.to_list(length=10_000)

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


def create_blog_router(service, admin_key):
    router = APIRouter(prefix="/api")

    @router.get("/blog/posts", response_model=list[BlogSummaryResponse])
    async def list_public_posts(limit: Optional[int] = Query(default=None, ge=1, le=100)):
        return await service.list_public(limit)

    @router.get("/blog/posts/{slug}", response_model=BlogArticleResponse)
    async def get_public_post(slug: str):
        return await service.get_public(slugify_ro(slug))

    return router
