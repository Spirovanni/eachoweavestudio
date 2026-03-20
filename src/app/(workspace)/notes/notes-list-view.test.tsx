import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotesListView } from "./notes-list-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockNotes = [
  {
    id: "n-1",
    project_id: "proj-1",
    title: "Character Backstory Ideas",
    content: "Explore the protagonist's childhood trauma and how it shapes their worldview.",
    tags: ["character", "plot"],
    created_by: "user-1",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "n-2",
    project_id: "proj-1",
    title: "World Building Notes",
    content: null,
    tags: ["worldbuilding"],
    created_by: "user-1",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
];

describe("NotesListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all notes", () => {
    render(<NotesListView notes={mockNotes} projectId="proj-1" />);
    expect(screen.getByText("Character Backstory Ideas")).toBeInTheDocument();
    expect(screen.getByText("World Building Notes")).toBeInTheDocument();
  });

  it("shows content preview", () => {
    render(<NotesListView notes={mockNotes} projectId="proj-1" />);
    expect(screen.getByText(/protagonist's childhood/)).toBeInTheDocument();
  });

  it("displays tags as badges", () => {
    render(<NotesListView notes={mockNotes} projectId="proj-1" />);
    expect(screen.getByText("character")).toBeInTheDocument();
    expect(screen.getByText("plot")).toBeInTheDocument();
  });

  it("links to note detail pages", () => {
    render(<NotesListView notes={mockNotes} projectId="proj-1" />);
    const link = screen.getByText("Character Backstory Ideas").closest("a");
    expect(link).toHaveAttribute("href", "/notes/n-1");
  });

  it("shows empty state when no notes", () => {
    render(<NotesListView notes={[]} projectId="proj-1" />);
    expect(screen.getByText(/No notes yet/)).toBeInTheDocument();
  });

  it("shows no-project message when projectId is null", () => {
    render(<NotesListView notes={[]} projectId={null} />);
    expect(screen.getByText("Create a project to add notes")).toBeInTheDocument();
  });
});
