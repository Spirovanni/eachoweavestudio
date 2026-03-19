"use client";

import { type Editor } from "@tiptap/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

type AIAction = {
  id: string;
  label: string;
  description: string;
  instruction: string;
};

const AI_ACTIONS: AIAction[] = [
  {
    id: "rewrite",
    label: "Rewrite",
    description: "Rephrase the selected text while keeping the meaning",
    instruction: "Rewrite this text to improve clarity and flow while maintaining the same meaning:",
  },
  {
    id: "expand",
    label: "Expand",
    description: "Add more detail and depth to the selected text",
    instruction: "Expand on this text with more detail, description, and depth:",
  },
  {
    id: "summarize",
    label: "Summarize",
    description: "Condense the selected text to its key points",
    instruction: "Summarize this text concisely, capturing only the essential points:",
  },
  {
    id: "continue",
    label: "Continue",
    description: "Generate text that follows from the selection",
    instruction: "Continue writing after this text, maintaining the same style and tone:",
  },
  {
    id: "tone-formal",
    label: "Make Formal",
    description: "Adjust the tone to be more formal",
    instruction: "Rewrite this text in a more formal, professional tone:",
  },
  {
    id: "tone-casual",
    label: "Make Casual",
    description: "Adjust the tone to be more casual",
    instruction: "Rewrite this text in a more casual, conversational tone:",
  },
];

interface AIActionMenuProps {
  editor: Editor | null;
  projectId?: string | null;
}

export function AIActionMenu({ editor, projectId }: AIActionMenuProps) {
  const [hasSelection, setHasSelection] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [originalFrom, setOriginalFrom] = useState(0);
  const [originalTo, setOriginalTo] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Track selection state
  useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setHasSelection(text.trim().length > 0);
    };

    // Update selection on every transaction
    editor.on("selectionUpdate", updateSelection);
    editor.on("transaction", updateSelection);

    return () => {
      editor.off("selectionUpdate", updateSelection);
      editor.off("transaction", updateSelection);
    };
  }, [editor]);

  if (!editor) return null;

  const handleAction = async (action: AIAction) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, " ");

    if (!selectedText.trim()) return;

    setIsPopoverOpen(false);
    setIsGenerating(true);
    setOriginalText(selectedText);
    setOriginalFrom(from);
    setOriginalTo(to);

    try {
      const prompt = `${action.instruction}\n\n${selectedText}`;

      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: "text_editing",
          project_id: projectId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate AI suggestion");
      }

      const data = await res.json();
      const generatedText = data.text || "";

      // For "continue" action, append instead of replace
      if (action.id === "continue") {
        setPreviewText(selectedText + "\n\n" + generatedText);
      } else {
        setPreviewText(generatedText);
      }

      setShowPreview(true);
    } catch (error) {
      console.error("AI action error:", error);
      // Could add toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!editor || !previewText) return;

    editor
      .chain()
      .focus()
      .deleteRange({ from: originalFrom, to: originalTo })
      .insertContentAt(originalFrom, previewText)
      .run();

    setShowPreview(false);
    setPreviewText("");
    setOriginalText("");
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewText("");
    setOriginalText("");
  };

  if (!hasSelection && !isGenerating) return null;

  return (
    <>
      {/* Fixed position AI Actions button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger>
            <Button
              size="lg"
              className="gap-2 shadow-lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  AI Actions
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[280px] p-2">
            <div className="space-y-1">
              {AI_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleAction(action)}
                  className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left hover:bg-muted"
                >
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Suggestion</DialogTitle>
            <DialogDescription>
              Review the AI-generated text before applying it to your chapter
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">Original:</p>
              <div className="max-h-[200px] overflow-y-auto rounded-md border border-border bg-muted/50 p-3 text-sm">
                {originalText}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-muted-foreground">AI Suggestion:</p>
              <div className="max-h-[300px] overflow-y-auto rounded-md border border-border bg-card p-3 text-sm">
                {previewText}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              <Sparkles className="mr-2 size-4" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
