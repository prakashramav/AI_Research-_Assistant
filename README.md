# Synthesia — AI Research Assistant

> An autonomous, multi-source research engine that turns complex inquiries into structured, editorial-grade reports with verifiable citations, source comparison matrices, contradiction mapping, and grounded RAG follow-up.

---

## Why I Built This (The Problem)

Whenever you use standard AI chatbots (ChatGPT, Perplexity, Claude) or web search engines for serious academic or technical research, you quickly hit several fundamental limitations:

1. **The Single-Query Trap**: Asking a chatbot a nuanced question like *"What are the real-world failure modes and economics of autonomous coding agents?"* usually triggers a single search query based on your exact phrasing. Real research requires decomposing a subject into empirical benchmarks, cost profiles, architectural trade-offs, and counter-perspectives.
2. **Hallucinated or Vague Citations**: Most AI summaries generate paragraphs with superficial links or citations that do not directly substantiate the claims being made, forcing manual re-verification of every assertion.
3. **Ignoring Contradictions**: Experts and research papers frequently disagree. Most LLM interfaces smooth over disagreements into a bland, agreeable compromise rather than explicitly highlighting where and why the literature conflicts.
4. **The "Chat Bubble Soup" UI**: Serious research is not a casual messaging dialogue. It is an editorial document that deserves structured typography, evidence blockquotes, comparison tables, and a dedicated space for grounded follow-up interrogation.

---

## What This Solves

Synthesia behaves like an autonomous research analyst:

- **Strategic Query Planning**: Never searches your prompt verbatim. It formulates 3–6 distinct research sub-queries spanning technical mechanisms, benchmarks, trade-offs, and counter-perspectives using Google Gemini.
- **Multi-Source Web Intelligence**: Concurrently queries search engines (Tavily, Serper, or Bing), parses page bodies, strips scripts and boilerplate, and deduplicates sources by URL and domain.
- **Explicit Contradiction Mapping**: Directly surfaces empirical tensions (*Perspective Alpha vs. Perspective Beta*) across competing findings.
- **Verifiable Superscript Citations**: Every key finding and piece of evidence links to a source with small superscript tags (`[1]`, `[2]`). Hovering or clicking a citation opens a detailed popover card or slide-over drawer with the exact quote, domain, and external link.
- **Strictly Grounded Follow-Up Q&A (RAG)**: An embedded query console below the report retrieves relevant chunks from the session's vector store, answering strictly from documented evidence and refusing to speculate.
- **Dual Database Flexibility**: Supports local **SQLite** out-of-the-box or cloud **PostgreSQL** (tested with Supabase and Neon) for team/production persistence.

---

## How It Works (The 5-Stage Pipeline)

```
[ User Inquiry ]
       │
       ▼
1. Query Planning ───────► Gemini decomposes topic into 3-6 targeted search vectors
       │
       ▼
2. Multi-Source Search ──► Parallel searches (Tavily/Serper/Bing) + URL deduplication
       │
       ▼
3. Extraction & Chunking ─► Cleans HTML body, strips boilerplate, chunks text
       │
       ▼
4. Local Vector Indexing ─► TF-IDF + Cosine similarity vectors (zero paid infra)
       │
       ▼
5. Structured Synthesis ──► Gemini outputs strict JSON schema (Consensus, Findings,
       │                    Stance Matrix, Evidence, Contradictions, Bibliography)
       ▼
[ Editorial Report & Grounded RAG Follow-Up ]
```

### 1. Query Planning
Instead of searching your raw sentence, Google Gemini analyzes the topic and decomposes it into distinct angles:
- *Core definitions, technical mechanisms, and current state-of-the-art*
- *Empirical benchmarks, real-world data, and performance comparisons*
- *Contrasting viewpoints, critical trade-offs, and open debates*
- *Economic, legal, or policy implications*

### 2. Multi-Source Search & Deduplication
The planned queries execute concurrently against the search provider (Tavily, Serper, or Bing). Results are filtered and deduplicated by normalized domain and URL to eliminate redundancy.

### 3. Boilerplate Stripping & Extraction
Raw HTML pages are parsed with BeautifulSoup to strip out navigation menus, scripts, advertisements, and footers. The clean body text is truncated to a reasonable token budget and sliced into overlapping semantic chunks.

### 4. Zero-Cost Local Vector Storage
Rather than requiring paid external vector databases, the app implements a local vector store using `scikit-learn`'s TF-IDF vectorizer and cosine similarity. It runs entirely on your local machine, persists to disk, and automatically rehydrates from the database if needed.
*(If you want to plug in Pinecone or Weaviate later, the base class `BaseVectorStore` makes it a one-file change).*

### 5. Structured JSON Synthesis
The extracted sources are fed to Google Gemini with strict instructions to output structured JSON adhering to an exact schema (Executive Summary, Key Findings, Source Comparison Matrix, Evidence, Contradictions, and Bibliography). This allows the frontend to render distinct, readable components rather than a wall of markdown.

### 6. Real-Time Streaming via Server-Sent Events (SSE)
Instead of showing a generic loading spinner, the app opens an SSE stream (`/api/research/{session_id}/events`). You see the actual sub-queries being generated, which sources are being read, and the real percentage progress.

---

## Design Philosophy

To avoid the generic *"purple gradient AI dashboard"* look, the interface is designed like an editorial academic piece:
- **Palette**: Warm off-white canvas (`#fbf9f5`), charcoal text (`#1c1b18`), quiet stone borders, and deep terracotta ink accents.
- **Typography**: Editorial serif headings (`Lora`) paired with crisp, readable body text (`Inter`).
- **Layout**: A readable ~760px column for the report body, with generous line heights and distinct visual sections for key findings, evidence quotes, and source comparison tables.
- **Citation Interactions**: Clickable superscript numbers (`[1]`, `[2]`) that open hover cards or slide-over drawers with full excerpt text and source links.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router, JavaScript) | Editorial document UI, SSE streaming listener, interactive citation popovers |
| **Styling** | Tailwind CSS | Custom warm editorial palette & responsive layouts |
| **Backend** | FastAPI (Python) | Async endpoints, `BackgroundTasks`, and SSE `StreamingResponse` |
| **LLM** | Google Gemini API (`gemini-2.5-flash`) | Query planning, report synthesis, and RAG Q&A |
| **Search** | Tavily / Serper / Bing | Parallel web search (configurable via `.env`) |
| **Vector Store** | Local TF-IDF + Cosine Similarity | Lightweight local vector search with no cloud dependencies |
| **Database** | PostgreSQL (Supabase / Neon) or SQLite | Storing sessions, sources, chunks, and follow-up chat messages |

---

## Project Structure

```
AI_Research_Assistant/
├── backend/
│   └── app/
│       ├── config.py              # Environment configuration & provider detection
│       ├── main.py                # FastAPI app, CORS, lifespan startup & seed
│       ├── db/
│       │   ├── database.py        # SQLAlchemy engine (supports PostgreSQL & SQLite)
│       │   ├── models.py          # Session, Source, Chunk, and ChatMessage models
│       │   └── seed.py            # Comprehensive exemplar report fixture
│       ├── services/
│       │   ├── search.py          # Tavily, Serper, Bing & mock search provider
│       │   ├── extraction.py      # HTML parsing, boilerplate stripping, chunking
│       │   ├── vector_store.py    # Extensible BaseVectorStore & LocalVectorStore
│       │   ├── synthesis.py       # Google Gemini API prompt orchestration
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
├── DEPLOYMENT.md                  # Complete deployment guide (Docker, Railway, Render)
├── docker-compose.yml             # Container orchestration
└── README.md
```

---

## Quickstart (Run Locally)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/prakashramav/AI_Research-_Assistant.git
cd AI_Research-_Assistant
```

Create your `.env` file in the root directory:
```bash
cp .env.example .env
```

Add your API keys in `.env`:
```env
# Google Gemini API Key (Get free at https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...

# Search API Key (Get free 1,000 searches/mo at https://tavily.com/)
SEARCH_API_KEY=tvly-...
SEARCH_PROVIDER=tavily

# Database: SQLite (default) or PostgreSQL (e.g. Supabase / Neon)
DATABASE_URL=sqlite:///./research_assistant.db
# DATABASE_URL=postgresql://user:password@host:5432/postgres

VECTOR_DB_PATH=./vector_store
MOCK_MODE=false
GEMINI_MODEL=gemini-2.5-flash
```

*(Note: If you leave the keys empty, the app runs in intelligent **Mock Mode** so you can test all UI features and the entire pipeline without API keys).*

---

### 2. Run the Backend (FastAPI)

```powershell
# 1. Create and activate a Python virtual environment:
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # On Windows
# source .venv/bin/activate     # On macOS/Linux

# 2. Install dependencies:
pip install -r backend/requirements.txt

# 3. Start the FastAPI server on port 8000:
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API docs will be live at `http://127.0.0.1:8000/docs`.*

---

### 3. Run the Frontend (Next.js)

Open a new terminal window:
```powershell
cd frontend
npm install
npm run dev -- -p 3000
```
Open **`http://localhost:3000`** in your browser.

---

## Inspecting the Pre-Seeded Exemplar Report

You don't need to spend API credits just to see how the app looks and feels. When you first launch the app, a pre-seeded research session is automatically loaded:

- **Topic**: *"Autonomous AI Agents in Production Software Engineering: Benchmarks, Failure Modes, and Economic Viability"*
- **Direct Link**: `http://localhost:3000/research/seed-production-ai-agents-2026`
- **What to try**:
  1. Hover over the citations `[1]`, `[2]`, `[3]` in the Executive Synthesis.
  2. Inspect the **Source Comparison Matrix** (evaluating Princeton SWE-bench, ACM, IEEE Software, Gartner, and Stanford CodeX).
  3. Review the **Contradictions** section contrasting autonomous PR merges vs. human code review.
  4. Scroll down to the **Inquire into Findings** box and ask: *"What causes agent reasoning failure after 45k tokens?"* to test the grounded RAG.

---

## Deployment

The repository includes production Dockerfiles and a `docker-compose.yml` for turnkey deployment:

- **Single VPS (Docker Compose)**:
  ```bash
  docker compose up -d --build
  ```
- **Cloud PaaS (Railway / Render)**:
  - Backend: deploy with `backend/Dockerfile` and attach a persistent volume to `/app/data` (or link to a PostgreSQL database).
  - Frontend: deploy with `frontend/Dockerfile` and set `NEXT_PUBLIC_API_URL` to your backend URL.

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
