import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActivityFeedView } from "./activity-feed-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const mockEvents = [
  {
    id: "evt-1",
    projectId: "proj-1",
    userId: "user-1",
    eventType: "created",
    entityType: "chapter",
    entityId: "ch-1",
    entityTitle: "The Beginning",
    metadata: {},
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    user: {
      id: "user-1",
      displayName: "Alice Writer",
      email: "alice@example.com",
      avatarUrl: null,
    },
  },
  {
    id: "evt-2",
    projectId: "proj-1",
    userId: "user-2",
    eventType: "status_changed",
    entityType: "chapter",
    entityId: "ch-2",
    entityTitle: "Chapter Two",
    metadata: { oldStatus: "draft", newStatus: "revision" },
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
    user: {
      id: "user-2",
      displayName: "Bob Editor",
      email: "bob@example.com",
      avatarUrl: null,
    },
  },
  {
    id: "evt-3",
    projectId: "proj-1",
    userId: "user-1",
    eventType: "ai_generated",
    entityType: "song",
    entityId: "song-1",
    entityTitle: "Echo Song",
    metadata: {},
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    user: {
      id: "user-1",
      displayName: "Alice Writer",
      email: "alice@example.com",
      avatarUrl: null,
    },
  },
];

function mockFetchSuccess(data: unknown[] = mockEvents) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data }),
  });
}

describe("ActivityFeedView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows no-project message when projectId is null", () => {
    render(<ActivityFeedView projectId={null} />);

    expect(
      screen.getByText(/no project found/i)
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    // Never resolve the fetch
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<ActivityFeedView projectId="proj-1" />);

    // Loader2 spinner is rendered (svg with animate-spin)
    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders activity events", async () => {
    mockFetchSuccess();

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getAllByText("Alice Writer").length).toBeGreaterThan(0);
    });

    expect(screen.getByText("The Beginning")).toBeInTheDocument();
    expect(screen.getByText("Bob Editor")).toBeInTheDocument();
    expect(screen.getByText("Chapter Two")).toBeInTheDocument();
  });

  it("shows event type labels", async () => {
    mockFetchSuccess();

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText("created")).toBeInTheDocument();
    });

    expect(screen.getByText("changed status of")).toBeInTheDocument();
    expect(screen.getByText("generated with AI")).toBeInTheDocument();
  });

  it("shows status change metadata", async () => {
    mockFetchSuccess();

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText(/draft → revision/)).toBeInTheDocument();
    });
  });

  it("shows relative timestamps", async () => {
    mockFetchSuccess();

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText("5m ago")).toBeInTheDocument();
    });

    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getByText("1d ago")).toBeInTheDocument();
  });

  it("shows empty state when no events", async () => {
    mockFetchSuccess([]);

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(screen.getByText("No activity yet")).toBeInTheDocument();
    });
  });

  it("fetches with filters applied", async () => {
    mockFetchSuccess();

    render(<ActivityFeedView projectId="proj-1" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const url = (global.fetch as any).mock.calls[0][0] as string;
    expect(url).toContain("project_id=proj-1");
    expect(url).toContain("limit=20");
    expect(url).toContain("offset=0");
  });
});
