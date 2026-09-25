"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { startResearch } from "@/lib/api";

const TOPIC_SUGGESTIONS = [
  "Autonomous AI Agents in Production Software Engineering: Benchmarks and Failure Modes",
  "Solid-State Battery Energy Density vs Silicon Anodes: 2026 Breakthroughs",
  "Post-Quantum Cryptography Migration: NIST Standards and Latency Overhead",
  "Quantum Error Correction Thresholds in Neutral Atom Computing",
];

export default function SearchInput() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSearch = async (targetQuery) => {
    const topicToSearch = (targetQuery || query).trim();
    if (!topicToSearch || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await startResearch(topicToSearch);
      if (data && data.session_id) {
        router.push(`/research/${data.session_id}`);
      } else {
        throw new Error("Invalid session response received from backend");
      }
    } catch (err) {
      console.error("Research initiation error:", err);
      setError(err.message || "Failed to start research. Make sure the backend server is running.");
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="w-full max-w-2xl mx-auto text-left">
      <form onSubmit={onSubmit} className="relative group">
        <div
          className="relative flex items-center rounded-2xl border-2 transition-all shadow-md focus-within:shadow-lg"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-strong)",
          }}
        >
          <div className="pl-4 text-[var(--accent-ink)]">
            <Search className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            placeholder="Enter any research question, debate, or scientific inquiry..."
            className="w-full py-4 pl-3.5 pr-28 text-base bg-transparent focus:outline-hidden placeholder:text-[var(--text-faint)] text-[var(--text-main)]"
            autoFocus
          />

          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="absolute right-2 py-2 px-4 rounded-xl font-medium text-xs sm:text-sm text-white flex items-center gap-1.5 transition-all disabled:opacity-40"
            style={{
              backgroundColor: "var(--accent-ink)",
            }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initiating...</span>
              </>
            ) : (
              <>
                <span>Research</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Suggestion Chips */}
      <div className="mt-5">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
          <span>Explore sample research inquiries:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((topic, i) => (
            <button
              key={i}
              type="button"
              disabled={loading}
              onClick={() => {
                setQuery(topic);
                handleSearch(topic);
              }}
              className="text-left text-xs py-1.5 px-3 rounded-lg border transition-all hover:border-[var(--accent-ink)] hover:text-[var(--accent-ink)]"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-muted)",
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
