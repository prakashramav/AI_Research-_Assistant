"use client";

import { CheckCircle2, Bookmark } from "lucide-react";
import CitationPopover from "./CitationPopover";

export default function KeyFindings({ findings, sourcesMap, onSelectSource }) {
  if (!findings || findings.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-main)]">
          Key Findings & Core Theses
        </h2>
      </div>

      <div className="space-y-3.5">
        {findings.map((item, index) => {
          const point = typeof item === "string" ? item : item.point;
          const supportingIds = Array.isArray(item.supporting_source_ids)
            ? item.supporting_source_ids
            : [];

          return (
            <div
              key={index}
              className="p-4 md:p-5 rounded-lg border transition-all hover:border-[var(--border-strong)] flex items-start gap-3.5"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div
                className="mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent-ink)",
                }}
              >
                {index + 1}
              </div>

              <div className="flex-1">
                <p className="text-sm md:text-[15px] leading-relaxed text-[var(--text-main)]">
                  {point}
                </p>

                {supportingIds.length > 0 && (
                  <div className="mt-2.5 flex items-center flex-wrap gap-1.5 text-xs text-[var(--text-muted)]">
                    <span className="text-[11px] uppercase tracking-wider font-medium text-[var(--text-faint)]">
                      Evidence from:
                    </span>
                    {supportingIds.map((id) => (
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
