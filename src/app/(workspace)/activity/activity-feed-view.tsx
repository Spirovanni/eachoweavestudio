"use client";

import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Music,
  ImageIcon,
  Users,
  Palette,
  StickyNote,
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  ArrowRightLeft,
  Link2,
  Unlink,
  Sparkles,
  Upload,
  Download,
  UserPlus,
  UserMinus,
  Settings,
  Loader2,
  Activity,
} from "lucide-react";

// -- Types --

interface EnrichedEvent {
  id: string;
  projectId: string;
  userId: string;
  eventType: string;
  entityType: string | null;
  entityId: string | null;
  entityTitle: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
  };
}

// -- Icon maps --

const EVENT_ICONS: Record<string, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  status_changed: ArrowRightLeft,
  linked: Link2,
  unlinked: Unlink,
  ai_generated: Sparkles,
  exported: Download,
  imported: Upload,
  member_added: UserPlus,
  member_removed: UserMinus,
  settings_changed: Settings,
};

const ENTITY_ICONS: Record<string, typeof BookOpen> = {
  chapter: BookOpen,
  song: Music,
  image: ImageIcon,
  character: Users,
  theme: Palette,
  note: StickyNote,
  conversation: MessageSquare,
};

const EVENT_LABELS: Record<string, string> = {
  created: "created",
  updated: "updated",
  deleted: "deleted",
  status_changed: "changed status of",
  linked: "linked",
  unlinked: "unlinked",
  ai_generated: "generated with AI",
  exported: "exported",
  imported: "imported",
  member_added: "added a member to",
  member_removed: "removed a member from",
  settings_changed: "changed settings for",
};

const EVENT_COLORS: Record<string, string> = {
  created: "bg-green-500/15 text-green-600 dark:text-green-400",
  updated: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  deleted: "bg-red-500/15 text-red-600 dark:text-red-400",
  status_changed: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  linked: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
  unlinked: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  ai_generated: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  exported: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  imported: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  member_added: "bg-green-500/15 text-green-600 dark:text-green-400",
  member_removed: "bg-red-500/15 text-red-600 dark:text-red-400",
  settings_changed: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

const ENTITY_TYPES = [
  { value: "chapter", label: "Chapters" },
  { value: "song", label: "Songs" },
  { value: "image", label: "Images" },
  { value: "character", label: "Characters" },
  { value: "theme", label: "Themes" },
  { value: "note", label: "Notes" },
  { value: "conversation", label: "Conversations" },
];

const EVENT_TYPES = [
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "deleted", label: "Deleted" },
  { value: "status_changed", label: "Status Changed" },
  { value: "linked", label: "Linked" },
  { value: "ai_generated", label: "AI Generated" },
];

const PAGE_SIZE = 20;

// -- Component --

interface ActivityFeedViewProps {
  projectId: string | null;
}

export function ActivityFeedView({ projectId }: ActivityFeedViewProps) {
  const [events, setEvents] = useState<EnrichedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>("");
  const [entityFilter, setEntityFilter] = useState<string>("");

  const fetchEvents = useCallback(
    async (offset = 0, append = false) => {
      if (!projectId) return;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const params = new URLSearchParams({
          project_id: projectId,
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });

        if (eventFilter) params.set("event_type", eventFilter);
        if (entityFilter) params.set("entity_type", entityFilter);

        const res = await fetch(`/api/activity?${params}`);
        if (!res.ok) throw new Error("Failed to fetch activity");

        const { data } = await res.json();
        const items = data || [];

        if (append) {
          setEvents((prev) => [...prev, ...items]);
        } else {
          setEvents(items);
        }

        setHasMore(items.length === PAGE_SIZE);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [projectId, eventFilter, entityFilter]
  );

  useEffect(() => {
    fetchEvents(0, false);
  }, [fetchEvents]);

  const loadMore = () => {
    fetchEvents(events.length, true);
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
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!projectId) {
    return (
      <p className="text-sm text-muted-foreground">
        No project found. Create a project to see activity.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={eventFilter || undefined}
          onValueChange={(v) => v && setEventFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            {EVENT_TYPES.map((et) => (
              <SelectItem key={et.value} value={et.value}>
                {et.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={entityFilter || undefined}
          onValueChange={(v) => v && setEntityFilter(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entities</SelectItem>
            {ENTITY_TYPES.map((et) => (
              <SelectItem key={et.value} value={et.value}>
                {et.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-4 py-12 text-center">
          <Activity className="mx-auto mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">
            No activity yet
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Events will appear here as you create and edit content.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-1">
            {events.map((event) => {
              const EventIcon =
                EVENT_ICONS[event.eventType] || Pencil;
              const EntityIcon = event.entityType
                ? ENTITY_ICONS[event.entityType] || BookOpen
                : null;
              const colorClass =
                EVENT_COLORS[event.eventType] ||
                "bg-gray-500/15 text-gray-600";

              return (
                <div key={event.id} className="relative flex gap-4 py-3 pl-1">
                  {/* Event icon on timeline */}
                  <div
                    className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                  >
                    <EventIcon className="size-4" />
                  </div>

                  {/* Event content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start gap-2">
                      <Avatar className="size-5 shrink-0">
                        <AvatarImage
                          src={event.user.avatarUrl || undefined}
                          alt={event.user.displayName}
                        />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(event.user.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <p className="text-sm">
                        <span className="font-medium">
                          {event.user.displayName}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {EVENT_LABELS[event.eventType] || event.eventType}
                        </span>{" "}
                        {event.entityType && (
                          <span className="inline-flex items-center gap-1">
                            {EntityIcon && (
                              <EntityIcon className="inline size-3.5 text-muted-foreground" />
                            )}
                            <span className="font-medium">
                              {event.entityTitle || event.entityType}
                            </span>
                          </span>
                        )}
                      </p>

                      <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                        {formatTimestamp(event.createdAt)}
                      </span>
                    </div>

                    {/* Metadata details */}
                    {event.eventType === "status_changed" &&
                      event.metadata?.oldStatus != null &&
                      event.metadata?.newStatus != null ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {String(event.metadata.oldStatus)} →{" "}
                          {String(event.metadata.newStatus)}
                        </p>
                      ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-4 flex justify-center pl-14">
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
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
        </div>
      )}
    </div>
  );
}
