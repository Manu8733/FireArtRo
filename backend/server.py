from fastapi import FastAPI, APIRouter, Header, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from collections import defaultdict, deque
from time import monotonic

from blog import (
    BlogService,
    GridFsBlogMediaStore,
    MongoBlogRepository,
    create_blog_router,
    request_size_limit,
)
from reviews import ReviewsService, create_reviews_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="FireArtRo API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class QuoteCreate(BaseModel):
    first_name: str = Field(min_length=2, max_length=80)
    last_name: str = Field(min_length=2, max_length=80)
    phone: str = Field(min_length=7, max_length=30)
    email: str = Field(min_length=5, max_length=160)
    locality: str = Field(min_length=2, max_length=120)
    event_location: Optional[str] = Field(default="", max_length=180)
    event_type: str = Field(min_length=2, max_length=80)
    event_date: str = Field(min_length=8, max_length=40)
    services: List[str] = Field(min_length=1, max_length=12)
    package_id: Optional[str] = Field(default="", max_length=100)
    package_title: Optional[str] = Field(default="", max_length=120)
    message: Optional[str] = Field(default="", max_length=3000)
    consent: bool = False
    company_website: Optional[str] = Field(default="", max_length=200)

    @field_validator(
        "first_name",
        "last_name",
        "phone",
        "locality",
        "event_location",
        "event_type",
        "package_id",
        "package_title",
        "message",
        "company_website",
    )
    @classmethod
    def normalize_text(cls, value):
        return " ".join((value or "").strip().split())

    @field_validator("services")
    @classmethod
    def normalize_services(cls, values):
        normalized = [" ".join(value.strip().split()) for value in values if value and value.strip()]
        return list(dict.fromkeys(normalized))

    @field_validator("email")
    @classmethod
    def validate_email(cls, value):
        value = (value or "").strip().lower()
        if value and ("@" not in value or "." not in value.rsplit("@", 1)[-1]):
            raise ValueError("Adresa de email nu este validă.")
        return value


class Quote(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    last_name: str
    phone: str
    email: str
    locality: str
    event_location: str = ""
    event_type: str
    event_date: str
    services: List[str] = Field(default_factory=list)
    package_id: str = ""
    package_title: str = ""
    message: str = ""
    consent: bool = False
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "FireArtRo API"}


@api_router.post("/quotes", response_model=Quote)
async def create_quote(input: QuoteCreate, request: Request):
    if not input.consent:
        raise HTTPException(status_code=422, detail="Consimțământul este obligatoriu.")
    enforce_rate_limit(request)
    payload = input.model_dump(exclude={"company_website"})
    quote = Quote(**payload)
    if input.company_website:
        quote.status = "accepted"
        return quote
    doc = quote.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.quotes.insert_one(doc)
    return quote


@api_router.get("/quotes", response_model=List[Quote])
async def get_quotes(x_admin_key: Optional[str] = Header(default=None)):
    admin_key = os.environ.get("ADMIN_API_KEY")
    if not admin_key or x_admin_key != admin_key:
        raise HTTPException(status_code=401, detail="Acces neautorizat.")
    quotes = await db.quotes.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for q in quotes:
        if isinstance(q.get('created_at'), str):
            q['created_at'] = datetime.fromisoformat(q['created_at'])
    return quotes


# Include the router in the main app
app.include_router(api_router)

blog_repository = MongoBlogRepository(db.blog_posts)
blog_media_store = GridFsBlogMediaStore(
    AsyncIOMotorGridFSBucket(db, bucket_name="blog_media")
)
blog_service = BlogService(blog_repository, blog_media_store)
app.include_router(
    create_blog_router(blog_service, os.environ.get("ADMIN_API_KEY", ""))
)

reviews_service = ReviewsService(os.environ)
app.include_router(create_reviews_router(reviews_service))

rate_windows = defaultdict(deque)
RATE_LIMIT = 5
RATE_WINDOW_SECONDS = 600


def enforce_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    now = monotonic()
    attempts = rate_windows[client_ip]
    while attempts and now - attempts[0] > RATE_WINDOW_SECONDS:
        attempts.popleft()
    if len(attempts) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Prea multe solicitări. Încearcă din nou mai târziu.")
    attempts.append(now)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    max_request_bytes = request_size_limit(request.url.path, request.method)
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > max_request_bytes:
                return JSONResponse(status_code=413, content={"detail": "Cererea este prea mare."})
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Content-Length invalid."})
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if not request.url.path.startswith("/api/blog/media/"):
        response.headers["Cache-Control"] = "no-store"
    return response


allowed_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "https://www.fireartro.ro").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def ensure_blog_indexes():
    await db.blog_posts.create_index("slug", unique=True)
    await db.blog_posts.create_index([("status", 1), ("published_at", -1)])


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
