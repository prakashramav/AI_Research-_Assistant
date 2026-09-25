import abc
import os
import json
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.config import settings

class BaseVectorStore(abc.ABC):
    """
    Abstract Vector Store interface.
    Swapping this out for Pinecone, Weaviate, Chroma, or FAISS is a single-class replacement.
    """

    @abc.abstractmethod
    async def add_chunks(self, session_id: str, chunks: List[Dict[str, Any]]) -> None:
        """Store chunk dictionaries {id, text, source_id, source_title, source_url, chunk_index}."""
        pass

    @abc.abstractmethod
    async def search(self, session_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve top_k chunks for a given query in a session."""
        pass

    @abc.abstractmethod
    async def delete_session(self, session_id: str) -> None:
        """Clean up vector storage for a session."""
        pass


class LocalVectorStore(BaseVectorStore):
    """
    Local Vector Store running without paid external infra.
    Uses TF-IDF + n-gram vectorization with cosine similarity and disk persistence.
    Produces high-precision lexical and semantic matches for research documents.
    """

    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or settings.VECTOR_DB_PATH
        os.makedirs(self.storage_dir, exist_ok=True)
        # In-memory cache of session chunk vectors
        self._cache: Dict[str, Dict[str, Any]] = {}

    def _get_session_path(self, session_id: str) -> str:
        return os.path.join(self.storage_dir, f"{session_id}.json")

    async def add_chunks(self, session_id: str, chunks: List[Dict[str, Any]]) -> None:
        if not chunks:
            return

        corpus = [c["text"] for c in chunks]
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=5000,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)

        self._cache[session_id] = {
            "chunks": chunks,
            "vectorizer": vectorizer,
            "matrix": tfidf_matrix
        }

        # Persist chunks to disk
        file_path = self._get_session_path(session_id)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump({"chunks": chunks}, f, ensure_ascii=False, indent=2)

    def _ensure_session_loaded(self, session_id: str) -> bool:
        if session_id in self._cache:
            return True
        file_path = self._get_session_path(session_id)
        chunks = []
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                chunks = data.get("chunks", [])
            except Exception:
                chunks = []
        
        # If not on disk, attempt rehydration from DB
        if not chunks:
            try:
                from backend.app.db.database import SessionLocal
                from backend.app.db.models import ResearchChunk
                db = SessionLocal()
                try:
                    db_chunks = db.query(ResearchChunk).filter(ResearchChunk.session_id == session_id).all()
                    if db_chunks:
                        chunks = [
                            {
                                "id": c.id,
                                "session_id": c.session_id,
                                "source_id": c.source_id,
                                "source_url": c.source_url,
                                "source_title": c.source_title,
                                "chunk_index": c.chunk_index,
                                "text": c.text,
                            }
                            for c in db_chunks
                        ]
                finally:
                    db.close()
            except Exception:
                pass

        if not chunks:
            return False

        corpus = [c["text"] for c in chunks]
        vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            stop_words="english",
            max_features=5000,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        self._cache[session_id] = {
            "chunks": chunks,
            "vectorizer": vectorizer,
            "matrix": tfidf_matrix
        }
        return True

    async def search(self, session_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self._ensure_session_loaded(session_id):
            return []

        session_data = self._cache[session_id]
        vectorizer: TfidfVectorizer = session_data["vectorizer"]
        matrix = session_data["matrix"]
        chunks: List[Dict[str, Any]] = session_data["chunks"]

        try:
            query_vec = vectorizer.transform([query])
            similarities = cosine_similarity(query_vec, matrix).flatten()
            
            # Rank indices
            ranked_indices = np.argsort(similarities)[::-1]
            results = []
            for idx in ranked_indices[:top_k]:
                score = float(similarities[idx])
                chunk_copy = dict(chunks[idx])
                chunk_copy["similarity_score"] = round(score, 4)
                results.append(chunk_copy)
            return results
        except Exception as e:
            # Fallback to simple keyword match if vocabulary is empty
            keywords = query.lower().split()
            scored = []
            for c in chunks:
                score = sum(1 for kw in keywords if kw in c["text"].lower())
                scored.append((score, c))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [dict(c, similarity_score=0.1) for _, c in scored[:top_k]]

    async def delete_session(self, session_id: str) -> None:
        if session_id in self._cache:
            del self._cache[session_id]
        file_path = self._get_session_path(session_id)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass


# Global singleton instance of the vector store (swappable to PineconeVectorStore or WeaviateVectorStore)
vector_store: BaseVectorStore = LocalVectorStore()
