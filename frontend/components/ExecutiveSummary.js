"use client";

import CitedText from "./CitedText";
import { Sparkles, FileText } from "lucide-react";

export default function ExecutiveSummary({ summary, sourcesMap, onSelectSource }) {
  if (!summary) return null;

  return (
    <section className="mb-10 pb-8 border-b" style={{ borderColor: "var(--border-subtle)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span
          className="p-1 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
          style={{ color: "var(--accent-ink)", backgroundColor: "var(--accent-subtle)" }}
        >
          <FileText className="w-3.5 h-3.5" />
          Executive Synthesis
        </span>
      </div>

      <div
        className="font-editorial text-lg md:text-xl leading-relaxed font-normal p-5 md:p-6 rounded-xl border transition-all shadow-xs"
        style={{
          backgroundColor: "var(--bg-subtle)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-main)",
        }}
      >
        <CitedText text={summary} sourcesMap={sourcesMap} onSelectSource={onSelectSource} />
      </div>
    </section>
  );
}
