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
import { Textarea } from "@/components/ui/textarea";
import { Plus, ArrowUpDown, Users } from "lucide-react";

interface Character {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  symbolism: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

type SortField = "name" | "created_at" | "updated_at";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Date created" },
  { value: "updated_at", label: "Last updated" },
];

interface CharactersListViewProps {
  characters: Character[];
  projectId: string | null;
}

export function CharactersListView({
  characters,
  projectId,
}: CharactersListViewProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newSymbolism, setNewSymbolism] = useState("");
  const [creating, setCreating] = useState(false);

  const filteredAndSorted = useMemo(() => {
    let result = [...characters];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.symbolism?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortField === "created_at") {
        cmp = a.created_at.localeCompare(b.created_at);
      } else {
        cmp = a.updated_at.localeCompare(b.updated_at);
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [characters, search, sortField, sortAsc]);

  const handleCreateCharacter = async () => {
    if (!newName.trim() || !projectId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          symbolism: newSymbolism.trim() || undefined,
        }),
      });
      if (res.ok) {
        const { data } = await res.json();
        setDialogOpen(false);
        setNewName("");
        setNewDescription("");
        setNewSymbolism("");
        router.push(`/characters/${data.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search characters..."
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

        <div className="ml-auto">
          {projectId ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <Plus />
                New Character
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Character</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Character name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newName.trim()) {
                        handleCreateCharacter();
                      }
                    }}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <Input
                    placeholder="Symbolism (optional, e.g. hope, rebellion)"
                    value={newSymbolism}
                    onChange={(e) => setNewSymbolism(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateCharacter}
                    disabled={!newName.trim() || creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <p className="text-xs text-muted-foreground">
              Create a project to add characters
            </p>
          )}
        </div>
      </div>

      {filteredAndSorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {characters.length === 0
            ? "No characters yet. Click 'New Character' to create one."
            : "No characters match the current search."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((character) => (
            <Link
              key={character.id}
              href={`/characters/${character.id}`}
              className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Users className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-medium transition-colors group-hover:text-primary">
                    {character.name}
                  </h2>
                  {character.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {character.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                {character.symbolism ? (
                  <Badge variant="outline" className="text-[10px]">
                    {character.symbolism}
                  </Badge>
                ) : (
                  <span />
                )}
                <span className="text-xs text-muted-foreground">
                  {new Date(character.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
