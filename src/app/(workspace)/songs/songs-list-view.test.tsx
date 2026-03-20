import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SongsListView } from "./songs-list-view";
import type { Song } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockSongs: Song[] = [
  {
    id: "song-1",
    project_id: "proj-1",
    title: "Opening Theme",
    lyrics: "In the beginning there was light...",
    audio_url: null,
    mood: "triumphant",
    created_by: "user-1",
    created_at: "2026-03-19T00:00:00Z",
    updated_at: "2026-03-19T00:00:00Z",
  },
  {
    id: "song-2",
    project_id: "proj-1",
    title: "Battle Hymn",
    lyrics: null,
    audio_url: null,
    mood: "intense",
    created_by: "user-1",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-03-18T00:00:00Z",
  },
  {
    id: "song-3",
    project_id: "proj-1",
    title: "Lullaby",
    lyrics: null,
    audio_url: null,
    mood: null,
    created_by: "user-1",
    created_at: "2026-03-17T00:00:00Z",
    updated_at: "2026-03-17T00:00:00Z",
  },
];

describe("SongsListView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all songs", () => {
    render(<SongsListView songs={mockSongs} projectId="proj-1" />);

    expect(screen.getByText("Opening Theme")).toBeInTheDocument();
    expect(screen.getByText("Battle Hymn")).toBeInTheDocument();
    expect(screen.getByText("Lullaby")).toBeInTheDocument();
  });

  it("displays mood badges", () => {
    render(<SongsListView songs={mockSongs} projectId="proj-1" />);

    expect(screen.getByText("triumphant")).toBeInTheDocument();
    expect(screen.getByText("intense")).toBeInTheDocument();
  });

  it("links to song detail pages", () => {
    render(<SongsListView songs={mockSongs} projectId="proj-1" />);

    const link = screen.getByText("Opening Theme").closest("a");
    expect(link).toHaveAttribute("href", "/songs/song-1");
  });

  it("shows empty state when no songs", () => {
    render(<SongsListView songs={[]} projectId="proj-1" />);

    expect(
      screen.getByText("No songs yet. Click 'New Song' to create one.")
    ).toBeInTheDocument();
  });

  it("shows project required message when no projectId", () => {
    render(<SongsListView songs={[]} projectId={null} />);

    expect(
      screen.getByText("Create a project to add songs")
    ).toBeInTheDocument();
  });

  it("displays lyrics preview for songs with lyrics", () => {
    render(<SongsListView songs={mockSongs} projectId="proj-1" />);

    // The component renders lyrics.slice(0, 40) + "..."
    expect(
      screen.getByText(/In the beginning there was light/)
    ).toBeInTheDocument();
  });
});
