"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CommentThread } from "@/components/comments/CommentThread";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  X,
  Check,
  MessageSquare,
  BookOpen,
  Trash2,
} from "lucide-react";

interface LinkedChapter {
  id: string;
  title: string;
  status: string;
  orderIndex: number;
  linkedAt: string;
}

interface Conversation {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ConversationDetailViewProps {
  conversation: Conversation;
  chapters: LinkedChapter[];
  userId: string;
}

export function ConversationDetailView({
  conversation,
  chapters,
  userId,
}: ConversationDetailViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [content, setContent] = useState(conversation.content ?? "");
  const [tagsInput, setTagsInput] = useState(
    conversation.tags?.join(", ") ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          tags: tags.length > 0 ? tags : [],
        }),
      });
      if (res.ok) {
        toast.success("Conversation updated");
        setEditing(false);
        router.refresh();
      } else {
        toast.error("Failed to update conversation");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Conversation deleted");
        router.push("/conversations");
      } else {
        toast.error("Failed to delete conversation");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(conversation.title);
    setContent(conversation.content ?? "");
    setTagsInput(conversation.tags?.join(", ") ?? "");
    setEditing(false);
  };

  const sortedChapters = [...chapters].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/conversations">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft />
          </Button>
        </Link>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          {editing ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold"
              autoFocus
            />
          ) : (
            <h1 className="truncate text-2xl font-bold tracking-tight">
              {conversation.title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="icon-sm" onClick={handleCancel}>
                <X />
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!title.trim() || saving}
              >
                <Check />
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditing(true)}
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metadata & Tags */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>
          Created {new Date(conversation.created_at).toLocaleDateString()}
        </span>
        <span>
          Updated {new Date(conversation.updated_at).toLocaleDateString()}
        </span>
      </div>

      {editing ? (
        <div className="mb-6">
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma-separated, e.g. inspiration, worldbuilding)"
          />
        </div>
      ) : (
        conversation.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1">
            {conversation.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )
      )}

      <Separator className="mb-6" />

      {/* Content */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Content
        </h2>
        {editing ? (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write down the conversation content, quotes, or notes..."
            rows={10}
            className="resize-none"
          />
        ) : conversation.content ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {conversation.content}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No content yet. Click the edit button to add conversation details.
          </p>
        )}
      </section>

      <Separator className="mb-6" />

      {/* Linked Chapters */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Linked Chapters
        </h2>
        {sortedChapters.length === 0 ? (
          <p className="text-sm italic text-muted-foreground">
            No chapters linked to this conversation yet. Link chapters from the
            chapter detail page.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/chapters/${chapter.id}`}
                className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
              >
                <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {chapter.title}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {chapter.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Separator className="mb-6" />

      {/* Comments */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Discussion
        </h2>
        <CommentThread
          entityType="conversation"
          entityId={conversation.id}
          currentUserId={userId}
        />
      </section>
    </div>
  );
}
