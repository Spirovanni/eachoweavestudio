"use client";

import { useState, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles,
  Pencil,
  ArrowRight,
  CheckCheck,
  Type,
  AlignLeft,
  Minimize2,
  Loader2,
  Check,
  X,
  Copy,
} from "lucide-react";

type AssistMode =
  | "grammar"
  | "style"
  | "tone"
  | "rewrite"
  | "expand"
  | "summarize"
  | "continue";

interface QuickAction {
  mode: AssistMode;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { mode: "continue", label: "Continue", icon: <ArrowRight className="size-3.5" />, description: "Write the next paragraphs" },
  { mode: "grammar", label: "Fix grammar", icon: <CheckCheck className="size-3.5" />, description: "Fix spelling & grammar" },
  { mode: "expand", label: "Expand", icon: <Type className="size-3.5" />, description: "Add more detail" },
  { mode: "rewrite", label: "Rewrite", icon: <Pencil className="size-3.5" />, description: "Fresh phrasing" },
  { mode: "summarize", label: "Summarize", icon: <Minimize2 className="size-3.5" />, description: "Condense text" },
  { mode: "style", label: "Improve style", icon: <AlignLeft className="size-3.5" />, description: "Better prose" },
];

interface AIAssistPanelProps {
  editor: Editor | null;
  chapterTitle?: string;
  chapterSummary?: string;
}

export function AIAssistPanel({
  editor,
  chapterTitle,
  chapterSummary,
}: AIAssistPanelProps) {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<AssistMode | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const getSelectedOrRecentText = useCallback((): string => {
    if (!editor) return "";

    const { from, to } = editor.state.selection;
    if (from !== to) {
      return editor.state.doc.textBetween(from, to, "\n");
    }

    // No selection — use last ~500 chars of content for context
    const fullText = editor.state.doc.textContent;
    return fullText.slice(-500);
  }, [editor]);

  const runAssist = useCallback(
    async (mode: AssistMode, instruction?: string) => {
      const text = getSelectedOrRecentText();
      if (!text.trim()) return;

      setGenerating(true);
      setActiveMode(mode);
      setResult("");

      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            mode,
            instruction,
            stream: true,
            context: {
              chapterTitle,
              chapterSummary,
              recentContent: text.slice(-300),
            },
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setResult(accumulated);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled
        } else {
          setResult(
            `Error: ${err instanceof Error ? err.message : "Generation failed"}`
          );
        }
      } finally {
        setGenerating(false);
        abortRef.current = null;
      }
    },
    [getSelectedOrRecentText, chapterTitle, chapterSummary]
  );

  const handleAccept = useCallback(() => {
    if (!editor || !result) return;

    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // Replace selected text
      editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();
    } else {
      // Insert at end
      editor.chain().focus().insertContentAt(editor.state.doc.content.size - 1, `\n\n${result}`).run();
    }

    setResult(null);
    setActiveMode(null);
  }, [editor, result]);

  const handleReject = () => {
    setResult(null);
    setActiveMode(null);
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setGenerating(false);
    setResult(null);
    setActiveMode(null);
  };

  const handleCustomSubmit = () => {
    if (!customPrompt.trim()) return;
    runAssist("rewrite", customPrompt.trim());
    setCustomPrompt("");
  };

  return (
    <div className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-medium">AI Assistant</h3>
      </div>

      {/* Quick actions */}
      <div className="space-y-1 px-3 py-3">
        <p className="mb-2 text-xs text-muted-foreground">
          Select text or use recent content
        </p>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.mode}
            onClick={() => runAssist(action.mode)}
            disabled={generating}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      <Separator />

      {/* Custom prompt */}
      <div className="px-3 py-3">
        <p className="mb-1.5 text-xs text-muted-foreground">Custom instruction</p>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
            placeholder="e.g. Make it more dramatic..."
            disabled={generating}
            className="flex-1 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
          />
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleCustomSubmit}
            disabled={generating || !customPrompt.trim()}
          >
            <ArrowRight />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Result area */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {generating && (
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            <span>
              {activeMode === "continue" ? "Writing..." : `Applying ${activeMode}...`}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCancel}
              className="ml-auto"
            >
              <X />
            </Button>
          </div>
        )}

        {result && (
          <div>
            <div className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
              {result}
            </div>

            {!generating && (
              <div className="mt-2 flex gap-1.5">
                <Button size="xs" onClick={handleAccept}>
                  <Check className="size-3" />
                  Accept
                </Button>
                <Button size="xs" variant="ghost" onClick={handleReject}>
                  <X className="size-3" />
                  Reject
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(result)}
                >
                  <Copy className="size-3" />
                  Copy
                </Button>
              </div>
            )}
          </div>
        )}

        {!result && !generating && (
          <p className="text-xs text-muted-foreground">
            Select text in the editor and choose an action, or use &ldquo;Continue&rdquo;
            to keep writing from where you left off.
          </p>
        )}
      </div>
    </div>
  );
}
