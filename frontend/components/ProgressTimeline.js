"use client";

import { CheckCircle2, CircleDashed, Compass, Search, FileSearch, Database, Sparkles, AlertTriangle } from "lucide-react";

const STAGES = [
  { key: "planning", label: "Query Strategy & Planning", icon: Compass, desc: "Decomposing topic into empirical vectors" },
  { key: "searching", label: "Multi-Source Search", icon: Search, desc: "Querying academic & web repositories" },
  { key: "extracting", label: "Content Extraction", icon: FileSearch, desc: "Stripping boilerplate & parsing text" },
  { key: "indexing", label: "Vector Indexing", icon: Database, desc: "Embedding fragments into local semantic store" },
  { key: "synthesizing", label: "Structured Synthesis", icon: Sparkles, desc: "Generating report, citations & contradictions" },
];

export default function ProgressTimeline({
  stage,
  percent = 0,
  message = "Research in progress...",
  subQueries = [],
  sourcesCount = 0,
  chunksCount = 0,
  error = null,
}) {
  const getStageStatus = (stageKey) => {
    const stageOrder = ["planning", "searching", "extracting", "indexing", "synthesizing", "completed"];
    const currentIdx = stageOrder.indexOf(stage);
    const targetIdx = stageOrder.indexOf(stageKey);

    if (stage === "failed") return "failed";
    if (stage === "completed" || currentIdx > targetIdx) return "completed";
    if (currentIdx === targetIdx) return "active";
    return "pending";
  };

  return (
    <div
      className="max-w-2xl mx-auto rounded-2xl border p-6 md:p-8 shadow-sm transition-all"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[var(--accent-ink)] block mb-1">
            Live Research Pipeline
          </span>
          <h3 className="font-editorial text-xl font-semibold text-[var(--text-main)]">
            Investigating Documentary Evidence
          </h3>
        </div>

        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-[var(--text-main)]">
            {percent}%
          </span>
          <span className="block text-[11px] text-[var(--text-muted)]">Completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--bg-subtle)] h-2 rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.max(5, percent)}%`,
            backgroundColor: "var(--accent-ink)",
          }}
        />
      </div>

      {/* Current Active Status Alert */}
      <div
        className="p-3.5 rounded-xl border mb-6 flex items-center gap-3 text-xs md:text-sm"
        style={{
          backgroundColor: error ? "#fef2f2" : "var(--bg-subtle)",
          borderColor: error ? "#fecaca" : "var(--border-subtle)",
          color: error ? "#b91c1c" : "var(--text-main)",
        }}
      >
        {error ? (
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
        ) : (
          <span className="w-2 h-2 rounded-full bg-[var(--accent-ink)] animate-ping shrink-0" />
        )}
        <span className="font-medium line-clamp-1">{message}</span>
      </div>

      {/* Pipeline Steps List */}
      <div className="space-y-4">
        {STAGES.map((s, idx) => {
          const status = getStageStatus(s.key);
          const Icon = s.icon;

          return (
            <div
              key={s.key}
              className={`flex items-start gap-3.5 transition-opacity ${
                status === "pending" ? "opacity-40" : "opacity-100"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {status === "completed" ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : status === "active" ? (
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-ink)] flex items-center justify-center animate-spin">
                    <CircleDashed className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-[var(--border-strong)] text-[var(--text-faint)] flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs md:text-sm font-semibold text-[var(--text-main)]">
                    {s.label}
                  </h4>
                  {status === "active" && (
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-[var(--accent-ink)] bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {s.desc}
                </p>

                {/* Sub-queries display when in planning or searching */}
                {s.key === "planning" && subQueries.length > 0 && (
                  <div className="mt-2 pl-3 border-l-2 border-[var(--border-strong)] space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-faint)] font-semibold block">
                      Targeted Query Vectors:
                    </span>
                    {subQueries.map((q, qIdx) => (
                      <div key={qIdx} className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                        <span className="text-[var(--accent-ink)]">›</span>
                        <span>"{q}"</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources count display */}
                {s.key === "searching" && sourcesCount > 0 && (
                  <div className="mt-1 text-[11px] font-mono text-emerald-700 font-medium">
                    ✓ {sourcesCount} candidate web/academic sources collected
                  </div>
                )}

                {/* Chunks count display */}
                {s.key === "indexing" && chunksCount > 0 && (
                  <div className="mt-1 text-[11px] font-mono text-[var(--accent-ink)] font-medium">
                    ✓ {chunksCount} text fragments indexed into local vector store
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
