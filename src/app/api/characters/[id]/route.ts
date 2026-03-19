import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";

/**
 * GET /api/characters/[id]
 * Get a single character with linked chapters.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { data, error: dbError } = await supabase!
    .from("ews_characters")
    .select("*")
    .eq("id", id)
    .single();

  if (dbError || !data) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const hasAccess = await verifyProjectAccess(
    supabase!,
    user!.id,
    data.project_id
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fetch linked chapters via junction table
  const { data: linkedChapters } = await supabase!
    .from("ews_chapter_characters")
    .select(
      `
      chapter_id,
      created_at,
      ews_chapters!inner(id, title, status, order_index)
    `
    )
    .eq("character_id", id);

  const chapters = (linkedChapters || []).map((link: any) => {
    const chapter = Array.isArray(link.ews_chapters)
      ? link.ews_chapters[0]
      : link.ews_chapters;
    return {
      id: chapter.id,
      title: chapter.title,
      status: chapter.status,
      orderIndex: chapter.order_index,
      linkedAt: link.created_at,
    };
  });

  return NextResponse.json({ data: { ...data, chapters } });
}

/**
 * PATCH /api/characters/[id]
 * Update a character. Body: { name?, description?, symbolism? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { data: existing, error: fetchError } = await supabase!
    .from("ews_characters")
    .select("project_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const hasAccess = await verifyProjectAccess(
    supabase!,
    user!.id,
    existing.project_id
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const allowedFields = ["name", "description", "symbolism"];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  const { data, error: dbError } = await supabase!
    .from("ews_characters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/**
 * DELETE /api/characters/[id]
 * Delete a character.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const { data: existing, error: fetchError } = await supabase!
    .from("ews_characters")
    .select("project_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Character not found" },
      { status: 404 }
    );
  }

  const hasAccess = await verifyProjectAccess(
    supabase!,
    user!.id,
    existing.project_id
  );
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: dbError } = await supabase!
    .from("ews_characters")
    .delete()
    .eq("id", id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
