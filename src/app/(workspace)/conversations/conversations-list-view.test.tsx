import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConversationsListView } from "./conversations-list-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockConversations = [
  {
    id: "conv-1",
    project_id: "proj-1",
    title: "Opening Scene Discussion",
    content: "We need to decide how the story opens. Should it start in medias res?",
    tags: ["plot", "opening"],
    created_by: "user-1",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "conv-2",
    project_id: "proj-1",
    title: "Ending Brainstorm",
    content: null,
    tags: ["ending"],
    created_by: "user-1",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
];

describe("ConversationsListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all conversations", () => {
    render(<ConversationsListView conversations={mockConversations} projectId="proj-1" />);
    expect(screen.getByText("Opening Scene Discussion")).toBeInTheDocument();
    expect(screen.getByText("Ending Brainstorm")).toBeInTheDocument();
  });

  it("shows content preview", () => {
    render(<ConversationsListView conversations={mockConversations} projectId="proj-1" />);
    expect(screen.getByText(/start in medias res/)).toBeInTheDocument();
  });

  it("displays tags as badges", () => {
    render(<ConversationsListView conversations={mockConversations} projectId="proj-1" />);
    expect(screen.getByText("plot")).toBeInTheDocument();
    expect(screen.getByText("opening")).toBeInTheDocument();
  });

  it("links to conversation detail pages", () => {
    render(<ConversationsListView conversations={mockConversations} projectId="proj-1" />);
    const link = screen.getByText("Opening Scene Discussion").closest("a");
    expect(link).toHaveAttribute("href", "/conversations/conv-1");
  });

  it("shows empty state when no conversations", () => {
    render(<ConversationsListView conversations={[]} projectId="proj-1" />);
    expect(screen.getByText(/No conversations yet/)).toBeInTheDocument();
  });

  it("shows no-project message when projectId is null", () => {
    render(<ConversationsListView conversations={[]} projectId={null} />);
    expect(screen.getByText("Create a project to add conversations")).toBeInTheDocument();
  });
});
