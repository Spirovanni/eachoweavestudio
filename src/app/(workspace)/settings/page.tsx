import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";
import type { Profile } from "@/lib/types";
import type { AISettings } from "@/components/settings/ai-settings";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Fetch user profile
  const { data: profile, error } = await supabase
    .from("ews_profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    console.error("Failed to fetch profile:", error);
    redirect("/login");
  }

  // Get projects the user is a member of
  const { data: memberships } = await supabase
    .from("ews_project_members")
    .select("project_id, ews_projects!inner(id, name)")
    .eq("user_id", user.id);

  const projects = memberships?.map((m: any) => ({
    id: m.project_id,
    name: m.ews_projects.name,
  })) ?? [];

  // Get project settings for the first project (if available)
  let aiSettings: AISettings = {};
  const defaultProjectId = projects[0]?.id ?? null;

  if (defaultProjectId) {
    const { data: projectSettings } = await supabase
      .from("ews_project_settings")
      .select("settings")
      .eq("project_id", defaultProjectId)
      .single();

    aiSettings = projectSettings?.settings?.ai || {};
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <SettingsView
        profile={profile}
        projectId={defaultProjectId}
        aiSettings={aiSettings}
      />
    </div>
  );
}
