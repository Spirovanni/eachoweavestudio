"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentRenderer } from "@/components/editor/ContentRenderer";
import { RevisionHistory } from "@/components/chapters/RevisionHistory";
import { BookOpen, History } from "lucide-react";
import type { JSONContent } from "@tiptap/react";

interface ChapterDetailTabsProps {
  chapterId: string;
  content: JSONContent | null;
}

export function ChapterDetailTabs({
  chapterId,
  content,
}: ChapterDetailTabsProps) {
  return (
    <Tabs defaultValue="content" className="mx-auto max-w-4xl">
      <TabsList>
        <TabsTrigger value="content">
          <BookOpen className="mr-2 size-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="revisions">
          <History className="mr-2 size-4" />
          Revisions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-4">
        {content ? (
          <ContentRenderer content={content} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No content yet.{" "}
            <Link
              href={`/chapters/${chapterId}/edit`}
              className="text-primary underline underline-offset-4"
            >
              Start writing
            </Link>
          </p>
        )}
      </TabsContent>

      <TabsContent value="revisions" className="mt-4">
        <RevisionHistory chapterId={chapterId} />
      </TabsContent>
    </Tabs>
  );
}
