"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, Trash2, ArrowRight, ArrowLeft, Clock, Sparkles } from "lucide-react";
import SessionSidebar from "@/components/SessionSidebar";
import { listSessions, deleteSession } from "@/lib/api";

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await listSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to load sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (e, sessionId) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this research session?")) return;
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:pl-80 transition-all">
      <SessionSidebar isOpen={false} onClose={() => {}} />

      {/* Top Navbar */}
      <header
        className="w-full py-4 px-6 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-canvas)" }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Search</span>
        </Link>
        <h1 className="font-editorial text-base font-semibold text-[var(--text-main)]">
          Research Library Archive
        </h1>
        <div className="w-16" />
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-ink)] block mb-1">
            Archived Intelligence
          </span>
          <h2 className="font-editorial text-3xl font-bold tracking-tight text-[var(--text-main)]">
            Past Research Sessions
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Review synthesis reports, inspected evidence, and follow-up inquiry dialogues.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-[var(--text-muted)] font-mono">
            Loading archive...
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border text-xs text-[var(--text-muted)]" style={{ borderColor: "var(--border-subtle)" }}>
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No research sessions saved yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const formattedDate = s.created_at
                ? new Date(s.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "Unknown";

              return (
                <div
                  key={s.id}
                  className="p-5 rounded-xl border transition-all hover:border-[var(--accent-ink)] flex items-start justify-between gap-4 group"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <Link href={`/research/${s.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-[var(--text-muted)]">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-[var(--text-faint)]" />
                        {formattedDate}
                      </span>
                      <span>•</span>
                      <span>{s.sources_count} sources</span>
                      {s.id.startsWith("seed-") && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--accent-ink)] bg-[var(--accent-subtle)] px-1.5 py-0.2 rounded">
                          <Sparkles className="w-2.5 h-2.5" /> Exemplar
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-ink)] transition-colors">
                      {s.topic}
                    </h3>

                    {s.executive_summary_preview && (
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2 font-editorial italic">
                        "{s.executive_summary_preview}"
                      </p>
                    )}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDelete(e, s.id)}
                      title="Delete session"
                      className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-[var(--text-muted)] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/research/${s.id}`}
                      className="p-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-main)] group-hover:bg-[var(--accent-ink)] group-hover:text-white transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
