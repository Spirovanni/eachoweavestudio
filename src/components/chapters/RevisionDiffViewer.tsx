"use client";

import { useMemo } from "react";
import { diffLines } from "diff";
import { extractTextFromTiptap } from "@/lib/utils/tiptap-text";

interface RevisionDiffViewerProps {
  oldContent: Record<string, unknown> | null;
  newContent: Record<string, unknown> | null;
  oldTitle?: string;
  newTitle?: string;
}

export function RevisionDiffViewer({
  oldContent,
  newContent,
  oldTitle = "Previous",
  newTitle = "Current",
}: RevisionDiffViewerProps) {
  const diff = useMemo(() => {
    const oldText = extractTextFromTiptap(oldContent);
    const newText = extractTextFromTiptap(newContent);
    return diffLines(oldText, newText);
  }, [oldContent, newContent]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const part of diff) {
      const lineCount = part.value.split("\n").filter(Boolean).length;
      if (part.added) added += lineCount;
      if (part.removed) removed += lineCount;
    }
    return { added, removed };
  }, [diff]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{oldTitle} &rarr; {newTitle}</span>
        <span className="text-green-600 dark:text-green-400">
          +{stats.added} added
        </span>
        <span className="text-red-600 dark:text-red-400">
          -{stats.removed} removed
        </span>
      </div>

      {/* Diff output */}
      <div className="rounded-lg border border-border overflow-hidden font-mono text-sm">
        {diff.map((part, index) => {
          let bgClass = "";
          let prefix = " ";

          if (part.added) {
            bgClass = "bg-green-500/10 text-green-800 dark:text-green-300";
            prefix = "+";
          } else if (part.removed) {
            bgClass = "bg-red-500/10 text-red-800 dark:text-red-300";
            prefix = "-";
          }

          const lines = part.value.split("\n");
          // Remove trailing empty string from split
          if (lines[lines.length - 1] === "") lines.pop();

          return (
            <div key={index} className={bgClass}>
              {lines.map((line, lineIdx) => (
                <div
                  key={lineIdx}
                  className="px-3 py-0.5 whitespace-pre-wrap"
                >
                  <span className="inline-block w-4 shrink-0 select-none text-muted-foreground">
                    {prefix}
                  </span>
                  {line || " "}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
