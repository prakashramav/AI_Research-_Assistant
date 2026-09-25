from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.db.database import get_db
from backend.app.db.models import ResearchSession
from backend.app.services.vector_store import vector_store

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.get("", response_model=List[Dict[str, Any]])
def list_sessions(limit: int = 50, db: Session = Depends(get_db)):
    """List all previous research sessions with metadata and summary."""
    sessions = (
        db.query(ResearchSession)
        .order_by(desc(ResearchSession.created_at))
        .limit(limit)
        .all()
    )
    result = []
    for s in sessions:
        report = s.get_report()
        summary = ""
        if report and "executive_summary" in report:
            summary = report["executive_summary"][:160] + "..."

        result.append({
            "id": s.id,
            "topic": s.topic,
            "status": s.status,
            "progress_percent": s.progress_percent,
            "executive_summary_preview": summary,
            "sources_count": len(s.sources),
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        })
    return result

@router.delete("/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    """Delete a research session and remove its stored vectors."""
    session = db.query(ResearchSession).filter(ResearchSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()

    # Clean up local vector files
    await vector_store.delete_session(session_id)

    return {"message": "Session deleted successfully", "id": session_id}
