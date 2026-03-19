import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "./settings-view";
import type { Profile } from "@/lib/types";

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user profile
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("ews_profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  if (error || !profile) {
    console.error("Failed to fetch profile:", error);
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <SettingsView profile={profile} />
    </div>
  );
}
