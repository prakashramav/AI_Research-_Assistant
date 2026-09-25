import uuid
from datetime import datetime, timedelta
from backend.app.db.database import SessionLocal, Base, engine
from backend.app.db.models import ResearchSession, ResearchSource, ResearchChunk, ChatMessage
from backend.app.services.vector_store import vector_store

SEEDED_SESSION_ID = "seed-production-ai-agents-2026"

SAMPLE_REPORT = {
    "executive_summary": (
        "Empirical evaluations of autonomous AI agents in software engineering indicate a profound transition from basic code-completion "
        "to multi-step planning and repository-scale refactoring [1]. While frontier benchmark scores have advanced from 13.8% to over 54% "
        "on SWE-bench benchmarks [2], production telemetries uncover severe trade-offs: runaway token expenditures, non-deterministic regression risks, "
        "and contextual degradation beyond 30-turn executions [3]. Consequently, leading technology organizations are favoring constrained, "
        "human-in-the-loop workflows over uninhibited autonomous execution for core mission-critical codebases [4]."
    ),
    "key_findings": [
        {
            "point": "Frontier agentic architectures (incorporating tool calling, test-driven execution loops, and static analysis verification) achieve a 3.8x higher task completion rate compared to single-pass prompting.",
            "supporting_source_ids": ["1", "2"]
        },
        {
            "point": "Over 68% of production agent failures stem from context drift, hallucinated internal package APIs, and compounding tool error cascades rather than pure code-generation syntax faults.",
            "supporting_source_ids": ["2", "3"]
        },
        {
            "point": "Cost-benefit parity: Unconstrained agentic attempts average $4.20 per resolved GitHub issue versus $0.45 for guided, scoped diff generation, making speculative autonomous runs economically questionable for mid-tier tasks.",
            "supporting_source_ids": ["3", "4"]
        },
        {
            "point": "Hybrid retrieval schemes combining Abstract Syntax Tree (AST) symbol graphs with dense vector search outperform pure vector similarity by 42% in retrieval precision for relevant module dependencies.",
            "supporting_source_ids": ["1", "5"]
        }
    ],
    "source_comparison": [
        {
            "source": "Princeton NLP & SWE-bench Working Group",
            "stance": "Rigorous academic benchmark; highlights reproducible evaluation metrics while warning against test set contamination.",
            "credibility_notes": "De facto standard industry benchmark with verified real-world GitHub issues and automated containerized test suites."
        },
        {
            "source": "ACM Transactions on Software Engineering",
            "stance": "Empirical systems analysis; cautions that pass rates on synthetic or public repos do not reflect enterprise monorepo complexities.",
            "credibility_notes": "Peer-reviewed research across 12 multinational engineering organizations and 140,000 merged commits."
        },
        {
            "source": "IEEE Software & Architecture Review",
            "stance": "Engineering pragmatism; examines token consumption, compute latency budgets, and security implications of arbitrary tool execution.",
            "credibility_notes": "Authored by veteran systems architects specializing in compiler construction and developer tooling."
        },
        {
            "source": "Gartner Emerging Tech Strategic Briefing",
            "stance": "Macroeconomic & enterprise perspective; projects 75% adoption of assisted workflows but only 12% autonomous adoption by 2028.",
            "credibility_notes": "Extensive quantitative survey of Fortune 500 Chief Technology Officers and VP of Engineering leads."
        },
        {
            "source": "Stanford CodeX AI & Law Initiative",
            "stance": "Governance & copyright scrutiny; assesses licensing liabilities, code provenance, and vulnerability leakage in AI-authored PRs.",
            "credibility_notes": "Interdisciplinary legal-technical panel on software licensing and automated code generation risks."
        }
    ],
    "evidence": [
        {
            "claim": "Resolution rate improvements on realistic SWE tasks",
            "quote_or_paraphrase": "Top-tier agent scaffold architectures achieved 54.2% resolution on the SWE-bench Verified subset, compared to 4.8% for naive zero-shot baseline models.",
            "source_id": "1"
        },
        {
            "claim": "Context window degradation threshold",
            "quote_or_paraphrase": "Agent reasoning fidelity drops precipitously past 45k tokens of accumulated execution trace, resulting in repetitive command loops and lost constraints.",
            "source_id": "2"
        },
        {
            "claim": "Economic cost differential",
            "quote_or_paraphrase": "Median token consumption per resolved issue reached 2.4 million tokens ($4.20 per attempt), necessitating aggressive early-stopping heuristics.",
            "source_id": "3"
        }
    ],
    "contradictions": [
        {
            "topic": "Feasibility of Unattended Autonomous Code Merging",
            "position_a": "Scaffold vendors and frontier lab research assert that with multi-agent debate and automated test-passing validation, PRs can be merged directly into production without manual human inspection.",
            "position_b": "Enterprise engineering leaders and empirical studies document that automated tests frequently pass despite silent logic regressions or architectural drift, making senior code review indispensable.",
            "sources": ["1", "2"]
        },
        {
            "topic": "AST Symbol Indexing vs Pure Dense Vector Embeddings for Code RAG",
            "position_a": "Vector database advocates argue that modern high-dimensional dense embeddings capture cross-repository intent and conceptual relationships better than rigid syntax parsers.",
            "position_b": "Compiler and language server researchers prove that vector search alone misses precise caller-callee hierarchies and type definitions, requiring deterministic AST graph traversal.",
            "sources": ["2", "5"]
        }
    ],
    "references": [
        {
            "id": "1",
            "title": "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",
            "url": "https://arxiv.org/abs/2310.06770",
            "publisher": "arXiv / Princeton University",
            "accessed_date": "2026-09-25"
        },
        {
            "id": "2",
            "title": "Large Language Models in Software Engineering: A Systematic Field Study of Failures and Triumphs",
            "url": "https://dl.acm.org/doi/10.1145/3639478",
            "publisher": "ACM Transactions on Software Engineering",
            "accessed_date": "2026-09-25"
        },
        {
            "id": "3",
            "title": "The Hidden Costs of Agentic Autonomy: Token Budgets and Latency Profiles in CI/CD",
            "url": "https://spectrum.ieee.org/computing/software/agentic-cicd-costs",
            "publisher": "IEEE Software",
            "accessed_date": "2026-09-25"
        },
        {
            "id": "4",
            "title": "Market Trends: The Realities of Autonomous AI Software Engineers in Enterprise IT",
            "url": "https://gartner.com/en/documents/ai-software-engineering-2026",
            "publisher": "Gartner Research",
            "accessed_date": "2026-09-25"
        },
        {
            "id": "5",
            "title": "Code Provenance, AST Graph Traversal, and Vector Search Complementarity",
            "url": "https://law.stanford.edu/codex/ast-vs-vector-provenance",
            "publisher": "Stanford CodeX",
            "accessed_date": "2026-09-25"
        }
    ]
}

SOURCES_DATA = [
    {
        "id": "1",
        "title": "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?",
        "url": "https://arxiv.org/abs/2310.06770",
        "domain": "arxiv.org",
        "publisher": "arXiv / Princeton University",
        "snippet": "SWE-bench is an evaluation framework consisting of 2,294 software engineering problems pulled from real GitHub issues. Models must formulate a solution using codebase navigation, patch generation, and test execution.",
        "content": "SWE-bench evaluates models on end-to-end task completion. We examine how agent scaffolds utilizing terminal commands, ripgrep, and pytest feedback loop navigate complex repos. State of the art has improved from 4.8% to 54.2% on verified subsets.",
        "stance": "Rigorous academic benchmark; highlights reproducible evaluation metrics while warning against test set contamination.",
        "credibility_notes": "De facto standard industry benchmark with verified real-world GitHub issues."
    },
    {
        "id": "2",
        "title": "Large Language Models in Software Engineering: A Systematic Field Study",
        "url": "https://dl.acm.org/doi/10.1145/3639478",
        "domain": "acm.org",
        "publisher": "ACM Transactions on Software Engineering",
        "snippet": "In this extensive field study across 12 software firms, we catalog failure modes of AI agents. Context drift, hallucinated internal interfaces, and tool loops accounted for 68% of failures.",
        "content": "Our analysis reveals that as execution traces exceed 45,000 tokens, agent reasoning fidelity degrades markedly. Furthermore, tests often pass by inadvertently bypassing assertion edge cases rather than resolving root causes.",
        "stance": "Empirical systems analysis; cautions that pass rates on synthetic or public repos do not reflect enterprise monorepo complexities.",
        "credibility_notes": "Peer-reviewed research across 12 multinational engineering organizations."
    },
    {
        "id": "3",
        "title": "The Hidden Costs of Agentic Autonomy: Token Budgets and Latency Profiles",
        "url": "https://spectrum.ieee.org/computing/software/agentic-cicd-costs",
        "domain": "spectrum.ieee.org",
        "publisher": "IEEE Software",
        "snippet": "Measuring financial and compute overhead of autonomous developer agents. Median token burn per issue reached 2.4 million tokens ($4.20 per attempt).",
        "content": "A detailed architectural breakdown of token economics in agentic programming. Latencies of 8-15 minutes per task and compute spikes mean that without scoped retrieval and deterministic linters, autonomous pipelines incur prohibitive cloud costs.",
        "stance": "Engineering pragmatism; examines token consumption, compute latency budgets, and security implications.",
        "credibility_notes": "Authored by veteran systems architects specializing in compiler construction."
    },
    {
        "id": "4",
        "title": "Market Trends: The Realities of Autonomous AI Software Engineers",
        "url": "https://gartner.com/en/documents/ai-software-engineering-2026",
        "domain": "gartner.com",
        "publisher": "Gartner Research",
        "snippet": "Enterprise leaders are adopting augmented developer tools while remaining cautious about unattended autonomous PR merging.",
        "content": "By 2028, 75% of enterprise software engineers will use AI developer tools for guided refactoring, documentation, and unit test generation. However, fewer than 12% of enterprises plan to allow unattended autonomous merging into production main branches.",
        "stance": "Macroeconomic & enterprise perspective; projects 75% adoption of assisted workflows but only 12% autonomous adoption.",
        "credibility_notes": "Extensive quantitative survey of Fortune 500 CTOs and VPs of Engineering."
    },
    {
        "id": "5",
        "title": "Code Provenance, AST Graph Traversal, and Vector Search Complementarity",
        "url": "https://law.stanford.edu/codex/ast-vs-vector-provenance",
        "domain": "stanford.edu",
        "publisher": "Stanford CodeX",
        "snippet": "Combining Language Server Protocol (LSP) AST indices with dense semantic vector search yields a 42% improvement in context relevance.",
        "content": "Pure vector similarity frequently matches comments or superficially similar variable names while missing the exact class hierarchy. Integrating Tree-sitter or LSP symbol navigation guarantees deterministic caller-callee relationship retrieval.",
        "stance": "Governance & copyright scrutiny; assesses licensing liabilities and code provenance.",
        "credibility_notes": "Interdisciplinary legal-technical panel on software licensing and code generation."
    }
]

def seed_database():
    """Initializes tables and seeds an exemplary research session if not already present."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(ResearchSession).filter(ResearchSession.id == SEEDED_SESSION_ID).first()
        if existing:
            return existing.id

        session = ResearchSession(
            id=SEEDED_SESSION_ID,
            topic="Autonomous AI Agents in Production Software Engineering: Benchmarks, Failure Modes, and Economic Viability",
            status="completed",
            progress_message="Research synthesis complete.",
            progress_percent=100,
            created_at=datetime.utcnow() - timedelta(hours=2),
            updated_at=datetime.utcnow() - timedelta(hours=1),
        )
        session.set_report(SAMPLE_REPORT)
        db.add(session)

        # Seed sources
        chunks_to_index = []
        for s in SOURCES_DATA:
            src_id = f"{SEEDED_SESSION_ID}_{s['id']}"
            db_source = ResearchSource(
                id=src_id,
                session_id=SEEDED_SESSION_ID,
                title=s["title"],
                url=s["url"],
                domain=s["domain"],
                publisher=s["publisher"],
                snippet=s["snippet"],
                content=s["content"],
                accessed_date="2026-09-25",
                stance=s.get("stance", ""),
                credibility_notes=s.get("credibility_notes", ""),
            )
            db.add(db_source)

            # Seed chunks
            chunk_obj = {
                "id": f"{SEEDED_SESSION_ID}_{s['id']}_0",
                "session_id": SEEDED_SESSION_ID,
                "source_id": s["id"],
                "source_url": s["url"],
                "source_title": s["title"],
                "chunk_index": 0,
                "text": f"[{s['title']}] ({s['url']})\n{s['content']}",
            }
            chunks_to_index.append(chunk_obj)
            db_chunk = ResearchChunk(
                id=chunk_obj["id"],
                session_id=SEEDED_SESSION_ID,
                source_id=chunk_obj["source_id"],
                source_url=chunk_obj["source_url"],
                source_title=chunk_obj["source_title"],
                chunk_index=0,
                text=chunk_obj["text"],
            )
            db.add(db_chunk)

        # Seed initial Q&A
        q1 = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=SEEDED_SESSION_ID,
            role="user",
            content="What are the primary technical causes of agent failures during complex multi-step coding tasks?",
            created_at=datetime.utcnow() - timedelta(minutes=45)
        )
        a1 = ChatMessage(
            id=str(uuid.uuid4()),
            session_id=SEEDED_SESSION_ID,
            role="assistant",
            content=(
                "According to the systematic field analysis in [2], over 68% of autonomous agent failures are caused by "
                "contextual drift as the execution trace exceeds 45,000 tokens, compounding tool execution errors, and hallucinated "
                "internal API signatures rather than pure syntax faults. Furthermore, test feedback loops sometimes pass spuriously "
                "by circumventing assertion edge cases instead of resolving root defects [2]."
            ),
            created_at=datetime.utcnow() - timedelta(minutes=44)
        )
        a1.set_citations([SAMPLE_REPORT["references"][1]])

        db.add(q1)
        db.add(a1)
        db.commit()

        # Index seeded chunks into vector store synchronously
        import asyncio
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(vector_store.add_chunks(SEEDED_SESSION_ID, chunks_to_index))
            else:
                loop.run_until_complete(vector_store.add_chunks(SEEDED_SESSION_ID, chunks_to_index))
        except Exception:
            pass

        return SEEDED_SESSION_ID
    finally:
        db.close()

if __name__ == "__main__":
    sid = seed_database()
    print(f"Seeded research session ready: {sid}")
