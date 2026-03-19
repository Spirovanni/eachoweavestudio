"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { CommentableEntityType, CommentWithUser } from "@/lib/comments/types";

interface CommentFormProps {
  entityType: CommentableEntityType;
  entityId: string;
  onCommentCreated?: (comment: CommentWithUser) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentForm({
  entityType,
  entityId,
  onCommentCreated,
  placeholder = "Add a comment...",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      toast.error("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          content: trimmedContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create comment");
      }

      const { data } = await response.json();

      // Clear input on success
      setContent("");

      // Notify parent component
      if (onCommentCreated) {
        onCommentCreated(data);
      }

      toast.success("Comment added");
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Cmd+Enter (Mac) or Ctrl+Enter (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={isSubmitting}
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Tip: Press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
            Cmd+Enter
          </kbd>{" "}
          to submit
        </p>
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </form>
  );
}
