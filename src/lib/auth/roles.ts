import type { SupabaseClient } from "@supabase/supabase-js";
import type { ProjectMemberRole } from "@/lib/types";

/**
 * Check if a user is an admin of a specific project.
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @param projectId - Project ID to check
 * @returns true if user is an admin of the project, false otherwise
 */
export async function isProjectAdmin(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("ews_project_members")
    .select("role")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === "admin";
}

/**
 * Check if a user has admin role in their profile (global admin).
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @returns true if user has global admin role, false otherwise
 */
export async function isGlobalAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("ews_profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === "admin";
}

/**
 * Get a user's role for a specific project.
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param projectId - Project ID
 * @returns The user's role in the project, or null if not a member
 */
export async function getProjectRole(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<ProjectMemberRole | null> {
  const { data, error } = await supabase
    .from("ews_project_members")
    .select("role")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role;
}

/**
 * Require admin role for a project, throw error if not admin.
 *
 * @param supabase - Supabase client
 * @param userId - User ID to check
 * @param projectId - Project ID to check
 * @throws Error if user is not an admin
 */
export async function requireProjectAdmin(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<void> {
  const isAdmin = await isProjectAdmin(supabase, userId, projectId);

  if (!isAdmin) {
    throw new Error("Admin access required for this operation");
  }
}
