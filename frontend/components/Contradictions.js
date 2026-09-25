"use client";

import { AlertCircle, GitCompare, ArrowLeftRight } from "lucide-react";
import CitationPopover from "./CitationPopover";

export default function Contradictions({ contradictions, sourcesMap, onSelectSource }) {
  if (!contradictions || contradictions.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-main)] flex items-center gap-2">
          <span>Contradictions & Open Debates</span>
        </h2>
      </div>
      <p className="text-xs text-[var(--text-muted)] mb-5">
        Points of empirical tension, conflicting claims, or diverging methodological perspectives identified across sources.
      </p>

      <div className="space-y-5">
        {contradictions.map((item, idx) => {
          const sources = Array.isArray(item.sources) ? item.sources : [];

          return (
            <div
              key={idx}
              className="rounded-xl border p-5 md:p-6 transition-all"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              {/* Topic */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-amber-100 text-amber-800 text-xs">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </span>
                  <h3 className="font-semibold text-sm md:text-base text-[var(--text-main)]">
                    {item.topic}
                  </h3>
                </div>

                {sources.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[var(--text-faint)] uppercase tracking-wider mr-1">
                      Debated in:
                    </span>
                    {sources.map((id) => (
                      <CitationPopover
                        key={id}
                        sourceId={id}
                        source={sourcesMap ? sourcesMap[id] : null}
                        onSelectSource={onSelectSource}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Opposing Viewpoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Position A */}
                <div
                  className="p-4 rounded-lg border text-xs md:text-sm leading-relaxed"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Perspective Alpha
                  </span>
                  <p className="text-[var(--text-main)] font-editorial">
                    {item.position_a}
                  </p>
                </div>

                {/* Position B */}
                <div
                  className="p-4 rounded-lg border text-xs md:text-sm leading-relaxed"
                  style={{
                    backgroundColor: "var(--bg-subtle)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
                    Perspective Beta
                  </span>
                  <p className="text-[var(--text-main)] font-editorial">
                    {item.position_b}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
