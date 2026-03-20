import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { PageShell } from "@/components/layout/page-shell";
import { CharactersListView } from "./characters-list-view";

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

export default async function CharactersPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  let characters: Character[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("ews_characters")
      .select("*")
      .in("project_id", projectIds)
      .order("name", { ascending: true });
    characters = (data as Character[]) ?? [];
  }

  const defaultProjectId = projectIds[0] ?? null;

  return (
    <PageShell
      title="Characters"
      description="Track narrative roles, symbolism, and story relevance"
    >
      <CharactersListView characters={characters} projectId={defaultProjectId} />
    </PageShell>
  );
}
