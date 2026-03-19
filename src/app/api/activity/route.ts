import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";
import type { ActivityEventType, ActivityEntityType } from "@/lib/activity/events";

/**
 * GET /api/activity
 * Retrieve activity events with enriched data (user names, entity titles)
 *
 * Query params:
 * - project_id: string (required)
 * - limit?: number (default 20, max 100)
 * - offset?: number (default 0)
 * - event_type?: ActivityEventType
 * - entity_type?: ActivityEntityType
 * - user_id?: string
 *
 * Returns: { data: EnrichedActivityEvent[] }
 */
export async function GET(request: NextRequest) {
  const { supabase, user, error } = await getAuthenticatedClient();
  if (error) return error;

  const searchParams = request.nextUrl.searchParams;
  const projectId = searchParams.get("project_id");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const eventType = searchParams.get("event_type") as ActivityEventType | null;
  const entityType = searchParams.get("entity_type") as ActivityEntityType | null;
  const userId = searchParams.get("user_id");

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

  // Parse pagination params
  const limit = Math.min(parseInt(limitParam || "20", 10), 100);
  const offset = parseInt(offsetParam || "0", 10);

  // Build query with filters
  let query = supabase!
    .from("ews_activity_events")
    .select(`
      id,
      project_id,
      user_id,
      event_type,
      entity_type,
      entity_id,
      metadata,
      created_at,
      ews_profiles!inner(id, display_name, email, avatar_url)
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType) {
    query = query.eq("event_type", eventType);
  }

  if (entityType) {
    query = query.eq("entity_type", entityType);
  }

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: events, error: eventsError } = await query;

  if (eventsError) {
    console.error("Activity events fetch error:", eventsError);
    return NextResponse.json(
      { error: "Failed to fetch activity events" },
      { status: 500 }
    );
  }

  // Enrich events with entity titles
  const enrichedEvents = await Promise.all(
    (events || []).map(async (event: any) => {
      let entityTitle: string | null = null;

      // Fetch entity title based on entity type
      if (event.entity_type && event.entity_id) {
        entityTitle = await fetchEntityTitle(
          supabase!,
          event.entity_type,
          event.entity_id
        );
      }

      // Extract user profile
      const userProfile = Array.isArray(event.ews_profiles)
        ? event.ews_profiles[0]
        : event.ews_profiles;

      return {
        id: event.id,
        projectId: event.project_id,
        userId: event.user_id,
        eventType: event.event_type,
        entityType: event.entity_type,
        entityId: event.entity_id,
        entityTitle,
        metadata: event.metadata,
        createdAt: event.created_at,
        user: {
          id: userProfile.id,
          displayName: userProfile.display_name,
          email: userProfile.email,
          avatarUrl: userProfile.avatar_url,
        },
      };
    })
  );

  return NextResponse.json({ data: enrichedEvents });
}

/**
 * Fetch entity title based on entity type
 */
async function fetchEntityTitle(
  supabase: any,
  entityType: string,
  entityId: string
): Promise<string | null> {
  try {
    let tableName: string;
    let titleColumn: string;

    switch (entityType) {
      case "project":
        tableName = "ews_projects";
        titleColumn = "title";
        break;
      case "chapter":
        tableName = "ews_chapters";
        titleColumn = "title";
        break;
      case "song":
        tableName = "ews_songs";
        titleColumn = "title";
        break;
      case "image":
        tableName = "ews_images";
        titleColumn = "title";
        break;
      case "conversation":
        tableName = "ews_conversations";
        titleColumn = "title";
        break;
      case "character":
        tableName = "ews_characters";
        titleColumn = "name";
        break;
      case "theme":
        tableName = "ews_themes";
        titleColumn = "name";
        break;
      case "note":
        tableName = "ews_notes";
        titleColumn = "title";
        break;
      default:
        return null;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select(titleColumn)
      .eq("id", entityId)
      .single();

    if (error || !data) {
      return null;
    }

    return data[titleColumn] as string;
  } catch (error) {
    console.error("Failed to fetch entity title:", error);
    return null;
  }
}
