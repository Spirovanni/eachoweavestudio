import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/api/helpers";

/**
 * GET /api/settings/profile
 * Get the current user's profile.
 *
 * Returns: { data: Profile }
 */
export async function GET() {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  // Get user profile
  const { data, error: profileError } = await supabase!
    .from("ews_profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

/**
 * PATCH /api/settings/profile
 * Update the current user's profile.
 *
 * Body: {
 *   display_name?: string,
 *   avatar_url?: string
 * }
 *
 * Returns: { data: Profile }
 */
export async function PATCH(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const body = await request.json();
  const { display_name, avatar_url } = body;

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};
  if (display_name !== undefined) {
    if (typeof display_name !== "string" || display_name.trim().length === 0) {
      return NextResponse.json(
        { error: "display_name must be a non-empty string" },
        { status: 400 }
      );
    }
    updates.display_name = display_name.trim();
  }
  if (avatar_url !== undefined) {
    if (avatar_url !== null && typeof avatar_url !== "string") {
      return NextResponse.json(
        { error: "avatar_url must be a string or null" },
        { status: 400 }
      );
    }
    updates.avatar_url = avatar_url;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No profile fields provided to update" },
      { status: 400 }
    );
  }

  // Update profile
  const { data: updatedProfile, error: updateError } = await supabase!
    .from("ews_profiles")
    .update(updates)
    .eq("id", user!.id)
    .select()
    .single();

  if (updateError) {
    console.error("Profile update error:", updateError);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: updatedProfile });
}
