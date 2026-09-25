import asyncio
import json
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.app.db.database import get_db
from backend.app.db.models import ResearchSession, ChatMessage
from backend.app.services.orchestrator import orchestrator, subscribe_progress, unsubscribe_progress
from backend.app.services.vector_store import vector_store
from backend.app.services.synthesis import synthesis_service

router = APIRouter(prefix="/api/research", tags=["research"])

class CreateResearchRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=500, description="Research topic or question")

class FollowUpRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=1000, description="Follow-up question")

@router.post("", status_code=202)
async def start_research(payload: CreateResearchRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Kicks off an asynchronous research pipeline.
    Returns session_id immediately so frontend can listen via SSE or poll status.
    """
    session_id = str(uuid.uuid4())
    session = ResearchSession(
        id=session_id,
        topic=payload.topic.strip(),
        status="planning",
        progress_message="Formulating research strategy and sub-queries...",
        progress_percent=5
    )
    db.add(session)
    db.commit()

    # Run research pipeline in background
    background_tasks.add_task(orchestrator.run_pipeline, session_id, payload.topic.strip())

    return {
        "session_id": session_id,
        "topic": session.topic,
        "status": session.status,
        "message": "Research job initiated."
    }

@router.get("/{session_id}/status")
def get_research_status(session_id: str, db: Session = Depends(get_db)):
    """Fetch current progress status of a research job."""
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")
    return {
        "session_id": session.id,
        "topic": session.topic,
        "status": session.status,
        "progress_percent": session.progress_percent,
        "progress_message": session.progress_message,
        "error_message": session.error_message,
        "is_completed": session.status == "completed",
    }

@router.get("/{session_id}/events")
async def stream_research_events(session_id: str, db: Session = Depends(get_db)):
    """
    Server-Sent Events (SSE) stream providing real-time research steps
    (e.g., searching sub-queries, reading sources, synthesizing report).
    """
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")

    async def event_generator():
        # Yield current initial state
        initial_event = {
            "stage": session.status,
            "percent": session.progress_percent,
            "message": session.progress_message,
        }
        yield f"data: {json.dumps(initial_event)}\n\n"

        if session.status in ("completed", "failed"):
            return

        q = subscribe_progress(session_id)
        try:
            while True:
                try:
                    data = await asyncio.wait_for(q.get(), timeout=20.0)
                    yield f"data: {json.dumps(data)}\n\n"
                    if data.get("stage") in ("completed", "failed"):
                        break
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat ping
                    yield f": heartbeat\n\n"
        finally:
            unsubscribe_progress(session_id, q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@router.get("/{session_id}")
def get_research_session(session_id: str, db: Session = Depends(get_db)):
    """Fetch completed research report, sources, and prior chat history."""
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")

    result = session.to_dict()
    result["messages"] = [m.to_dict() for m in session.messages]
    return result

@router.post("/{session_id}/ask")
async def ask_follow_up(session_id: str, payload: FollowUpRequest, db: Session = Depends(get_db)):
    """
    RAG Follow-up endpoint.
    Retrieves top chunks for session_id from vector store and returns answer with inline citations.
    """
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Research session not found")

    if session.status != "completed":
        raise HTTPException(status_code=400, detail="Cannot ask follow-up questions until research is completed.")

    user_q = payload.question.strip()

    # 1. Retrieve top-k chunks from session's vector store
    top_chunks = await vector_store.search(session_id, user_q, top_k=5)

    # 2. Get sources metadata for citation mapping
    sources_data = [s.to_dict() for s in session.sources]

    # 3. Call synthesis service to answer strictly grounded in retrieved chunks
    ans_data = await synthesis_service.answer_follow_up(user_q, top_chunks, sources_data)

    answer_text = ans_data.get("answer", "")
    cited_ids = ans_data.get("cited_source_ids", [])

    # Map cited source IDs to full source details
    report = session.get_report() or {}
    report_refs = {str(r.get("id")): r for r in report.get("references", [])}
    
    citations = []
    for cid in cited_ids:
        cid_str = str(cid)
        if cid_str in report_refs:
            citations.append(report_refs[cid_str])
        else:
            # Fallback search in sources
            for s in sources_data:
                if s["id"].endswith(f"_{cid_str}") or s["id"] == cid_str:
                    citations.append({
                        "id": cid_str,
                        "title": s.get("title", ""),
                        "url": s.get("url", ""),
                        "publisher": s.get("publisher", ""),
                        "accessed_date": s.get("accessed_date", "")
                    })
                    break

    # Persist user question and assistant answer to DB
    user_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="user",
        content=user_q,
    )
    asst_msg = ChatMessage(
        id=str(uuid.uuid4()),
        session_id=session_id,
        role="assistant",
        content=answer_text,
    )
    asst_msg.set_citations(citations)

    db.add(user_msg)
    db.add(asst_msg)
    db.commit()

    return {
        "question": user_q,
        "answer": answer_text,
        "citations": citations,
        "chunks_used": len(top_chunks)
    }
