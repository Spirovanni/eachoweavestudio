"use client";

import { useState } from "react";
import { EntityLinkPicker } from "@/components/linking/entity-link-picker";
import { LinkedEntitiesDisplay } from "@/components/linking/linked-entities-display";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkableEntityType } from "@/lib/types";

interface LinkedAssetsSidebarProps {
  chapterId: string;
  projectId: string;
  editable?: boolean;
  className?: string;
}

interface SectionState {
  songs: boolean;
  images: boolean;
  conversations: boolean;
  characters: boolean;
  themes: boolean;
}

const ENTITY_SECTIONS: Array<{
  type: LinkableEntityType;
  label: string;
  key: keyof SectionState;
}> = [
  { type: "song", label: "Songs", key: "songs" },
  { type: "image", label: "Images", key: "images" },
  { type: "conversation", label: "Conversations", key: "conversations" },
  { type: "character", label: "Characters", key: "characters" },
  { type: "theme", label: "Themes", key: "themes" },
];

export function LinkedAssetsSidebar({
  chapterId,
  projectId,
  editable = false,
  className,
}: LinkedAssetsSidebarProps) {
  const [expanded, setExpanded] = useState<SectionState>({
    songs: true,
    images: true,
    conversations: true,
    characters: true,
    themes: true,
  });

  const [refreshKeys, setRefreshKeys] = useState<Record<LinkableEntityType, number>>({
    song: 0,
    image: 0,
    conversation: 0,
    character: 0,
    theme: 0,
  });

  const toggleSection = (key: keyof SectionState) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLink = async (entityType: LinkableEntityType, entityId: string) => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to create link");
      }

      // Trigger refresh of the linked entities display
      setRefreshKeys((prev) => ({
        ...prev,
        [entityType]: prev[entityType] + 1,
      }));
    } catch (error) {
      console.error("Error linking entity:", error);
      // Could show a toast notification here
    }
  };

  const handleUnlink = (entityType: LinkableEntityType) => {
    // Trigger refresh of the linked entities display
    setRefreshKeys((prev) => ({
      ...prev,
      [entityType]: prev[entityType] + 1,
    }));
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-l border-border bg-muted/30",
        className
      )}
    >
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold">Linked Assets</h3>
        <p className="text-xs text-muted-foreground">
          Entities connected to this chapter
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {ENTITY_SECTIONS.map((section) => {
            const isExpanded = expanded[section.key];
            const Icon = isExpanded ? ChevronDown : ChevronRight;

            return (
              <div key={section.type} className="space-y-2">
                {/* Section header */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.key)}
                    className="h-auto p-1 font-medium"
                  >
                    <Icon className="mr-1 size-4" />
                    {section.label}
                  </Button>

                  {editable && isExpanded && (
                    <EntityLinkPicker
                      chapterId={chapterId}
                      projectId={projectId}
                      entityType={section.type}
                      onLink={(entityId) => handleLink(section.type, entityId)}
                      className="h-7 text-xs"
                    />
                  )}
                </div>

                {/* Section content */}
                {isExpanded && (
                  <div className="pl-2">
                    <LinkedEntitiesDisplay
                      key={`${section.type}-${refreshKeys[section.type]}`}
                      chapterId={chapterId}
                      entityType={section.type}
                      editable={editable}
                      onUnlink={() => handleUnlink(section.type)}
                    />
                  </div>
                )}

                <Separator className="my-2" />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {!editable && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            View mode — Edit the chapter to manage links
          </p>
        </div>
      )}
    </div>
  );
}
