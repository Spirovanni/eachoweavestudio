"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Music,
  ImageIcon,
  Users,
  Palette,
  StickyNote,
  MessageSquare,
  Loader2,
  TrendingUp,
} from "lucide-react";

type DashboardStats = {
  chapters: {
    total: number;
    byStatus: Record<string, number>;
  };
  songs: { total: number };
  images: { total: number };
  characters: { total: number };
  themes: { total: number };
  notes: { total: number };
  conversations: { total: number };
};

type RecentActivity = {
  id: string;
  type: string;
  title: string;
  updated_at: string;
};

const ENTITY_CONFIG = {
  chapter: { icon: BookOpen, label: "Chapter", href: "/chapters" },
  song: { icon: Music, label: "Song", href: "/songs" },
  image: { icon: ImageIcon, label: "Image", href: "/images" },
  character: { icon: Users, label: "Character", href: "/characters" },
  theme: { icon: Palette, label: "Theme", href: "/themes" },
  note: { icon: StickyNote, label: "Note", href: "/notes" },
  conversation: { icon: MessageSquare, label: "Conversation", href: "/conversations" },
};

const STATUS_LABELS: Record<string, string> = {
  idea: "Idea",
  outline: "Outline",
  draft: "Draft",
  revision: "Revision",
  complete: "Complete",
  published: "Published",
};

export function DashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, recentRes] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/dashboard/recent?limit=10"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecent(recentData.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const entityCounts = [
    { icon: BookOpen, label: "Chapters", count: stats?.chapters.total ?? 0, href: "/chapters" },
    { icon: Music, label: "Songs", count: stats?.songs.total ?? 0, href: "/songs" },
    { icon: ImageIcon, label: "Images", count: stats?.images.total ?? 0, href: "/images" },
    { icon: Users, label: "Characters", count: stats?.characters.total ?? 0, href: "/characters" },
    { icon: Palette, label: "Themes", count: stats?.themes.total ?? 0, href: "/themes" },
    { icon: StickyNote, label: "Notes", count: stats?.notes.total ?? 0, href: "/notes" },
    { icon: MessageSquare, label: "Conversations", count: stats?.conversations.total ?? 0, href: "/conversations" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {entityCounts.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-2xl font-bold">{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chapter status breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chapter Progress</CardTitle>
            <CardDescription>Breakdown by status</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.chapters.total === 0 ? (
              <p className="text-sm text-muted-foreground">
                No chapters yet.{" "}
                <Link href="/chapters" className="text-primary underline underline-offset-4">
                  Create your first chapter
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats?.chapters.byStatus ?? {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{STATUS_LABELS[status] || status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{count}</span>
                      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(count / (stats?.chapters.total ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Last 10 updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recent.map((item) => {
                  const config = ENTITY_CONFIG[item.type as keyof typeof ENTITY_CONFIG];
                  if (!config) return null;
                  const Icon = config.icon;

                  return (
                    <Link
                      key={`${item.type}-${item.id}`}
                      href={`${config.href}/${item.id}`}
                      className="flex items-start gap-2 text-sm transition-colors hover:text-primary"
                    >
                      <Icon className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.updated_at).toLocaleDateString()} •{" "}
                          {config.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
