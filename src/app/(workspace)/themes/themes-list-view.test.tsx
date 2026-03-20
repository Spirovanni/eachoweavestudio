import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemesListView } from "./themes-list-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockThemes = [
  {
    id: "t-1",
    project_id: "proj-1",
    name: "Redemption",
    description: "The journey from darkness to light",
    created_by: "user-1",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "t-2",
    project_id: "proj-1",
    name: "Loss of Innocence",
    description: null,
    created_by: "user-1",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
];

describe("ThemesListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all themes", () => {
    render(<ThemesListView themes={mockThemes} projectId="proj-1" />);
    expect(screen.getByText("Redemption")).toBeInTheDocument();
    expect(screen.getByText("Loss of Innocence")).toBeInTheDocument();
  });

  it("shows theme descriptions", () => {
    render(<ThemesListView themes={mockThemes} projectId="proj-1" />);
    expect(screen.getByText("The journey from darkness to light")).toBeInTheDocument();
  });

  it("links to theme detail pages", () => {
    render(<ThemesListView themes={mockThemes} projectId="proj-1" />);
    const link = screen.getByText("Redemption").closest("a");
    expect(link).toHaveAttribute("href", "/themes/t-1");
  });

  it("shows empty state when no themes", () => {
    render(<ThemesListView themes={[]} projectId="proj-1" />);
    expect(screen.getByText(/No themes yet/)).toBeInTheDocument();
  });

  it("shows no-project message when projectId is null", () => {
    render(<ThemesListView themes={[]} projectId={null} />);
    expect(screen.getByText("Create a project to add themes")).toBeInTheDocument();
  });
});
