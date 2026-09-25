"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Plus, Trash2, ChevronRight, Sparkles, Clock, Compass, X } from "lucide-react";
import { listSessions, deleteSession } from "@/lib/api";

export default function SessionSidebar({ isOpen, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

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
  }, [pathname]);

  const handleDelete = async (e, sessionId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this research session from history?")) return;
    try {
      await deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (pathname.includes(sessionId)) {
        router.push("/");
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 md:w-80 flex flex-col border-r transition-transform duration-200 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
          <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: "var(--accent-ink)" }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="font-editorial text-base font-semibold tracking-tight text-[var(--text-main)] block leading-tight">
                Synthesia
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-medium">
                Research Assistant
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-md hover:bg-[var(--bg-subtle)] text-[var(--text-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Research */}
        <div className="p-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-sm font-medium transition-all shadow-xs"
            style={{
              backgroundColor: "var(--accent-ink)",
              color: "#ffffff",
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Research Topic</span>
          </Link>
        </div>

        {/* Sessions Library Header */}
        <div className="px-4 py-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Research Library
          </span>
          <span className="text-[11px] font-mono opacity-80">{sessions.length}</span>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {loading ? (
            <div className="p-4 text-center text-xs text-[var(--text-muted)]">
              Loading library...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[var(--text-muted)] space-y-2">
              <Compass className="w-6 h-6 mx-auto opacity-40" />
              <p>No research sessions saved yet. Start an investigation above.</p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = pathname === `/research/${s.id}`;
              const isSeed = s.id.startsWith("seed-");
              return (
                <div
                  key={s.id}
                  className={`group relative rounded-lg p-2.5 transition-all text-left flex items-start justify-between gap-2 ${
                    isActive
                      ? "bg-[var(--bg-subtle)] border border-[var(--border-strong)]"
                      : "hover:bg-[var(--bg-subtle)] border border-transparent"
                  }`}
                >
                  <Link
                    href={`/research/${s.id}`}
                    onClick={onClose}
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isSeed && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-ink)] bg-[var(--accent-subtle)] px-1.5 py-0.2 rounded">
                          <Sparkles className="w-2.5 h-2.5" /> Exemplar
                        </span>
                      )}
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {s.sources_count} sources
                      </span>
                    </div>

                    <h4 className="text-xs font-medium line-clamp-2 text-[var(--text-main)] group-hover:text-[var(--accent-ink)] transition-colors">
                      {s.topic}
                    </h4>

                    {s.executive_summary_preview && (
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-1 font-editorial italic">
                        {s.executive_summary_preview}
                      </p>
                    )}
                  </Link>

                  <button
                    onClick={(e) => handleDelete(e, s.id)}
                    title="Delete session"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-600 text-[var(--text-muted)] transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          className="p-3 border-t text-[11px] text-[var(--text-muted)] flex items-center justify-between"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            FastAPI + Claude + RAG
          </span>
          <span className="font-mono text-[10px]">v1.0</span>
        </div>
      </aside>
    </>
  );
}
