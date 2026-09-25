import asyncio
import logging
from typing import Dict, Any, AsyncGenerator
from sqlalchemy.orm import Session
from backend.app.db.database import SessionLocal
from backend.app.db.models import ResearchSession, ResearchSource, ResearchChunk
from backend.app.services.search import search_service
from backend.app.services.extraction import extraction_service
from backend.app.services.vector_store import vector_store
from backend.app.services.synthesis import synthesis_service

logger = logging.getLogger(__name__)

# In-memory progress event queues for Server-Sent Events
_progress_listeners: Dict[str, list[asyncio.Queue]] = {}

def subscribe_progress(session_id: str) -> asyncio.Queue:
    q = asyncio.Queue()
    if session_id not in _progress_listeners:
        _progress_listeners[session_id] = []
    _progress_listeners[session_id].append(q)
    return q

def unsubscribe_progress(session_id: str, q: asyncio.Queue):
    if session_id in _progress_listeners:
        try:
            _progress_listeners[session_id].remove(q)
        except ValueError:
            pass
        if not _progress_listeners[session_id]:
            del _progress_listeners[session_id]

async def broadcast_progress(session_id: str, data: Dict[str, Any]):
    if session_id in _progress_listeners:
        for q in list(_progress_listeners[session_id]):
            await q.put(data)

class ResearchOrchestrator:
    async def run_pipeline(self, session_id: str, topic: str):
        """
        Executes the end-to-end 5-stage research pipeline:
        1. Query planning
        2. Multi-source search & deduplication
        3. Extraction & text normalization
        4. Chunking & vector storage
        5. Synthesis of structured report & DB persistence
        """
        db: Session = SessionLocal()
        try:
            # Stage 1: Query Planning
            await self._update_session_progress(
                db, session_id, "planning", 10,
                f"Formulating targeted search queries for: '{topic}'"
            )
            sub_queries = await synthesis_service.plan_queries(topic)
            await broadcast_progress(session_id, {
                "stage": "planning",
                "percent": 25,
                "message": f"Generated {len(sub_queries)} strategic research queries",
                "sub_queries": sub_queries
            })

            # Stage 2: Multi-source search
            await self._update_session_progress(
                db, session_id, "searching", 35,
                f"Searching academic and web sources across {len(sub_queries)} vectors..."
            )
            raw_sources = await search_service.search_queries_parallel(sub_queries, max_results_per_query=4)
            if not raw_sources:
                # Fallback to topic search if empty
                raw_sources = await search_service.search_queries_parallel([topic], max_results_per_query=5)

            await broadcast_progress(session_id, {
                "stage": "searching",
                "percent": 50,
                "message": f"Retrieved {len(raw_sources)} unique candidate sources",
                "count": len(raw_sources)
            })

            # Stage 3: Extraction
            await self._update_session_progress(
                db, session_id, "extracting", 60,
                f"Extracting and cleaning content from {len(raw_sources)} sources..."
            )
            processed_sources = await extraction_service.process_sources(raw_sources)

            # Stage 4: Chunk & embed in vector store
            await self._update_session_progress(
                db, session_id, "indexing", 75,
                "Vectorizing text chunks into local semantic index..."
            )
            chunks = extraction_service.chunk_sources(session_id, processed_sources)
            await vector_store.add_chunks(session_id, chunks)

            await broadcast_progress(session_id, {
                "stage": "indexing",
                "percent": 80,
                "message": f"Indexed {len(chunks)} contextual fragments into vector store",
                "chunks_count": len(chunks)
            })

            # Stage 5: Synthesis
            await self._update_session_progress(
                db, session_id, "synthesizing", 85,
                "Synthesizing structured research report with citations and contradictions..."
            )
            report = await synthesis_service.synthesize_report(topic, processed_sources)

            # Stage 6: Persistence to Database
            session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
            if session:
                session.status = "completed"
                session.progress_percent = 100
                session.progress_message = "Research report synthesized successfully."
                session.set_report(report)

                # Persist sources
                for s in processed_sources:
                    # check stance & credibility from report if available
                    stance = ""
                    credibility = ""
                    for sc in report.get("source_comparison", []):
                        if sc.get("source", "").lower() in s.get("title", "").lower() or s.get("domain", "").lower() in sc.get("source", "").lower():
                            stance = sc.get("stance", "")
                            credibility = sc.get("credibility_notes", "")
                            break

                    db_source = ResearchSource(
                        id=f"{session_id}_{s['id']}",
                        session_id=session_id,
                        title=s.get("title", "Untitled Source"),
                        url=s.get("url", ""),
                        domain=s.get("domain", ""),
                        publisher=s.get("publisher", ""),
                        snippet=s.get("snippet", ""),
                        content=s.get("content", ""),
                        accessed_date=s.get("accessed_date", "2026-09-25"),
                        stance=stance,
                        credibility_notes=credibility,
                    )
                    db.merge(db_source)

                # Persist chunks
                for c in chunks:
                    db_chunk = ResearchChunk(
                        id=c["id"],
                        session_id=session_id,
                        source_id=c["source_id"],
                        source_url=c["source_url"],
                        source_title=c["source_title"],
                        chunk_index=c["chunk_index"],
                        text=c["text"],
                    )
                    db.merge(db_chunk)

                db.commit()

            await broadcast_progress(session_id, {
                "stage": "completed",
                "percent": 100,
                "message": "Research report generated and saved.",
                "report": report
            })

        except Exception as e:
            logger.exception(f"Pipeline error for session {session_id}: {e}")
            session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
            if session:
                session.status = "failed"
                session.error_message = str(e)
                session.progress_message = f"Error during research: {e}"
                db.commit()
            await broadcast_progress(session_id, {
                "stage": "failed",
                "percent": 0,
                "error": str(e),
                "message": f"Pipeline failure: {e}"
            })
        finally:
            db.close()

    async def _update_session_progress(self, db: Session, session_id: str, status: str, percent: int, message: str):
        session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
        if session:
            session.status = status
            session.progress_percent = percent
            session.progress_message = message
            db.commit()
        await broadcast_progress(session_id, {
            "stage": status,
            "percent": percent,
            "message": message
        })

orchestrator = ResearchOrchestrator()
