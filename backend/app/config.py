import os
import re
from urllib.parse import quote_plus
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

def sanitize_db_url(url: str) -> str:
    """Normalize and URL-encode special characters in database connection strings."""
    if not url:
        return f"sqlite:///{BASE_DIR}/research_assistant.db"
    
    # Fix old Heroku/Supabase postgres:// scheme to postgresql://
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]

    # If Postgres URL has multiple @ signs, the password contains raw @
    if url.startswith("postgresql://") or url.startswith("postgresql+psycopg://") or url.startswith("postgresql+psycopg2://"):
        pattern = r"^(postgresql(?:\+[a-zA-Z0-9_-]+)?:\/\/)([^:]+):(.*)@([^@\/]+)(?:\/([^\?]*))?(\?.*)?$"
        match = re.match(pattern, url)
        if match:
            prefix, user, raw_password, host, dbname, query_params = match.groups()
            dbname = dbname or ""
            query_params = query_params or ""
            # If password isn't already percent-encoded, encode it
            if "%" not in raw_password:
                encoded_password = quote_plus(raw_password)
                url = f"{prefix}{user}:{encoded_password}@{host}/{dbname}{query_params}"

    return url

class Settings(BaseModel):
    PROJECT_NAME: str = "AI Research Assistant"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("ANTHROPIC_API_KEY", "")
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "tavily").lower()  # "tavily", "serper", "bing", "mock"
    DATABASE_URL: str = sanitize_db_url(os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/research_assistant.db"))
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", str(BASE_DIR / "vector_store"))
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() in ("true", "1", "yes")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # Auto fallback to mock if no keys are provided
    @property
    def is_mock_llm(self) -> bool:
        return self.MOCK_MODE or not self.GEMINI_API_KEY or self.GEMINI_API_KEY.startswith("mock_")
        
    @property
    def is_mock_search(self) -> bool:
        return self.MOCK_MODE or not self.SEARCH_API_KEY or self.SEARCH_API_KEY.startswith("mock_")

settings = Settings()
