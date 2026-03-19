"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CommentForm } from "./CommentForm";
import type { CommentableEntityType, CommentWithUser } from "@/lib/comments/types";

interface CommentThreadProps {
  entityType: CommentableEntityType;
  entityId: string;
  currentUserId?: string;
  maxHeight?: string;
}

export function CommentThread({
  entityType,
  entityId,
  currentUserId,
  maxHeight = "400px",
}: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/comments?entityType=${entityType}&entityId=${entityId}&sortOrder=asc&limit=100`
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const { data, total: count } = await res.json();
      setComments(data || []);
      setTotal(count || 0);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentCreated = (comment: CommentWithUser) => {
    setComments((prev) => [...prev, comment]);
    setTotal((prev) => prev + 1);

    // Scroll to bottom after new comment
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId);
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete comment");
      }
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setTotal((prev) => prev - 1);
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete comment"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageCircle className="size-4" />
        <span>
          {total} {total === 1 ? "comment" : "comments"}
        </span>
      </div>

      {comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <MessageCircle className="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Start the discussion.
          </p>
        </div>
      ) : (
        <ScrollArea style={{ maxHeight }} ref={scrollRef}>
          <div className="space-y-4 pr-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarImage
                    src={comment.user.avatar_url || undefined}
                    alt={comment.user.display_name}
                  />
                  <AvatarFallback className="text-xs">
                    {getInitials(comment.user.display_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.created_at)}
                    </span>

                    {currentUserId === comment.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <Trash2 className="size-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <CommentForm
        entityType={entityType}
        entityId={entityId}
        onCommentCreated={handleCommentCreated}
      />
    </div>
  );
}
