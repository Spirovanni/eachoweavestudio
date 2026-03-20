import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ContentRenderer } from "@/components/editor/ContentRenderer";

export default async function PublicChapterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: chapter } = await supabase
    .from("ews_chapters")
    .select("id, title, summary, content, order_index, created_at, updated_at")
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (!chapter) {
    notFound();
  }

  return (
    <article className="space-y-6">
      <div>
        <Link
          href="/public/chapters"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; All chapters
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Chapter {chapter.order_index + 1}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{chapter.title}</h1>
        {chapter.summary && (
          <p className="text-lg text-muted-foreground">{chapter.summary}</p>
        )}
      </header>

      <hr className="border-border" />

      <div className="prose prose-zinc dark:prose-invert max-w-none">
        {chapter.content ? (
          <ContentRenderer content={chapter.content} />
        ) : (
          <p className="text-muted-foreground italic">No content yet.</p>
        )}
      </div>
    </article>
  );
}
