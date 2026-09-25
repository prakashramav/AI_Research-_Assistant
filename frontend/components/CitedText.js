"use client";

import React from "react";
import CitationPopover from "./CitationPopover";

/**
 * Parses a paragraph of text containing citation markers like [1], [2], [1, 2]
 * and replaces them with interactive CitationPopover components.
 */
export default function CitedText({ text, sourcesMap, onSelectSource }) {
  if (!text) return null;

  // Regular expression to match [1], [2], [1, 2], [1][2], etc.
  const regex = /\[(\d+(?:,\s*\d+)*)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const citationGroup = match[1]; // e.g. "1" or "1, 2"
    const ids = citationGroup.split(",").map((s) => s.trim());

    ids.forEach((id) => {
      const source = sourcesMap ? (sourcesMap[id] || sourcesMap[parseInt(id)]) : null;
      parts.push(
        <CitationPopover
          key={`${match.index}-${id}`}
          sourceId={id}
          source={source}
          onSelectSource={onSelectSource}
        />
      );
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span>{parts}</span>;
}
