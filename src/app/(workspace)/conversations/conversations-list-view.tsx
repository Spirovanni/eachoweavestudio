"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ArrowUpDown, MessageSquare } from "lucide-react";

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

type SortField = "title" | "created_at" | "updated_at";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "created_at", label: "Date created" },
  { value: "updated_at", label: "Last updated" },
];

interface ConversationsListViewProps {
  conversations: Conversation[];
  projectId: string | null;
}

export function ConversationsListView({
  conversations,
  projectId,
}: ConversationsListViewProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("updated_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [creating, setCreating] = useState(false);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    conversations.forEach((c) => c.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [conversations]);

  const [tagFilter, setTagFilter] = useState("");

  const filteredAndSorted = useMemo(() => {
    let result = [...conversations];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.content?.toLowerCase().includes(q) ||
          c.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (tagFilter) {
      result = result.filter((c) => c.tags?.includes(tagFilter));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "created_at") {
        cmp = a.created_at.localeCompare(b.created_at);
      } else {
        cmp = a.updated_at.localeCompare(b.updated_at);
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [conversations, search, sortField, sortAsc, tagFilter]);

  const handleCreateConversation = async () => {
    if (!newTitle.trim() || !projectId) return;
    setCreating(true);
    try {
      const tags = newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          title: newTitle.trim(),
          tags: tags.length > 0 ? tags : undefined,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setDialogOpen(false);
        setNewTitle("");
        setNewTags("");
        router.push(`/conversations/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-48"
        />

        <Select
          value={sortField}
          onValueChange={(v) => v && setSortField(v as SortField)}
        >
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setSortAsc(!sortAsc)}
        >
          <ArrowUpDown className={sortAsc ? "" : "rotate-180"} />
        </Button>

        {allTags.length > 0 && (
          <Select
            value={tagFilter || undefined}
            onValueChange={(v) => v && setTagFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger size="sm">
              <SelectValue placeholder="All tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="ml-auto">
          {projectId ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus />
                New Conversation
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Conversation</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Conversation title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newTitle.trim()) {
                        handleCreateConversation();
                      }
                    }}
                  />
                  <Input
                    placeholder="Tags (comma-separated, e.g. inspiration, worldbuilding)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateConversation}
                    disabled={!newTitle.trim() || creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-xs text-muted-foreground">
              Create a project to add conversations
            </p>
          )}
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {conversations.length === 0
            ? "No conversations yet. Click 'New Conversation' to create one."
            : "No conversations match the current search."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/conversations/${conversation.id}`}
              className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <MessageSquare className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium transition-colors group-hover:text-primary">
                    {conversation.title}
                  </h2>
                  {conversation.content && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {conversation.content.slice(0, 120)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {conversation.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {conversation.tags?.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{conversation.tags.length - 3}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(conversation.updated_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
