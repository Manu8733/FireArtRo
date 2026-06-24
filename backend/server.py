from fastapi import FastAPI, APIRouter, Header, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from collections import defaultdict, deque
from time import monotonic


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="FIREARTRO API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class QuoteCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=30)
    email: Optional[str] = Field(default="", max_length=160)
    event_type: str = Field(min_length=2, max_length=80)
    event_date: Optional[str] = Field(default="", max_length=40)
    location: Optional[str] = Field(default="", max_length=180)
    package: Optional[str] = Field(default="", max_length=100)
    preferred_service: Optional[str] = Field(default="", max_length=120)
    message: Optional[str] = Field(default="", max_length=3000)
    consent: bool = False

    @field_validator("name", "phone", "event_type", "location", "package", "preferred_service", "message")
    @classmethod
    def normalize_text(cls, value):
        return " ".join((value or "").strip().split())

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
    name: str
    phone: str
    email: str = ""
    event_type: str
    event_date: str = ""
    location: str = ""
    package: str = ""
    preferred_service: str = ""
    message: str = ""
    consent: bool = False
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "FIREARTRO API"}


@api_router.post("/quotes", response_model=Quote)
async def create_quote(input: QuoteCreate, request: Request):
    if not input.consent:
        raise HTTPException(status_code=422, detail="Consimțământul este obligatoriu.")
    enforce_rate_limit(request)
    quote = Quote(**input.model_dump())
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
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > 32_768:
                return JSONResponse(status_code=413, content={"detail": "Cererea este prea mare."})
        except ValueError:
            return JSONResponse(status_code=400, content={"detail": "Content-Length invalid."})
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Cache-Control"] = "no-store"
    return response


allowed_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Key"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
