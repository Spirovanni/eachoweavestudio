import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { PageShell } from "@/components/layout/page-shell";
import { ConversationsListView } from "./conversations-list-view";

interface Conversation {
  id: string;
  project_id: string;
  title: string;
  content: string | null;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default async function ConversationsPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const projectIds = memberships?.map((m) => m.project_id) ?? [];

  let conversations: Conversation[] = [];
  if (projectIds.length > 0) {
    const { data } = await supabase
      .from("ews_conversations")
      .select("*")
      .in("project_id", projectIds)
      .order("updated_at", { ascending: false });
    conversations = (data as Conversation[]) ?? [];
  }

  const defaultProjectId = projectIds[0] ?? null;

  return (
    <PageShell
      title="Conversations"
      description="Archive meaningful conversations that inspire the story"
    >
      <ConversationsListView
        conversations={conversations}
        projectId={defaultProjectId}
      />
    </PageShell>
  );
}
