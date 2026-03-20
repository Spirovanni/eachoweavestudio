import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RevisionHistory } from "./RevisionHistory";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/editor/ContentRenderer", () => ({
  ContentRenderer: ({ content }: { content: unknown }) => (
    <div data-testid="content-renderer">Rendered content</div>
  ),
}));

const mockRevisions = [
  {
    id: "rev-1",
    chapterId: "ch-1",
    title: "Chapter One",
    summary: "Auto-saved revision",
    createdAt: "2026-03-19T10:00:00Z",
    editedBy: {
      id: "user-1",
      displayName: "Alice Writer",
      email: "alice@example.com",
      avatarUrl: null,
    },
  },
  {
    id: "rev-2",
    chapterId: "ch-1",
    title: "Chapter One (draft)",
    summary: "Major rewrite",
    createdAt: "2026-03-18T14:30:00Z",
    editedBy: {
      id: "user-2",
      displayName: "Bob Editor",
      email: "bob@example.com",
      avatarUrl: null,
    },
  },
];

function mockFetchList(revisions = mockRevisions, total = 2) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: revisions, total }),
  });
}

describe("RevisionHistory", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows loading state initially", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<RevisionHistory chapterId="ch-1" />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("renders revision list", async () => {
    mockFetchList();

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText("Alice Writer")).toBeInTheDocument();
    });

    expect(screen.getByText("Bob Editor")).toBeInTheDocument();
    expect(screen.getByText("2 revisions")).toBeInTheDocument();
  });

  it("shows revision summaries", async () => {
    mockFetchList();

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Auto-saved revision/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Major rewrite/)).toBeInTheDocument();
  });

  it("shows version numbers", async () => {
    mockFetchList();

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText("v2")).toBeInTheDocument();
    });

    expect(screen.getByText("v1")).toBeInTheDocument();
  });

  it("shows empty state when no revisions", async () => {
    mockFetchList([], 0);

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText(/No revisions yet/)).toBeInTheDocument();
    });
  });

  it("shows singular revision text for one revision", async () => {
    mockFetchList([mockRevisions[0]], 1);

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText("1 revision")).toBeInTheDocument();
    });
  });

  it("opens view dialog when clicking View button", async () => {
    const user = userEvent.setup();
    mockFetchList();

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(screen.getByText("Alice Writer")).toBeInTheDocument();
    });

    // Mock the single revision fetch for viewing
    const revisionContent = {
      ...mockRevisions[0],
      content: { type: "doc", content: [{ type: "paragraph" }] },
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: revisionContent }),
    });

    const viewButtons = screen.getAllByRole("button", { name: /view/i });
    await user.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("content-renderer")).toBeInTheDocument();
    });
  });

  it("fetches revisions with correct URL", async () => {
    mockFetchList();

    render(<RevisionHistory chapterId="ch-1" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const url = (global.fetch as any).mock.calls[0][0] as string;
    expect(url).toContain("/api/chapters/ch-1/revisions");
    expect(url).toContain("limit=10");
    expect(url).toContain("offset=0");
  });
});
