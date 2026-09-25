# Synthesia — AI Research Assistant

> An autonomous, multi-source research engine that turns complex topics into structured, editorial-grade research reports with verifiable citations, source comparisons, contradiction mapping, and grounded RAG follow-up.

---

## Why I Built This (The Problem)

Whenever you use current AI chatbots (ChatGPT, Perplexity, Claude) or standard search engines for serious research, you quickly hit three fundamental walls:

1. **The Single-Query Trap**: Asking a chatbot a nuanced question like *"What are the real-world failure modes and economics of autonomous coding agents?"* usually triggers a single search query with whatever phrasing you typed. Real research doesn't work that way. A human researcher breaks a topic down into architectural benchmarks, cost models, counter-arguments, and empirical studies.
2. **Hallucinated or Vague Citations**: Most AI tools output text with generic links or citations that don't actually support the specific claim being made. You end up having to re-verify every sentence manually.
3. **Ignoring Contradictions**: Different academic papers and industry reports disagree. Most AI summaries smooth over disagreements into a bland, agreeable compromise rather than explicitly surfacing where and why the experts disagree.
4. **The "Chat Bubble Soup" UI**: Research isn't a back-and-forth chat conversation. It’s an editorial document that deserves proper typography, clear evidence blocks, comparison tables, and a quiet space to interrogate the findings.

---

## What This Solves

Synthesia is designed to behave like a diligent research analyst:

- **Breaks queries down strategically**: It never searches your prompt verbatim. It formulates 3–6 distinct research sub-queries spanning technical mechanisms, benchmarks, trade-offs, and counter-perspectives.
- **Synthesizes multiple primary sources**: Searches across parallel streams, extracts clean article text (stripping ads and boilerplate), chunks the content, and embeds it into a local vector store.
- **Explicitly surfaces contradictions**: Identifies tensions in the literature (*Perspective Alpha vs. Perspective Beta*) so you can see where sources disagree.
- **Verifiable superscript citations**: Every key finding and piece of evidence links directly to a source with small superscript numbers (`[1]`, `[2]`). Hovering over or clicking a citation opens a detailed card with the exact quote, domain, and primary link.
- **Strictly grounded follow-up Q&A**: Once a report is generated, you can ask follow-up questions at the bottom of the page. The backend queries the session's vector store and answers strictly from the retrieved text, refusing to speculate without evidence.
- **Research Library**: All sessions are persisted to SQLite and browsable in a sidebar like a personal research archive.

---

## How It Works (Under the Hood)

Here is the 5-stage pipeline executing behind every research request:

```
[ User Prompt ]
       │
       ▼
1. Query Planning ───────► Gemini breaks topic into 3-6 targeted sub-queries
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
5. Structured Synthesis ──► Gemini generates strict JSON report (Consensus, Key Findings,
       │                    Stance Matrix, Evidence, Contradictions, References)
       ▼
[ Editorial Report & Grounded RAG Chat ]
```

### 1. Query Planning
Instead of searching your raw sentence, the LLM analyzes the topic and decomposes it into distinct angles:
- *Core definitions and current state-of-the-art*
- *Empirical benchmarks and real-world metrics*
- *Trade-offs, failure modes, and open debates*
- *Economic, legal, or policy implications*

### 2. Multi-Source Search & Deduplication
The planned queries execute concurrently against the search provider (Tavily, Serper, or Bing). Results are filtered and deduplicated by normalized domain and URL so you don't get redundant hits.

### 3. Boilerplate Stripping & Extraction
Raw HTML pages are parsed with BeautifulSoup to strip out navigation menus, scripts, ads, and footers. The clean body text is truncated to a reasonable token budget and sliced into overlapping semantic chunks.

### 4. Zero-Cost Local Vector Storage
Rather than requiring paid Pinecone, Weaviate, or OpenAI embedding infrastructure, the app implements a local vector store using `scikit-learn`'s TF-IDF vectorizer and cosine similarity. It runs entirely on your local machine, persists to disk, and automatically rehydrates from SQLite if needed. 
*(If you do want to plug in Pinecone or Weaviate later, the base class `BaseVectorStore` makes it a one-file change).*

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
| **LLM** | Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`) | Query planning, report synthesis, and RAG Q&A |
| **Search** | Tavily / Serper / Bing | Parallel web search (configurable via `.env`) |
| **Vector Store** | Local TF-IDF + Cosine Similarity | Lightweight local vector search with no cloud dependencies |
| **Database** | SQLite via SQLAlchemy | Storing sessions, sources, chunks, and follow-up chat messages |

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
GEMINI_API_KEY=AIzaSy...
SEARCH_API_KEY=tvly-...
SEARCH_PROVIDER=tavily
```
*(Note: If you leave the keys empty, the app runs in intelligent **Mock Mode** so you can test all UI features and the entire pipeline without paid API keys).*

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

You don't need to burn API credits just to see how the app looks and feels. When you first launch the app, a pre-seeded, verified research session is automatically loaded:

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
  - Backend: deploy with `backend/Dockerfile` and attach a persistent volume to `/app/data`.
  - Frontend: deploy with `frontend/Dockerfile` and set `NEXT_PUBLIC_API_URL` to your backend URL.

For detailed instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
