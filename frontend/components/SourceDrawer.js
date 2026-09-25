"use client";

import { X, ExternalLink, BookOpen, ShieldCheck, Globe, Calendar, FileText } from "lucide-react";

export default function SourceDrawer({ source, isOpen, onClose }) {
  if (!isOpen || !source) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-md md:max-w-lg p-6 overflow-y-auto shadow-2xl border-l flex flex-col transition-transform duration-300"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-main)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b mb-5" style={{ borderColor: "var(--border-subtle)" }}>
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-ink)] uppercase tracking-wider bg-[var(--accent-subtle)] px-2 py-0.5 rounded">
              <BookOpen className="w-3.5 h-3.5" />
              Source Reference [{source.id || source.source_id || "1"}]
            </span>
            <h3 className="font-editorial text-lg font-bold mt-2 leading-snug text-[var(--text-main)]">
              {source.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md">
            <Globe className="w-3.5 h-3.5 text-[var(--text-faint)]" />
            {source.publisher || source.domain || "Web Source"}
          </span>
          {source.accessed_date && (
            <span className="flex items-center gap-1 bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-faint)]" />
              Accessed {source.accessed_date}
            </span>
          )}
        </div>

        {/* Stance & Credibility Cards */}
        {(source.stance || source.credibility_notes) && (
          <div className="space-y-3 mb-6 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border-subtle)" }}>
            {source.stance && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Analytical Stance:
                </span>
                <p className="text-xs md:text-sm font-editorial italic text-[var(--text-main)]">
                  {source.stance}
                </p>
              </div>
            )}
            {source.credibility_notes && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                  Credibility Assessment:
                </span>
                <p className="text-xs text-[var(--text-muted)]">
                  {source.credibility_notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Extracted Content Body */}
        <div className="flex-1 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)] flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5" />
            Extracted Content Body
          </span>
          <div
            className="text-xs md:text-sm font-editorial leading-relaxed p-4 rounded-xl border max-h-80 overflow-y-auto whitespace-pre-wrap"
            style={{
              backgroundColor: "var(--bg-subtle)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-main)",
            }}
          >
            {source.content || source.snippet || "No detailed content extracted."}
          </div>
        </div>

        {/* Outbound Link Footer */}
        {source.url && (
          <div className="pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--accent-ink)" }}
            >
              <span>Read original document at source</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
