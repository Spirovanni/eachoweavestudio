import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { PageShell } from "@/components/layout/page-shell";
import { NotesListView } from "./notes-list-view";

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

export default async function NotesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // Get projects the user is a member of
  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  let notes: Note[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("ews_notes")
      .select("*")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false });
    notes = (data as Note[]) ?? [];
  }

  const defaultProjectId = projectIds[0] ?? null;

  return (
    <PageShell
      title="Notes"
      description="Capture ideas before they are formalized"
    >
      <NotesListView notes={notes} projectId={defaultProjectId} />
    </PageShell>
  );
}
