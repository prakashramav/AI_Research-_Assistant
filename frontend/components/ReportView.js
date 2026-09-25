"use client";

import { useState } from "react";
import { Share2, Printer, Copy, Check, Calendar, Globe, Bookmark, Sparkles } from "lucide-react";
import ExecutiveSummary from "./ExecutiveSummary";
import KeyFindings from "./KeyFindings";
import SourceComparison from "./SourceComparison";
import EvidenceList from "./EvidenceList";
import Contradictions from "./Contradictions";
import ReferenceList from "./ReferenceList";
import FollowUpChat from "./FollowUpChat";
import SourceDrawer from "./SourceDrawer";

export default function ReportView({ session }) {
  const [copied, setCopied] = useState(false);
  const [drawerSource, setDrawerSource] = useState(null);

  const report = session.report || {};
  const sources = session.sources || [];
  const references = report.references || [];

  // Build a lookup map of sources by ID for citations
  const sourcesMap = {};
  sources.forEach((s) => {
    const rawId = s.id.split("_").pop();
    sourcesMap[s.id] = s;
    sourcesMap[rawId] = s;
  });
  references.forEach((r) => {
    if (!sourcesMap[r.id]) {
      sourcesMap[r.id] = r;
    }
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = session.created_at
    ? new Date(session.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "September 25, 2026";

  return (
    <article className="editorial-column py-8 px-4 sm:px-6">
      {/* Editorial Document Header */}
      <header className="mb-10 pb-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
              style={{
                backgroundColor: "var(--accent-subtle)",
                color: "var(--accent-ink)",
              }}
            >
              Research Synthesis Report
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              onClick={handleCopyLink}
              title="Copy session link"
              className="p-1.5 rounded-md border text-xs flex items-center gap-1 hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Share"}</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print report"
              className="p-1.5 rounded-md border text-xs flex items-center gap-1 hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] transition-colors"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Report Main Title */}
        <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-main)] leading-tight mb-4">
          {session.topic}
        </h1>

        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-[var(--accent-ink)]" />
            {references.length || sources.length} Primary Sources Analyzed
          </span>
          <span>•</span>
          <span>Grounded RAG Enabled</span>
        </div>
      </header>

      {/* Sections */}
      <ExecutiveSummary
        summary={report.executive_summary}
        sourcesMap={sourcesMap}
        onSelectSource={setDrawerSource}
      />

      <KeyFindings
        findings={report.key_findings}
        sourcesMap={sourcesMap}
        onSelectSource={setDrawerSource}
      />

      <SourceComparison
        comparisons={report.source_comparison}
      />

      <EvidenceList
        evidence={report.evidence}
        sourcesMap={sourcesMap}
        onSelectSource={setDrawerSource}
      />

      <Contradictions
        contradictions={report.contradictions}
        sourcesMap={sourcesMap}
        onSelectSource={setDrawerSource}
      />

      <ReferenceList
        references={references}
      />

      {/* Follow-up Q&A Section */}
      <FollowUpChat
        sessionId={session.id}
        initialMessages={session.messages || []}
        sourcesMap={sourcesMap}
        onSelectSource={setDrawerSource}
      />

      {/* Side Drawer for Full Source inspection */}
      <SourceDrawer
        source={drawerSource}
        isOpen={Boolean(drawerSource)}
        onClose={() => setDrawerSource(null)}
      />
    </article>
  );
}
