"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Menu, Sparkles, Layers, ShieldCheck, Database, ArrowRight, Clock } from "lucide-react";
import SearchInput from "@/components/SearchInput";
import SessionSidebar from "@/components/SessionSidebar";
import { listSessions } from "@/lib/api";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await listSessions();
        setRecentSessions(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to load recent sessions:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:pl-80 transition-all">
      {/* Sidebar */}
      <SessionSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top Navigation */}
      <header
        className="w-full py-4 px-6 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-canvas)" }}
      >
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg border text-[var(--text-muted)]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-editorial text-lg font-semibold tracking-tight text-[var(--text-main)]">
            Synthesia
          </span>
          <span className="text-xs uppercase tracking-wider text-[var(--accent-ink)] font-semibold bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
            v1.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/research/seed-production-ai-agents-2026"
            className="text-xs font-medium text-[var(--accent-ink)] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Exemplar Report</span>
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 md:py-20 text-center max-w-4xl mx-auto w-full">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 border"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Multi-Source Autonomous Research & Verification</span>
        </div>

        {/* Title */}
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-main)] leading-[1.15] mb-4">
          Scholarly Synthesis. <br />
          <span className="text-[var(--accent-ink)] italic font-normal">
            Grounded in Primary Sources.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl mb-10 leading-relaxed">
          Formulates targeted query plans, extracts evidence across academic & web repositories,
          identifies empirical contradictions, and enables strict RAG follow-up Q&A.
        </p>

        {/* Prominent Search Console */}
        <SearchInput />

        {/* Featured Research Pills / Recent Sessions */}
        {recentSessions.length > 0 && (
          <div className="mt-14 w-full max-w-2xl text-left border-t pt-8" style={{ borderColor: "var(--border-subtle)" }}>
            <div className="flex items-center justify-between mb-3 text-xs uppercase font-semibold tracking-wider text-[var(--text-faint)]">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Previously Synthesized Reports
              </span>
            </div>

            <div className="space-y-2">
              {recentSessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/research/${s.id}`}
                  className="group flex items-center justify-between p-3 rounded-xl border transition-all hover:border-[var(--accent-ink)]"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--text-main)] group-hover:text-[var(--accent-ink)] truncate">
                      {s.topic}
                    </h4>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {s.sources_count} primary sources • {s.status}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--text-faint)] group-hover:text-[var(--accent-ink)] shrink-0 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Pillar Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 w-full max-w-3xl text-left">
          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-2.5" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent-ink)" }}>
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">
              Multi-Source Synthesis
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Decomposes questions into 4+ sub-queries, querying and deduplicating diverse authoritative domains.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-2.5" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent-ink)" }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">
              Contradiction Mapping
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Exposes tensions, conflicting methodologies, and differing institutional stances across findings.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs mb-2.5" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent-ink)" }}>
              <Database className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-main)] uppercase tracking-wide">
              Grounded RAG Q&A
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Indexed text fragments enable strict follow-up inquiry with inline superscript citation verification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-6 px-6 border-t text-center text-xs text-[var(--text-muted)] flex items-center justify-between max-w-4xl mx-auto w-full"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <span>Synthesia AI Research Assistant</span>
        <span className="font-mono text-[11px]">Strict Citation & Evidence Architecture</span>
      </footer>
    </div>
  );
}
