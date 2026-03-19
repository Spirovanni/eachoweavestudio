"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, Search, Loader2, Music, ImageIcon, MessageSquare, Users as UsersIcon, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { LinkableEntityType } from "@/lib/types";

interface EntityItem {
  id: string;
  title?: string;
  name?: string;
  isLinked: boolean;
}

interface EntityLinkPickerProps {
  chapterId: string;
  projectId: string;
  entityType: LinkableEntityType;
  trigger?: React.ReactNode;
  onLink: (entityId: string) => Promise<void> | void;
  className?: string;
}

const ENTITY_CONFIG: Record<LinkableEntityType, {
  icon: React.ElementType;
  label: string;
  singularLabel: string;
  apiPath: string;
}> = {
  song: {
    icon: Music,
    label: "Songs",
    singularLabel: "Song",
    apiPath: "songs",
  },
  image: {
    icon: ImageIcon,
    label: "Images",
    singularLabel: "Image",
    apiPath: "images",
  },
  conversation: {
    icon: MessageSquare,
    label: "Conversations",
    singularLabel: "Conversation",
    apiPath: "conversations",
  },
  character: {
    icon: UsersIcon,
    label: "Characters",
    singularLabel: "Character",
    apiPath: "characters",
  },
  theme: {
    icon: Palette,
    label: "Themes",
    singularLabel: "Theme",
    apiPath: "themes",
  },
};

export function EntityLinkPicker({
  chapterId,
  projectId,
  entityType,
  trigger,
  onLink,
  className,
}: EntityLinkPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [entities, setEntities] = useState<EntityItem[]>([]);
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set());
  const [linking, setLinking] = useState<string | null>(null);

  const config = ENTITY_CONFIG[entityType];
  const Icon = config.icon;

  // Fetch entities and linked entities when dialog opens
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, chapterId, projectId, entityType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all entities of this type in the project
      const entitiesRes = await fetch(
        `/api/${config.apiPath}?project_id=${projectId}&limit=100`
      );
      if (!entitiesRes.ok) throw new Error("Failed to fetch entities");
      const { data: entitiesData } = await entitiesRes.json();

      // Fetch linked entities for this chapter
      const linksRes = await fetch(`/api/chapters/${chapterId}/links`);
      if (!linksRes.ok) throw new Error("Failed to fetch links");
      const { data: linksData } = await linksRes.json();

      // Find linked IDs for this entity type
      const linked = new Set<string>(
        linksData
          .filter((link: any) => link.entity_type === entityType)
          .map((link: any) => link.entity_id as string)
      );

      setLinkedIds(linked);

      // Map entities to EntityItem format
      const items: EntityItem[] = entitiesData.map((entity: any) => ({
        id: entity.id,
        title: entity.title,
        name: entity.name,
        isLinked: linked.has(entity.id),
      }));

      setEntities(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (entityId: string) => {
    setLinking(entityId);
    try {
      await onLink(entityId);
      // Update local state to reflect the new link
      setLinkedIds((prev) => new Set([...prev, entityId]));
      setEntities((prev) =>
        prev.map((e) => (e.id === entityId ? { ...e, isLinked: true } : e))
      );
    } catch (error) {
      console.error("Error linking entity:", error);
    } finally {
      setLinking(null);
    }
  };

  const filteredEntities = useMemo(() => {
    if (!search.trim()) return entities;

    const query = search.toLowerCase();
    return entities.filter((entity) => {
      const displayName = entity.title || entity.name || "";
      return displayName.toLowerCase().includes(query);
    });
  }, [entities, search]);

  const availableCount = entities.filter((e) => !e.isLinked).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className={className}>
            <Icon className="mr-2 size-4" />
            Link {config.singularLabel}
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link {config.singularLabel}</DialogTitle>
          <DialogDescription>
            Select a {config.singularLabel.toLowerCase()} to link to this chapter.
            {availableCount > 0 && (
              <span className="ml-1">
                ({availableCount} available)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${config.label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Entity list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {entities.length === 0
                ? `No ${config.label.toLowerCase()} in this project yet.`
                : `No ${config.label.toLowerCase()} match your search.`}
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredEntities.map((entity) => {
                  const displayName = entity.title || entity.name || "Untitled";
                  const isLinking = linking === entity.id;

                  return (
                    <button
                      key={entity.id}
                      onClick={() => !entity.isLinked && handleLink(entity.id)}
                      disabled={entity.isLinked || isLinking}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border border-border bg-card p-3 text-left transition-all hover:bg-accent",
                        entity.isLinked && "cursor-not-allowed opacity-50",
                        isLinking && "cursor-wait"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {displayName}
                        </span>
                      </div>

                      {entity.isLinked ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="size-4" />
                          Linked
                        </div>
                      ) : isLinking ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Click to link
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
