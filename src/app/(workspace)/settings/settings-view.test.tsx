import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "./settings-view";
import type { Profile } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/auth/sign-out-button", () => ({
  SignOutButton: () => <button>Sign out</button>,
}));

vi.mock("@/components/settings/ai-settings", () => ({
  AISettingsComponent: () => <div data-testid="ai-settings">AI Settings</div>,
}));

vi.mock("@/components/settings/project-settings", () => ({
  ProjectSettingsComponent: () => (
    <div data-testid="project-settings">Project Settings</div>
  ),
}));

const mockProfile: Profile = {
  id: "user-1",
  display_name: "Test User",
  email: "test@example.com",
  role: "author",
  avatar_url: null,
  created_at: "2026-01-01T00:00:00Z",
};

const defaultProps = {
  profile: mockProfile,
  projectId: "proj-1",
  project: { id: "proj-1", title: "Test Project" },
  projectMembers: [],
  projectSettings: { ai_enabled: true },
  aiSettings: { provider: "anthropic" as const, model: "claude-sonnet-4-5-20250929" },
};

describe("SettingsView", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders profile information", () => {
    render(<SettingsView {...defaultProps} />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
  });

  it("shows user role and member since date", () => {
    render(<SettingsView {...defaultProps} />);

    expect(screen.getByText("author")).toBeInTheDocument();
  });

  it("shows sign out button", () => {
    render(<SettingsView {...defaultProps} />);

    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("disables save button when no changes", () => {
    render(<SettingsView {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button when display name changes", async () => {
    const user = userEvent.setup();
    render(<SettingsView {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton).toBeEnabled();
  });

  it("shows cancel button when changes are made", async () => {
    const user = userEvent.setup();
    render(<SettingsView {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed");

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("resets form on cancel", async () => {
    const user = userEvent.setup();
    render(<SettingsView {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed");

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.getByDisplayValue("Test User")).toBeInTheDocument();
  });

  it("saves profile on submit", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { ...mockProfile, display_name: "New Name" } }),
    });

    render(<SettingsView {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/settings/profile",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ display_name: "New Name", avatar_url: null }),
        })
      );
    });
  });

  it("shows error on save failure", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(<SettingsView {...defaultProps} />);

    const nameInput = screen.getByDisplayValue("Test User");
    await user.clear(nameInput);
    await user.type(nameInput, "New Name");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it("shows no project message when projectId is null", () => {
    render(
      <SettingsView
        {...defaultProps}
        projectId={null}
        project={null}
        projectSettings={null}
      />
    );

    // Project and AI tabs should be disabled
    const projectTab = screen.getByRole("tab", { name: /project/i });
    expect(projectTab).toHaveAttribute("aria-disabled", "true");
  });
});
