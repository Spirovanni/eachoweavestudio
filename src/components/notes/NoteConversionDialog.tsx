"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Note {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  tags: string[];
}

interface NoteConversionDialogProps {
  note: Note;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TargetEntity = "chapter" | "song" | "conversation";
type PostAction = "keep" | "archive" | "delete";

export function NoteConversionDialog({
  note,
  open,
  onOpenChange,
}: NoteConversionDialogProps) {
  const router = useRouter();
  const [targetEntity, setTargetEntity] = useState<TargetEntity>("chapter");
  const [postAction, setPostAction] = useState<PostAction>("keep");
  
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || "");
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    if (!title.trim()) return;
    setConverting(true);

    try {
      let createRes;
      let newEntityPath = "";

      // 1. Create the new entity
      if (targetEntity === "chapter") {
        createRes = await fetch("/api/chapters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: note.project_id,
            title: title.trim(),
            summary: content.trim() || undefined,
          }),
        });
        if (createRes.ok) {
          const { data } = await createRes.json();
          newEntityPath = `/chapters/${data.id}/edit`;
        }
      } else if (targetEntity === "song") {
        createRes = await fetch("/api/songs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: note.project_id,
            title: title.trim(),
            lyrics: content.trim() || undefined,
          }),
        });
        if (createRes.ok) {
          const { data } = await createRes.json();
          newEntityPath = `/songs/${data.id}`;
        }
      } else if (targetEntity === "conversation") {
        createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: note.project_id,
            title: title.trim(),
            content: content.trim() || undefined,
            tags: note.tags || [],
          }),
        });
        if (createRes.ok) {
          const { data } = await createRes.json();
          newEntityPath = `/conversations/${data.id}`;
        }
      }

      if (!createRes || !createRes.ok) {
        throw new Error("Failed to create new entity");
      }

      // 2. Handle original note
      if (postAction === "delete") {
        await fetch(`/api/notes/${note.id}`, { method: "DELETE" });
      } else if (postAction === "archive") {
        const archivedTags = Array.from(new Set([...(note.tags || []), "archived"]));
        await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tags: archivedTags }),
        });
      }

      toast.success(`Successfully converted to ${targetEntity}!`);
      onOpenChange(false);
      
      // Navigate to the newly created entity
      router.push(newEntityPath);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during conversion.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convert Note</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Convert into</Label>
            <Select
              value={targetEntity}
              onValueChange={(v) => setTargetEntity(v as TargetEntity)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chapter">Chapter</SelectItem>
                <SelectItem value="song">Song</SelectItem>
                <SelectItem value="conversation">Conversation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entity title"
            />
          </div>

          <div className="grid gap-2">
            <Label>{targetEntity === "song" ? "Lyrics" : targetEntity === "chapter" ? "Summary" : "Content"}</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Entity ${targetEntity === "song" ? "lyrics" : targetEntity === "chapter" ? "summary" : "content"}`}
              className="resize-none h-32"
            />
          </div>

          <div className="grid gap-2">
            <Label>Original Note Action</Label>
            <Select
              value={postAction}
              onValueChange={(v) => setPostAction(v as PostAction)}
            >
              <SelectTrigger>
                <SelectValue placeholder="What to do with this note?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Keep note</SelectItem>
                <SelectItem value="archive">Archive note (adds tag)</SelectItem>
                <SelectItem value="delete">Delete note</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={converting}
          >
            Cancel
          </Button>
          <Button onClick={handleConvert} disabled={!title.trim() || converting}>
            {converting ? "Converting..." : "Convert"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
