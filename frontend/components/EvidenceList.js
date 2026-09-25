"use client";

import { Quote, Layers } from "lucide-react";
import CitationPopover from "./CitationPopover";

export default function EvidenceList({ evidence, sourcesMap, onSelectSource }) {
  if (!evidence || evidence.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-main)]">
          Empirical Evidence & Verified Claims
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {evidence.map((item, idx) => {
          const sId = item.source_id;
          const source = sourcesMap ? sourcesMap[sId] : null;

          return (
            <div
              key={idx}
              className="p-4 md:p-5 rounded-lg border transition-all"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="text-sm font-semibold text-[var(--text-main)] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-ink)]" />
                  {item.claim}
                </h4>

                {sId && (
                  <CitationPopover
                    sourceId={sId}
                    source={source}
                    onSelectSource={onSelectSource}
                  />
                )}
              </div>

              <blockquote
                className="pl-3.5 border-l-2 font-editorial italic text-xs md:text-sm text-[var(--text-muted)] leading-relaxed mt-2"
                style={{
                  borderColor: "var(--accent-ink)",
                  backgroundColor: "var(--bg-subtle)",
                  padding: "0.6rem 0.8rem",
                  borderRadius: "0 0.375rem 0.375rem 0",
                }}
              >
                "{item.quote_or_paraphrase}"
              </blockquote>
            </div>
          );
        })}
      </div>
    </section>
  );
}
