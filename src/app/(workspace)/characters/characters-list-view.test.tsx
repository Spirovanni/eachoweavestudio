import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharactersListView } from "./characters-list-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockCharacters = [
  {
    id: "char-1",
    project_id: "proj-1",
    name: "Aria",
    description: "A fearless warrior searching for her lost kingdom",
    symbolism: "courage",
    created_by: "user-1",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "char-2",
    project_id: "proj-1",
    name: "Marcus",
    description: null,
    symbolism: null,
    created_by: "user-1",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
];

describe("CharactersListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all characters", () => {
    render(<CharactersListView characters={mockCharacters} projectId="proj-1" />);
    expect(screen.getByText("Aria")).toBeInTheDocument();
    expect(screen.getByText("Marcus")).toBeInTheDocument();
  });

  it("shows character descriptions", () => {
    render(<CharactersListView characters={mockCharacters} projectId="proj-1" />);
    expect(screen.getByText(/fearless warrior/)).toBeInTheDocument();
  });

  it("shows symbolism badges", () => {
    render(<CharactersListView characters={mockCharacters} projectId="proj-1" />);
    expect(screen.getByText("courage")).toBeInTheDocument();
  });

  it("links to character detail pages", () => {
    render(<CharactersListView characters={mockCharacters} projectId="proj-1" />);
    const link = screen.getByText("Aria").closest("a");
    expect(link).toHaveAttribute("href", "/characters/char-1");
  });

  it("shows empty state when no characters", () => {
    render(<CharactersListView characters={[]} projectId="proj-1" />);
    expect(screen.getByText(/No characters yet/)).toBeInTheDocument();
  });

  it("shows no-project message when projectId is null", () => {
    render(<CharactersListView characters={[]} projectId={null} />);
    expect(screen.getByText("Create a project to add characters")).toBeInTheDocument();
  });
});
