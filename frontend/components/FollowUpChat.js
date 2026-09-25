"use client";

import { useState } from "react";
import { Send, Sparkles, MessageSquare, ShieldAlert, ArrowRight, CornerDownLeft } from "lucide-react";
import { askFollowUp } from "@/lib/api";
import CitedText from "./CitedText";

export default function FollowUpChat({ sessionId, initialMessages = [], sourcesMap, onSelectSource }) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || submitting) return;

    setInput("");
    setError(null);

    // Optimistic user message
    const tempUserMsg = {
      id: `tmp-${Date.now()}`,
      role: "user",
      content: query,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setSubmitting(true);

    try {
      const res = await askFollowUp(sessionId, query);
      const asstMsg = {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content: res.answer,
        citations: res.citations || [],
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (err) {
      console.error("Follow-up Q&A error:", err);
      setError(err.message || "Unable to retrieve answer. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sampleQuestions = [
    "What specific failure modes degrade agent reasoning beyond 45k tokens?",
    "How does AST graph traversal compare against pure vector search?",
    "What are the reported token costs per resolved issue?",
  ];

  return (
    <div
      className="rounded-2xl border p-6 md:p-8 mt-12 transition-all"
      style={{
        backgroundColor: "var(--bg-subtle)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
            style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent-ink)" }}
          >
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[var(--text-main)]">
              Inquire into Findings (Grounded RAG)
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Ask follow-up questions answered strictly from the indexed sources above with inline citations.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Strict Evidence Mode
        </span>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="mb-6">
          <span className="text-[11px] uppercase tracking-wider text-[var(--text-faint)] font-semibold block mb-2">
            Suggested lines of inquiry:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="text-left text-xs py-1.5 px-3 rounded-full border transition-all hover:border-[var(--accent-ink)]"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-main)",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Thread */}
      {messages.length > 0 && (
        <div className="space-y-4 mb-6">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id || idx}
                className={`p-4 rounded-xl text-sm leading-relaxed ${
                  isUser
                    ? "ml-8 border text-right"
                    : "mr-8 border shadow-xs"
                }`}
                style={{
                  backgroundColor: isUser ? "var(--bg-surface)" : "var(--bg-surface)",
                  borderColor: isUser ? "var(--border-strong)" : "var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between mb-1 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>{isUser ? "You" : "Grounded Research Synthesis"}</span>
                </div>

                <div className="text-[var(--text-main)] text-left">
                  {isUser ? (
                    <p className="font-medium">{m.content}</p>
                  ) : (
                    <div className="font-editorial text-[15px] leading-relaxed">
                      <CitedText
                        text={m.content}
                        sourcesMap={sourcesMap}
                        onSelectSource={onSelectSource}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {submitting && (
            <div
              className="mr-8 p-4 rounded-xl border text-sm animate-pulse-subtle"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-ink)] animate-ping" />
                <span>Searching local vector index & synthesizing evidence...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question regarding the methodology, claims, or tradeoffs..."
          disabled={submitting}
          className="w-full py-3.5 pl-4 pr-12 text-sm rounded-xl border transition-all focus:outline-hidden focus:ring-1"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-strong)",
            color: "var(--text-main)",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || submitting}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white transition-opacity disabled:opacity-30"
          style={{ backgroundColor: "var(--accent-ink)" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-2 text-center text-[11px] text-[var(--text-faint)]">
        Answers rely strictly on the retrieved source chunks. Speculation without citation is prohibited.
      </div>
    </div>
  );
}
