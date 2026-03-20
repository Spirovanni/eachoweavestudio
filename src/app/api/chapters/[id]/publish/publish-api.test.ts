import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSupabase = {
  from: vi.fn(),
};

vi.mock("@/lib/api/helpers", () => ({
  getAuthenticatedClient: vi.fn(),
  verifyProjectAccess: vi.fn(),
}));

import { PATCH } from "./route";
import { getAuthenticatedClient, verifyProjectAccess } from "@/lib/api/helpers";

function createParams(id: string) {
  return { params: Promise.resolve({ id }) } as any;
}

function mockChapterQuery(chapter: unknown) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: chapter, error: null }),
    update: vi.fn().mockReturnThis(),
  };
  mockSupabase.from.mockReturnValue(chain);
  return chain;
}

describe("PATCH /api/chapters/[id]/publish", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: null,
      user: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }) as any,
    });

    const response = await PATCH({} as any, createParams("ch-1"));
    expect(response.status).toBe(401);
  });

  it("returns 404 when chapter not found", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "user-1" } as any,
      error: null,
    });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
    };
    mockSupabase.from.mockReturnValue(chain);

    const response = await PATCH({} as any, createParams("ch-missing"));
    expect(response.status).toBe(404);
  });

  it("returns 403 when user has no project access", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "user-1" } as any,
      error: null,
    });

    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { project_id: "proj-1", status: "complete" },
        error: null,
      }),
    };
    mockSupabase.from.mockReturnValue(chain);
    vi.mocked(verifyProjectAccess).mockResolvedValue(false);

    const response = await PATCH({} as any, createParams("ch-1"));
    expect(response.status).toBe(403);
  });

  it("toggles from complete to published", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "user-1" } as any,
      error: null,
    });
    vi.mocked(verifyProjectAccess).mockResolvedValue(true);

    // First call: fetch chapter (returns complete status)
    // Second call: update chapter
    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { project_id: "proj-1", status: "complete" },
            error: null,
          }),
        };
      }
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "ch-1", status: "published" },
          error: null,
        }),
      };
    });

    const response = await PATCH({} as any, createParams("ch-1"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.status).toBe("published");
  });

  it("toggles from published back to complete", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: { id: "user-1" } as any,
      error: null,
    });
    vi.mocked(verifyProjectAccess).mockResolvedValue(true);

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: { project_id: "proj-1", status: "published" },
            error: null,
          }),
        };
      }
      return {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: "ch-1", status: "complete" },
          error: null,
        }),
      };
    });

    const response = await PATCH({} as any, createParams("ch-1"));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.status).toBe("complete");
  });
});
