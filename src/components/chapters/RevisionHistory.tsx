"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentRenderer } from "@/components/editor/ContentRenderer";
import { History, Loader2, FileText, Eye } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

interface Revision {
  id: string;
  chapterId: string;
  title: string;
  summary: string;
  createdAt: string;
  editedBy: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface RevisionWithContent extends Revision {
  content: JSONContent;
}

interface RevisionHistoryProps {
  chapterId: string;
}

export function RevisionHistory({ chapterId }: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedRevision, setSelectedRevision] =
    useState<RevisionWithContent | null>(null);
  const [isLoadingRevision, setIsLoadingRevision] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchRevisions();
  }, [chapterId]);

  const fetchRevisions = async (offset = 0, append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await fetch(
        `/api/chapters/${chapterId}/revisions?limit=${PAGE_SIZE}&offset=${offset}`
      );
      if (!res.ok) throw new Error("Failed to fetch revisions");
      const { data, total: count } = await res.json();

      if (append) {
        setRevisions((prev) => [...prev, ...(data || [])]);
      } else {
        setRevisions(data || []);
      }
      setTotal(count || 0);
      setHasMore((data || []).length === PAGE_SIZE);
    } catch (error) {
      console.error("Failed to fetch revisions:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const viewRevision = async (revision: Revision) => {
    setDialogOpen(true);
    setIsLoadingRevision(true);
    setSelectedRevision(null);

    try {
      const res = await fetch(
        `/api/chapters/${chapterId}/revisions/${revision.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch revision");
      const { data } = await res.json();
      setSelectedRevision(data);
    } catch (error) {
      console.error("Failed to fetch revision:", error);
    } finally {
      setIsLoadingRevision(false);
    }
  };

  const formatTimestamp = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="size-4" />
          <span>
            {total} {total === 1 ? "revision" : "revisions"}
          </span>
        </div>
      </div>

      {revisions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
          <History className="mx-auto mb-2 size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            No revisions yet. Revisions are created automatically when you save
            changes.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {revisions.map((revision, index) => (
              <div
                key={revision.id}
                className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  v{total - (revisions.indexOf(revision))}
                </div>

                <Avatar className="size-6 shrink-0">
                  <AvatarImage
                    src={revision.editedBy.avatarUrl || undefined}
                    alt={revision.editedBy.displayName}
                  />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(revision.editedBy.displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {revision.editedBy.displayName}
                    </span>
                    {revision.summary && (
                      <span className="text-xs text-muted-foreground truncate">
                        — {revision.summary}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(revision.createdAt)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => viewRevision(revision)}
                >
                  <Eye className="mr-1 size-3.5" />
                  View
                </Button>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRevisions(revisions.length, true)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Revision content dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-4" />
              {selectedRevision?.title || "Revision"}
            </DialogTitle>
            {selectedRevision && (
              <DialogDescription>
                Saved by {selectedRevision.editedBy.displayName} on{" "}
                {formatTimestamp(selectedRevision.createdAt)}
              </DialogDescription>
            )}
          </DialogHeader>

          {isLoadingRevision ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedRevision?.content ? (
            <ScrollArea className="max-h-[60vh]">
              <div className="pr-4">
                <ContentRenderer
                  content={selectedRevision.content as JSONContent}
                />
              </div>
            </ScrollArea>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No content in this revision.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
