import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows localhost:3000 and any local origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(research.router)
app.include_router(sessions.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "mock_mode": settings.MOCK_MODE,
        "is_mock_llm": settings.is_mock_llm,
        "is_mock_search": settings.is_mock_search,
        "search_provider": settings.SEARCH_PROVIDER
    }
