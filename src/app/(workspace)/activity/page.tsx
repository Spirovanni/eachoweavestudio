import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/auth";
import { PageShell } from "@/components/layout/page-shell";
import { ActivityFeedView } from "./activity-feed-view";

export default async function ActivityPage() {
  const user = await requireUser();
  const supabase = await createClient();

  // Get projects the user is a member of
  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id")
    .eq("user_id", user.id);

  const defaultProjectId = memberships?.[0]?.project_id ?? null;

  return (
    <PageShell
      title="Activity"
      description="Recent edits, comments, and events"
    >
      <ActivityFeedView projectId={defaultProjectId} />
    </PageShell>
  );
}
