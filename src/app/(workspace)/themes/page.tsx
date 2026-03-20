import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { PageShell } from "@/components/layout/page-shell";
import { ThemesListView } from "./themes-list-view";

interface Theme {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default async function ThemesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  let themes: Theme[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("ews_themes")
      .select("*")
      .in("project_id", projectIds)
      .order("name", { ascending: true });
    themes = (data as Theme[]) ?? [];
  }

  const defaultProjectId = projectIds[0] ?? null;

  return (
    <PageShell
      title="Themes"
      description="Recurring motifs, emotional arcs, and symbolic through-lines"
    >
      <ThemesListView themes={themes} projectId={defaultProjectId} />
    </PageShell>
  );
}
