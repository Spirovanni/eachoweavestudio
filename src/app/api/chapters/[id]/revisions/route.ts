import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";

/**
 * GET /api/chapters/[id]/revisions
 * List all revisions for a chapter with pagination
 *
 * Query params:
 * - limit?: number (default 20, max 100)
 * - offset?: number (default 0)
 *
 * Returns: { data: Revision[], total: number }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { id: chapterId } = await params;
  const searchParams = request.nextUrl.searchParams;
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");

  // Parse pagination params
  const limit = Math.min(parseInt(limitParam || "20", 10), 100);
  const offset = parseInt(offsetParam || "0", 10);

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

  // Fetch revisions with user info
  const { data: revisions, error: revisionsError } = await supabase!
    .from("ews_chapter_revisions")
    .select(`
      id,
      chapter_id,
      title,
      summary,
      edited_by,
      created_at,
      ews_profiles!inner(id, display_name, email, avatar_url)
    `)
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (revisionsError) {
    console.error("Revisions fetch error:", revisionsError);
    return NextResponse.json(
      { error: "Failed to fetch revisions" },
      { status: 500 }
    );
  }

  // Get total count for pagination
  const { count, error: countError } = await supabase!
    .from("ews_chapter_revisions")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId);

  if (countError) {
    console.error("Count error:", countError);
  }

  // Transform response
  const transformedRevisions = (revisions || []).map((rev: any) => {
    const userProfile = Array.isArray(rev.ews_profiles)
      ? rev.ews_profiles[0]
      : rev.ews_profiles;

    return {
      id: rev.id,
      chapterId: rev.chapter_id,
      title: rev.title,
      summary: rev.summary,
      createdAt: rev.created_at,
      editedBy: {
        id: userProfile.id,
        displayName: userProfile.display_name,
        email: userProfile.email,
        avatarUrl: userProfile.avatar_url,
      },
    };
  });

  return NextResponse.json({
    data: transformedRevisions,
    total: count || 0,
  });
}
