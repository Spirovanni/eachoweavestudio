import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";

/**
 * GET /api/chapters/[id]/revisions/[revisionId]
 * Get a specific revision with full content
 *
 * Returns: { data: Revision }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; revisionId: string }> }
) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { id: chapterId, revisionId } = await params;

  // Get chapter to verify access
  const { data: chapter, error: chapterError } = await supabase!
    .from("ews_chapters")
    .select("project_id")
    .eq("id", chapterId)
    .single();

  if (chapterError || !chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  // Verify user has access to the project
  const hasAccess = await verifyProjectAccess(
    supabase!,
    user!.id,
    chapter.project_id
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch revision with full content
  const { data: revision, error: revisionError } = await supabase!
    .from("ews_chapter_revisions")
    .select(`
      id,
      chapter_id,
      content,
      title,
      summary,
      edited_by,
      created_at,
      ews_profiles!inner(id, display_name, email, avatar_url)
    `)
    .eq("id", revisionId)
    .eq("chapter_id", chapterId)
    .single();

  if (revisionError || !revision) {
    return NextResponse.json({ error: "Revision not found" }, { status: 404 });
  }

  // Transform response
  const userProfile = Array.isArray((revision as any).ews_profiles)
    ? (revision as any).ews_profiles[0]
    : (revision as any).ews_profiles;

  const transformedRevision = {
    id: (revision as any).id,
    chapterId: (revision as any).chapter_id,
    content: (revision as any).content,
    title: (revision as any).title,
    summary: (revision as any).summary,
    createdAt: (revision as any).created_at,
    editedBy: {
      id: userProfile.id,
      displayName: userProfile.display_name,
      email: userProfile.email,
      avatarUrl: userProfile.avatar_url,
    },
  };

  return NextResponse.json({ data: transformedRevision });
}
