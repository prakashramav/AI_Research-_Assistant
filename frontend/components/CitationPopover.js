"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, BookOpen, Calendar, ShieldCheck } from "lucide-react";

export default function CitationPopover({ sourceId, source, onSelectSource }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!source) {
    return <sup className="citation-sup">[{sourceId}]</sup>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <sup
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (onSelectSource) onSelectSource(source);
        }}
        className="citation-sup"
        title={`Source [${sourceId}]: ${source.title || ""}`}
      >
        [{sourceId}]
      </sup>

      {isOpen && (
        <span
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3.5 rounded-lg shadow-xl border text-left cursor-default normal-case tracking-normal transition-all"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-strong)",
            color: "var(--text-main)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <span className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b" style={{ borderColor: "var(--border-subtle)" }}>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-ink)] uppercase tracking-wider">
              <BookOpen className="w-3 h-3" />
              Source [{sourceId}]
            </span>
            <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">
              {source.publisher || source.domain || "Web"}
            </span>
          </span>

          {/* Title */}
          <span className="block text-xs font-semibold leading-snug mb-1.5 line-clamp-2 text-[var(--text-main)]">
            {source.title}
          </span>

          {/* Snippet / Content Excerpt */}
          {(source.snippet || source.content) && (
            <span className="block text-[11px] leading-relaxed text-[var(--text-muted)] line-clamp-3 mb-2 font-editorial italic bg-[var(--bg-subtle)] p-1.5 rounded">
              "{source.snippet || source.content.slice(0, 160)}..."
            </span>
          )}

          {/* Stance or Credibility tag if present */}
          {source.stance && (
            <span className="flex items-start gap-1 text-[10px] text-[var(--text-muted)] mb-2">
              <ShieldCheck className="w-3 h-3 text-[var(--accent-ink)] shrink-0 mt-0.5" />
              <span className="line-clamp-2"><strong>Angle:</strong> {source.stance}</span>
            </span>
          )}

          {/* Actions */}
          <span className="flex items-center justify-between pt-1 border-t text-[11px]" style={{ borderColor: "var(--border-subtle)" }}>
            {source.accessed_date && (
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {source.accessed_date}
              </span>
            )}
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-ink)] hover:underline"
              >
                <span>Visit primary source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </span>

          {/* Arrow */}
          <span
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[var(--border-strong)]"
          />
        </span>
      )}
    </span>
  );
}
