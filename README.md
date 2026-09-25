# Synthesia — AI Research Assistant

A full-stack, autonomous research application that transforms open-ended questions into comprehensive, multi-source editorial synthesis reports with inline citations, source comparison matrices, and contradiction mapping — paired with grounded RAG follow-up inquiry.

---

## Key Features

- **Document-like Editorial Reports**: Generous line-height, curated academic typography (Lora & Inter), warm off-white palette, and clear structural sections.
- **Query Planning Engine**: Breaks topics into 3–6 distinct, targeted research vectors rather than searching verbatim queries.
- **Parallel Multi-Source Search**: Concurrent querying with domain/URL deduplication. Configurable for Tavily, Serper, Bing, or offline Mock Mode.
- **Automated Text Extraction**: Cleans HTML bodies, strips boilerplate and scripts, and normalizes text into overlapping semantic fragments.
- **Local Vector Store for RAG**: High-precision semantic vector retrieval running locally without paid vector database infrastructure. Extensible base interface makes swapping in Pinecone or Weaviate a one-file change.
- **Server-Sent Events (SSE)**: Real-time streaming progress timeline showing actual sub-queries and collection statistics instead of a blank spinner.
- **Interactive Superscript Citations**: Hoverable cards and side drawers for citations (e.g., `[1]`, `[2]`) showing source snippet, author/publisher, accessed date, and outbound links.
- **Source Comparison & Stance Matrix**: Compact structured comparison of institutional stances, methodological biases, and credibility notes.
- **Contradictions & Open Debates**: Identifies tensions and conflicting empirical findings across sources (Perspective Alpha vs. Perspective Beta).
- **Grounded Follow-Up Q&A**: Answers follow-up inquiries strictly from retrieved source chunks with inline citations, refusing to speculate without evidence.
- **Research Library**: Persistent SQLite database storing past sessions, sources, chunks, and chat history.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14+ (App Router, JavaScript, Tailwind CSS, Lucide Icons) |
| **Backend** | FastAPI (Python 3.10+ / async endpoints, BackgroundTasks, SSE) |
| **LLM** | Anthropic Claude API (`claude-3-5-sonnet-20241022`) + Offline Mock Engine |
| **Search** | Tavily / Serper / Bing Web Search (configurable via `.env`) |
| **Vector Store** | Local TF-IDF Vectorizer + Cosine Similarity (`BaseVectorStore` interface) |
| **Database** | SQLite via SQLAlchemy (`ResearchSession`, `ResearchSource`, `ResearchChunk`, `ChatMessage`) |

---

## Project Structure

```
AI_Research_Assistant/
├── backend/
│   └── app/
│       ├── config.py              # Environment configuration & provider detection
│       ├── main.py                # FastAPI app, CORS, lifespan startup & seed
│       ├── db/
│       │   ├── database.py        # SQLAlchemy engine & session factory
│       │   ├── models.py          # Session, Source, Chunk, and ChatMessage models
│       │   └── seed.py            # Comprehensive exemplar report fixture
│       ├── services/
│       │   ├── search.py          # Tavily, Serper, Bing & mock search provider
│       │   ├── extraction.py      # HTML parsing, boilerplate stripping, chunking
│       │   ├── vector_store.py    # Extensible BaseVectorStore & LocalVectorStore
│       │   ├── synthesis.py       # Claude prompt orchestration & mock synthesis
│       │   └── orchestrator.py    # Multi-stage pipeline & SSE event broadcaster
│       └── routers/
│           ├── research.py        # /api/research endpoints (start, status, events, ask)
│           └── sessions.py        # /api/sessions endpoints (list, delete)
├── frontend/
│   ├── app/
│   │   ├── globals.css            # Custom editorial palette, theme tokens, fonts
│   │   ├── layout.js              # Lora & Inter Google fonts & metadata
│   │   ├── page.js                # Search console landing page & library preview
│   │   ├── history/page.js        # Dedicated research archive page
│   │   └── research/[sessionId]/  # Live SSE progress & full editorial report view
│   ├── components/
│   │   ├── SearchInput.js         # Scholarly search console with topic chips
│   │   ├── ProgressTimeline.js    # Step-by-step live pipeline progress display
│   │   ├── ReportView.js          # Master document editorial layout
│   │   ├── ExecutiveSummary.js    # High-level synthesis with citations
│   │   ├── KeyFindings.js         # Core theses with evidence badges
│   │   ├── SourceComparison.js    # Institutional stance & credibility matrix
│   │   ├── EvidenceList.js        # Verified claims & cited quotes
│   │   ├── Contradictions.js      # Conflicting viewpoints & debates
│   │   ├── ReferenceList.js       # Complete bibliography
│   │   ├── CitationPopover.js     # Hoverable card for superscript citations
│   │   ├── SourceDrawer.js        # Side drawer for inspecting full source text
│   │   ├── FollowUpChat.js        # Grounded RAG follow-up dialogue
│   │   └── SessionSidebar.js      # History library navigation sidebar
│   └── lib/
│       └── api.js                 # Frontend API client
├── .env.example                   # Sample environment configuration
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Environment Configuration
Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Optional: Provide Anthropic API Key (if omitted, high-fidelity mock synthesis runs automatically)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional: Provide Search API Key (Tavily, Serper, or Bing)
SEARCH_API_KEY=your_search_api_key_here
SEARCH_PROVIDER=tavily

# Database & Storage
DATABASE_URL=sqlite:///./research_assistant.db
VECTOR_DB_PATH=./vector_store

# Set to true to force offline mock execution without API calls
MOCK_MODE=false
```

> **Note**: If `ANTHROPIC_API_KEY` or `SEARCH_API_KEY` are not set, the app automatically enables intelligent mock fallback for testing without external API credentials.

---

### 3. Backend Setup & Run

1. Create a Python virtual environment and activate it:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install backend dependencies:
   ```bash
   pip install fastapi uvicorn pydantic sqlalchemy httpx beautifulsoup4 python-dotenv anthropic numpy scikit-learn
   ```

3. Run database initialization and seeder (optional, runs automatically on backend start):
   ```bash
   python -m backend.app.db.seed
   ```

4. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

The backend API will be available at `http://127.0.0.1:8000`.
- API Documentation (Swagger): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

---

### 4. Frontend Setup & Run

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev -- -p 3000
   ```

4. Open `http://localhost:3000` in your browser.

---

## Seeded Example Report

The application includes a pre-seeded, exhaustive research session:
- **Topic**: *"Autonomous AI Agents in Production Software Engineering: Benchmarks, Failure Modes, and Economic Viability"*
- **URL**: `http://localhost:3000/research/seed-production-ai-agents-2026`
- **Features to Inspect**:
  - Executive summary with hoverable superscript citations `[1]`, `[2]`, `[3]`.
  - Stance comparison matrix across Princeton NLP, ACM, IEEE Software, Gartner, and Stanford CodeX.
  - Side-by-side contradiction tensions on autonomous PR merging vs human review.
  - Grounded RAG Q&A with pre-loaded queries and interactive inquiry.

---

## Swapping the Vector Store

The codebase decouples vector storage through `BaseVectorStore` in [`backend/app/services/vector_store.py`](backend/app/services/vector_store.py):

```python
class BaseVectorStore(abc.ABC):
    @abc.abstractmethod
    async def add_chunks(self, session_id: str, chunks: List[Dict[str, Any]]) -> None: ...

    @abc.abstractmethod
    async def search(self, session_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]: ...

    @abc.abstractmethod
    async def delete_session(self, session_id: str) -> None: ...
```

To switch to **Pinecone**, **Weaviate**, or **Chroma**:
1. Implement `BaseVectorStore` in a new class (e.g. `PineconeVectorStore`).
2. Update the singleton instance at the bottom of `vector_store.py`:
   ```python
   vector_store: BaseVectorStore = PineconeVectorStore(api_key=...)
   ```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/research` | Initiate background research job; returns `session_id` |
| `GET` | `/api/research/{session_id}/status` | Check stage, progress percentage, and status |
| `GET` | `/api/research/{session_id}/events` | Server-Sent Events (SSE) stream for live step-by-step progress |
| `GET` | `/api/research/{session_id}` | Retrieve completed structured report, sources, and messages |
| `POST` | `/api/research/{session_id}/ask` | Grounded RAG follow-up inquiry with inline citations |
| `GET` | `/api/sessions` | List research session history |
| `DELETE` | `/api/sessions/{session_id}` | Delete session and purge indexed vectors |
| `GET` | `/api/health` | Service health status and provider configuration |
