from backend.app.db.database import Base, engine, get_db, SessionLocal
from backend.app.db.models import ResearchSession, ResearchSource, ResearchChunk, ChatMessage

def init_db():
    Base.metadata.create_all(bind=engine)
