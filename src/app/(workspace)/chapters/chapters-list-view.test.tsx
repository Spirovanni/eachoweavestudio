import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChaptersListView } from "./chapters-list-view";
import type { Chapter } from "@/lib/types";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockChapters: Chapter[] = [
  {
    id: "ch-1",
    project_id: "proj-1",
    title: "The Beginning",
    summary: "Where it all starts",
    content: null,
    status: "draft",
    order_index: 0,
    created_by: "user-1",
    created_at: "2026-03-10T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "ch-2",
    project_id: "proj-1",
    title: "The Middle",
    summary: null,
    content: null,
    status: "idea",
    order_index: 1,
    created_by: "user-1",
    created_at: "2026-03-11T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
  {
    id: "ch-3",
    project_id: "proj-1",
    title: "The End",
    summary: "Grand finale",
    content: null,
    status: "complete",
    order_index: 2,
    created_by: "user-1",
    created_at: "2026-03-12T00:00:00Z",
    updated_at: "2026-03-17T00:00:00Z",
  },
];

describe("ChaptersListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all chapters", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    expect(screen.getByText("The Beginning")).toBeInTheDocument();
    expect(screen.getByText("The Middle")).toBeInTheDocument();
    expect(screen.getByText("The End")).toBeInTheDocument();
  });

  it("displays chapter summaries", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    expect(screen.getByText("Where it all starts")).toBeInTheDocument();
    expect(screen.getByText("Grand finale")).toBeInTheDocument();
  });

  it("displays chapter status badges", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    expect(screen.getByText("draft")).toBeInTheDocument();
    expect(screen.getByText("idea")).toBeInTheDocument();
    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("displays order numbers", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    expect(screen.getByText("1.")).toBeInTheDocument();
    expect(screen.getByText("2.")).toBeInTheDocument();
    expect(screen.getByText("3.")).toBeInTheDocument();
  });

  it("links to chapter detail pages", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    const link = screen.getByText("The Beginning").closest("a");
    expect(link).toHaveAttribute("href", "/chapters/ch-1");
  });

  it("shows empty state when no chapters", () => {
    render(<ChaptersListView chapters={[]} projectId="proj-1" />);

    expect(
      screen.getByText("No chapters yet. Click 'New Chapter' to create one.")
    ).toBeInTheDocument();
  });

  it("shows project required message when no projectId", () => {
    render(<ChaptersListView chapters={[]} projectId={null} />);

    expect(
      screen.getByText("Create a project to add chapters")
    ).toBeInTheDocument();
  });

  it("sorts chapters by order index by default", () => {
    render(
      <ChaptersListView chapters={mockChapters} projectId="proj-1" />
    );

    const titles = screen.getAllByRole("heading");
    const titleTexts = titles.map((h) => h.textContent);
    expect(titleTexts).toEqual(["The Beginning", "The Middle", "The End"]);
  });
});
