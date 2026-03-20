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
  ArrowRightLeft,
  Pencil,
  X,
  Check,
  StickyNote,
  Trash2,
} from "lucide-react";
import { NoteConversionDialog } from "@/components/notes/NoteConversionDialog";

interface Note {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface NoteDetailViewProps {
  note: Note;
  userId: string;
}

export function NoteDetailView({ note, userId }: NoteDetailViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [tagsInput, setTagsInput] = useState(note.tags?.join(", ") ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [conversionOpen, setConversionOpen] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
          tags: tags.length > 0 ? tags : [],
        }),
      });
      if (res.ok) {
        toast.success("Note updated");
        setEditing(false);
        router.refresh();
      } else {
        toast.error("Failed to update note");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Note deleted");
        router.push("/notes");
      } else {
        toast.error("Failed to delete note");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    setTitle(note.title);
    setContent(note.content ?? "");
    setTagsInput(note.tags?.join(", ") ?? "");
    setEditing(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link href="/notes">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft />
          </Button>
        </Link>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <StickyNote className="size-5" />
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
              {note.title}
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
                title="Edit note"
              >
                <Pencil />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setConversionOpen(true)}
                title="Convert to content"
              >
                <ArrowRightLeft />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete note"
              >
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span>Created {new Date(note.created_at).toLocaleDateString()}</span>
        <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
      </div>

      {/* Tags */}
      {editing ? (
        <div className="mb-6">
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma-separated, e.g. research, worldbuilding)"
          />
        </div>
      ) : (
        note.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1">
            {note.tags.map((tag) => (
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
            placeholder="Write your note here..."
            rows={12}
            className="resize-none"
          />
        ) : note.content ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {note.content}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No content yet. Click the edit button to start writing.
          </p>
        )}
      </section>

      <Separator className="mb-6" />

      {/* Comments */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Discussion
        </h2>
        <CommentThread
          entityType="note"
          entityId={note.id}
          currentUserId={userId}
        />
      </section>

      <NoteConversionDialog
        note={note}
        open={conversionOpen}
        onOpenChange={setConversionOpen}
      />
    </div>
  );
}
