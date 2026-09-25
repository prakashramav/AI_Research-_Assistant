"use client";

import { Scale, ShieldCheck, Compass } from "lucide-react";

export default function SourceComparison({ comparisons }) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-main)]">
            Source Comparison & Stance Matrix
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Comparative analysis of institutional stances, methodological biases, and credibility profiles.
          </p>
        </div>
      </div>

      {/* Responsive comparison cards / table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
        <table className="w-full text-left text-sm border-collapse" style={{ backgroundColor: "var(--bg-surface)" }}>
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider font-semibold" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}>
              <th className="py-3 px-4 w-1/4">Source / Entity</th>
              <th className="py-3 px-4 w-5/12">Stance & Analytical Angle</th>
              <th className="py-3 px-4 w-1/3">Credibility & Scope Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {comparisons.map((c, idx) => (
              <tr key={idx} className="hover:bg-[var(--bg-subtle)] transition-colors">
                <td className="py-3.5 px-4 font-medium text-xs md:text-sm text-[var(--text-main)] align-top">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-ink)] shrink-0" />
                    <span>{c.source}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs md:text-sm text-[var(--text-muted)] align-top leading-relaxed">
                  <span className="font-editorial italic text-[var(--text-main)]">
                    {c.stance}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)] align-top leading-relaxed">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{c.credibility_notes}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
