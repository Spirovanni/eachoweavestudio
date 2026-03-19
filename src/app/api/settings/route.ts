import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";

/**
 * GET /api/settings?project_id=...
 * Get project settings for a specific project.
 *
 * Returns: { data: ProjectSettings }
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return NextResponse.json(
      { error: "project_id query parameter is required" },
      { status: 400 }
    );
  }

  // Verify user has access to the project
  const hasAccess = await verifyProjectAccess(supabase!, user!.id, projectId);
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get project settings
  const { data, error: settingsError } = await supabase!
    .from("ews_project_settings")
    .select("*")
    .eq("project_id", projectId)
    .single();

  if (settingsError) {
    console.error("Settings fetch error:", settingsError);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

/**
 * PATCH /api/settings
 * Update project settings. Admin-only operation.
 *
 * Body: {
 *   project_id: string,
 *   adult_module_enabled?: boolean,
 *   publishing_enabled?: boolean,
 *   ai_enabled?: boolean,
 *   collaboration_enabled?: boolean,
 *   settings?: Record<string, unknown>
 * }
 *
 * Returns: { data: ProjectSettings }
 */
export async function PATCH(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const {
    project_id,
    adult_module_enabled,
    publishing_enabled,
    ai_enabled,
    collaboration_enabled,
    settings,
  } = body;

  if (!project_id) {
    return NextResponse.json(
      { error: "project_id is required" },
      { status: 400 }
    );
  }

  // Verify user is an admin of the project
  const { data: membership } = await supabase!
    .from("ews_project_members")
    .select("role")
    .eq("project_id", project_id)
    .eq("user_id", user!.id)
    .single();

  if (!membership || membership.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required to update project settings" },
      { status: 403 }
    );
  }

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};
  if (adult_module_enabled !== undefined) updates.adult_module_enabled = adult_module_enabled;
  if (publishing_enabled !== undefined) updates.publishing_enabled = publishing_enabled;
  if (ai_enabled !== undefined) updates.ai_enabled = ai_enabled;
  if (collaboration_enabled !== undefined) updates.collaboration_enabled = collaboration_enabled;
  if (settings !== undefined) updates.settings = settings;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No settings provided to update" },
      { status: 400 }
    );
  }

  // Update settings
  const { data: updatedSettings, error: updateError } = await supabase!
    .from("ews_project_settings")
    .update(updates)
    .eq("project_id", project_id)
    .select()
    .single();

  if (updateError) {
    console.error("Settings update error:", updateError);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }

  // Log activity event
  await supabase!.from("ews_activity_events").insert({
    project_id,
    user_id: user!.id,
    event_type: "settings_changed",
    entity_type: "project",
    entity_id: project_id,
    metadata: { changes: updates },
  });

  return NextResponse.json({ data: updatedSettings });
}
