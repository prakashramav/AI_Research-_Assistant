import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.database import Base

class ResearchSession(Base):
    __tablename__ = "research_sessions"

    id = Column(String(36), primary_key=True, index=True)
    topic = Column(String(500), nullable=False)
    status = Column(String(50), default="pending", nullable=False)
    progress_message = Column(String(255), default="Initializing research...")
    progress_percent = Column(Integer, default=0)
    report_json = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sources = relationship("ResearchSource", back_populates="session", cascade="all, delete-orphan", order_by="ResearchSource.id")
    chunks = relationship("ResearchChunk", back_populates="session", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    def get_report(self) -> Optional[Dict[str, Any]]:
        if self.report_json:
            try:
                return json.loads(self.report_json)
            except Exception:
                return None
        return None

    def set_report(self, data: Dict[str, Any]):
        self.report_json = json.dumps(data)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "topic": self.topic,
            "status": self.status,
            "progress_message": self.progress_message,
            "progress_percent": self.progress_percent,
            "report": self.get_report(),
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "sources": [s.to_dict() for s in self.sources],
        }


class ResearchSource(Base):
    __tablename__ = "research_sources"

    id = Column(String(50), primary_key=True)  # e.g., "src_1", "1"
    session_id = Column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(2000), nullable=False)
    domain = Column(String(255), nullable=True)
    publisher = Column(String(255), nullable=True)
    snippet = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    accessed_date = Column(String(50), nullable=True)
    stance = Column(Text, nullable=True)
    credibility_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="sources")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "title": self.title,
            "url": self.url,
            "domain": self.domain,
            "publisher": self.publisher,
            "snippet": self.snippet,
            "accessed_date": self.accessed_date,
            "stance": self.stance,
            "credibility_notes": self.credibility_notes,
        }


class ResearchChunk(Base):
    __tablename__ = "research_chunks"

    id = Column(String(64), primary_key=True)
    session_id = Column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(String(50), nullable=False)
    source_url = Column(String(2000), nullable=True)
    source_title = Column(String(500), nullable=True)
    chunk_index = Column(Integer, default=0)
    text = Column(Text, nullable=False)
    embedding = Column(Text, nullable=True)  # JSON serialized list of floats
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="chunks")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "source_id": self.source_id,
            "source_url": self.source_url,
            "source_title": self.source_title,
            "chunk_index": self.chunk_index,
            "text": self.text,
        }


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True)
    session_id = Column(String(36), ForeignKey("research_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ResearchSession", back_populates="messages")

    def get_citations(self) -> List[Any]:
        if self.citations_json:
            try:
                return json.loads(self.citations_json)
            except Exception:
                return []
        return []

    def set_citations(self, citations: List[Any]):
        self.citations_json = json.dumps(citations)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "role": self.role,
            "content": self.content,
            "citations": self.get_citations(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
