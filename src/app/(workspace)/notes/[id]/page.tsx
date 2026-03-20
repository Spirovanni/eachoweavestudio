import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { Button } from "@/components/ui/button";
import { NoteDetailView } from "./note-detail-view";

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

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("ews_notes")
    .select("*")
    .eq("id", id)
    .single<Note>();

  if (!note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">Note not found</p>
        <Link href="/notes">
          <Button variant="outline">Back to Notes</Button>
        </Link>
      </div>
    );
  }

  return <NoteDetailView note={note} userId={user.id} />;
}
