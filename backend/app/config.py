import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "AI Research Assistant"
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    SEARCH_API_KEY: str = os.getenv("SEARCH_API_KEY", "")
    SEARCH_PROVIDER: str = os.getenv("SEARCH_PROVIDER", "tavily").lower()  # "tavily", "serper", "bing", "mock"
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/research_assistant.db")
    VECTOR_DB_PATH: str = os.getenv("VECTOR_DB_PATH", str(BASE_DIR / "vector_store"))
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "false").lower() in ("true", "1", "yes")
    CLAUDE_MODEL: str = os.getenv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
    
    # Auto fallback to mock if no keys are provided
    @property
    def is_mock_llm(self) -> bool:
        return self.MOCK_MODE or not self.ANTHROPIC_API_KEY or self.ANTHROPIC_API_KEY.startswith("mock_")
        
    @property
    def is_mock_search(self) -> bool:
        return self.MOCK_MODE or not self.SEARCH_API_KEY or self.SEARCH_API_KEY.startswith("mock_")

settings = Settings()
