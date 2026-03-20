import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getAuthenticatedClient before importing the route
const mockSupabase = {
  from: vi.fn(),
};

const mockUser = { id: "user-1", email: "test@example.com" };

vi.mock("@/lib/api/helpers", () => ({
  getAuthenticatedClient: vi.fn(),
}));

import { GET, PATCH } from "./route";
import { getAuthenticatedClient } from "@/lib/api/helpers";

function createRequest(body?: Record<string, unknown>) {
  return {
    json: () => Promise.resolve(body || {}),
  } as any;
}

function mockQuery(result: { data?: unknown; error?: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
  };
  mockSupabase.from.mockReturnValue(chain);
  return chain;
}

describe("GET /api/settings/profile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: null,
      user: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }) as any,
    });

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns the user profile", async () => {
    const profile = {
      id: "user-1",
      display_name: "Test User",
      email: "test@example.com",
      role: "author",
      avatar_url: null,
      created_at: "2026-01-01T00:00:00Z",
    };

    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    mockQuery({ data: profile });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.display_name).toBe("Test User");
    expect(json.data.email).toBe("test@example.com");
  });
});

describe("PATCH /api/settings/profile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: null,
      user: null,
      error: Response.json({ error: "Unauthorized" }, { status: 401 }) as any,
    });

    const response = await PATCH(createRequest({ display_name: "New" }));
    expect(response.status).toBe(401);
  });

  it("returns 400 for empty display_name", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    const response = await PATCH(createRequest({ display_name: "" }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/non-empty/);
  });

  it("returns 400 when no fields provided", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    const response = await PATCH(createRequest({}));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/no profile fields/i);
  });

  it("updates display_name successfully", async () => {
    const updatedProfile = {
      id: "user-1",
      display_name: "Updated Name",
      email: "test@example.com",
    };

    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    mockQuery({ data: updatedProfile });

    const response = await PATCH(
      createRequest({ display_name: "Updated Name" })
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.display_name).toBe("Updated Name");
  });

  it("accepts null avatar_url", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    mockQuery({ data: { id: "user-1", avatar_url: null } });

    const response = await PATCH(createRequest({ avatar_url: null }));
    expect(response.status).toBe(200);
  });

  it("rejects invalid avatar_url type", async () => {
    vi.mocked(getAuthenticatedClient).mockResolvedValue({
      supabase: mockSupabase as any,
      user: mockUser as any,
      error: null,
    });

    const response = await PATCH(createRequest({ avatar_url: 123 }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toMatch(/avatar_url/);
  });
});
