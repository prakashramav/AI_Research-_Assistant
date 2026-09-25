"use client";

import { ExternalLink, BookMarked, Globe, Calendar } from "lucide-react";

export default function ReferenceList({ references }) {
  if (!references || references.length === 0) return null;

  return (
    <section className="mb-14 pt-6 border-t" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-main)]">
            Primary References & Bibliography
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Indexed source documents, papers, and empirical registries.
          </p>
        </div>
        <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md">
          {references.length} sources
        </span>
      </div>

      <div className="space-y-3">
        {references.map((ref) => {
          return (
            <div
              key={ref.id}
              id={`ref-${ref.id}`}
              className="p-3.5 md:p-4 rounded-lg border transition-all hover:border-[var(--border-strong)] flex items-start gap-3 text-xs md:text-sm"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
            >
              <span
                className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 mt-0.5"
                style={{
                  backgroundColor: "var(--accent-subtle)",
                  color: "var(--accent-ink)",
                }}
              >
                [{ref.id}]
              </span>

              <div className="flex-1 min-w-0">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--text-main)] hover:text-[var(--accent-ink)] hover:underline inline-flex items-center gap-1.5 leading-snug"
                >
                  <span className="line-clamp-1">{ref.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </a>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-[var(--text-faint)]" />
                    {ref.publisher || "Web Repository"}
                  </span>

                  {ref.accessed_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[var(--text-faint)]" />
                      Retrieved {ref.accessed_date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
