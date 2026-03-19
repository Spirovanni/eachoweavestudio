import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";
import type { ChapterStatus } from "@/lib/types";

const VALID_STATUSES: ChapterStatus[] = [
  "idea",
  "outline",
  "draft",
  "revision",
  "complete",
  "published",
];

/**
 * PATCH /api/chapters/[id]/status
 * Update chapter status with validation
 *
 * Body: { status: ChapterStatus }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  // Validate status
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      {
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Get chapter to verify access
  const { data: chapter } = await supabase
    .from("ews_chapters")
    .select("project_id")
    .eq("id", id)
    .single();

  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // Verify project access
  const hasAccess = await verifyProjectAccess(
    supabase!,
    user!.id,
    chapter.project_id
  );
  if (!hasAccess) {
    return NextResponse.json(
      { error: "Access denied to this project" },
      { status: 403 }
    );
  }

  // Update status
  const { data: updatedChapter, error: updateError } = await supabase
    .from("ews_chapters")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    console.error("Chapter status update error:", updateError);
    return NextResponse.json(
      { error: "Failed to update chapter status" },
      { status: 500 }
    );
  }

  // TODO: Create activity event when activity_events table is added
  // await supabase.from("ews_activity_events").insert({
  //   user_id: user!.id,
  //   project_id: chapter.project_id,
  //   entity_type: "chapter",
  //   entity_id: id,
  //   action: "status_changed",
  //   metadata: { new_status: status },
  // });

  return NextResponse.json({ data: updatedChapter });
}
