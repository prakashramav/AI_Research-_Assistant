import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.config import settings
from backend.app.db import init_db
from backend.app.db.seed import seed_database
from backend.app.routers import research, sessions

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("research_assistant")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database...")
    init_db()
    # Seed exemplary session for instant UI inspection
    seeded_id = seed_database()
    logger.info(f"Database ready. Seeded session: {seeded_id}")
    yield
    logger.info("Shutting down AI Research Assistant backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack AI Research Assistant backend with multi-source synthesis, RAG, and editorial reporting.",
    version="1.0.0",
    lifespan=lifespan
)

# Robust CORS middleware allowing all origins, credentials, headers, and methods
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://.*",  # Matches localhost, Vercel, Render, and custom domains
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Root endpoint returning API information and service status
@app.get("/", tags=["system"])
def root():
    return {
        "name": "Synthesia - AI Research Assistant API",
        "status": "online",
        "version": "1.0.0",
        "documentation": "/docs",
        "health": "/api/health",
        "endpoints": {
            "sessions": "/api/sessions",
            "start_research": "POST /api/research",
            "research_detail": "GET /api/research/{session_id}",
            "research_events_sse": "GET /api/research/{session_id}/events",
            "ask_follow_up": "POST /api/research/{session_id}/ask",
        },
        "engine": {
            "llm": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "search_provider": settings.SEARCH_PROVIDER,
            "database": "PostgreSQL (Supabase)" if "postgresql" in settings.DATABASE_URL else "SQLite"
        }
    }

# Include Routers
app.include_router(research.router)
app.include_router(sessions.router)

@app.get("/api/health", tags=["system"])
def health_check():
    return {
        "status": "healthy",
        "mock_mode": settings.MOCK_MODE,
        "is_mock_llm": settings.is_mock_llm,
        "is_mock_search": settings.is_mock_search,
        "search_provider": settings.SEARCH_PROVIDER,
        "database": "PostgreSQL (Supabase)" if "postgresql" in settings.DATABASE_URL else "SQLite"
    }
