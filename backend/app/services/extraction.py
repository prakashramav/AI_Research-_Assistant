import re
import uuid
import logging
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

class ExtractionService:
    def __init__(self, max_chars_per_source: int = 15000, chunk_size: int = 1000, chunk_overlap: int = 150):
        self.max_chars_per_source = max_chars_per_source
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    async def extract_content_from_url(self, client: httpx.AsyncClient, url: str) -> Optional[str]:
        """Fetch page HTML and extract cleaned body text, stripping boilerplate."""
        try:
            resp = await client.get(url, headers=HEADERS, timeout=8.0, follow_redirects=True)
            if resp.status_code != 200:
                return None
            
            html = resp.text
            soup = BeautifulSoup(html, "html.parser")

            # Remove unwanted tags
            for elem in soup(["script", "style", "nav", "footer", "header", "aside", "form", "noscript", "svg", "button"]):
                elem.decompose()

            # Find main content container if available
            main_elem = soup.find("article") or soup.find("main") or soup.find("div", {"id": re.compile(r"content|main", re.I)}) or soup.body
            if not main_elem:
                return None

            text = main_elem.get_text(separator="\n")
            # Normalize whitespace
            lines = [line.strip() for line in text.splitlines() if line.strip()]
            cleaned_text = "\n\n".join(lines)

            # Truncate to reasonable character budget
            return cleaned_text[:self.max_chars_per_source] if cleaned_text else None
        except Exception as e:
            logger.debug(f"Failed to fetch content from {url}: {e}")
            return None

    async def process_sources(self, raw_sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Processes a list of raw search sources:
        Fetches full content where possible, falling back to snippet/raw_content.
        """
        processed = []
        async with httpx.AsyncClient(timeout=10.0) as client:
            for idx, src in enumerate(raw_sources, start=1):
                url = src.get("url", "")
                existing_raw = src.get("raw_content", "") or src.get("snippet", "")
                
                content = None
                # If raw_content is already rich (e.g. from Tavily or mock), use it directly
                if existing_raw and len(existing_raw) > 300:
                    content = existing_raw[:self.max_chars_per_source]
                elif url and url.startswith("http"):
                    content = await self.extract_content_from_url(client, url)

                if not content:
                    content = existing_raw or f"Summary for {src.get('title', 'source')}: {src.get('snippet', '')}"

                processed.append({
                    "id": str(idx),
                    "source_id": str(idx),
                    "title": src.get("title", f"Source {idx}"),
                    "url": url,
                    "domain": src.get("domain", ""),
                    "publisher": src.get("publisher") or src.get("domain") or "Web",
                    "snippet": src.get("snippet", ""),
                    "content": content,
                    "accessed_date": "2026-09-25",
                })
        return processed

    def chunk_sources(self, session_id: str, sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Chunks source content into overlapping text segments for vector retrieval.
        """
        chunks = []
        for src in sources:
            source_id = str(src.get("id") or src.get("source_id", "1"))
            text = src.get("content", "")
            title = src.get("title", "")
            url = src.get("url", "")

            if not text:
                continue

            # Simple sliding window chunker
            start = 0
            text_len = len(text)
            chunk_idx = 0

            while start < text_len:
                end = min(start + self.chunk_size, text_len)
                chunk_str = text[start:end].strip()

                if len(chunk_str) > 50:  # Skip trivial micro-chunks
                    chunks.append({
                        "id": f"{session_id}_{source_id}_{chunk_idx}",
                        "session_id": session_id,
                        "source_id": source_id,
                        "source_url": url,
                        "source_title": title,
                        "chunk_index": chunk_idx,
                        "text": f"[{title}] ({url})\n{chunk_str}",
                    })
                    chunk_idx += 1

                if end == text_len:
                    break
                start += (self.chunk_size - self.chunk_overlap)

        return chunks

extraction_service = ExtractionService()
