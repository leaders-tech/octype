/*
This file tests the whole landing page: it renders every section and points downloads at the newest release.
Edit this file when sections or the download links change.
Copy a test pattern here when you add another page-wide check.
*/

import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

function mockRelease(release: object | null) {
  const fetchMock = release
    ? vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, data: { release } }), { status: 200 }))
    : vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the pitch and every section", () => {
    mockRelease(null);
    vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<App />);
    expect(screen.getByRole("heading", { level: 1, name: "Autocomplete for everything you type." })).toBeInTheDocument();
    for (const name of ["Press Tab. Keep your train of thought.", "Nothing you type leaves your Mac.", "Get Octype", "Good to know"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
  });

  it("links downloads to the releases page until the latest release loads", async () => {
    const fetchMock = mockRelease({
      version: "1.0.1",
      published_at: "2026-09-25T12:24:27Z",
      page_url: "https://github.com/levbern/Octype/releases/tag/v1.0.1",
      dmg_url: "https://github.com/levbern/Octype/releases/download/v1.0.1/Octype-1.0.1.dmg",
      dmg_size: 8116224,
      source: "github",
    });
    render(<App />);
    const buttons = screen.getAllByRole("link", { name: "Download for Mac" });
    expect(buttons).toHaveLength(2);
    for (const button of buttons) expect(button).toHaveAttribute("href", "https://github.com/levbern/Octype/releases/latest");

    const dmg = "https://github.com/levbern/Octype/releases/download/v1.0.1/Octype-1.0.1.dmg";
    await waitFor(() => expect(buttons[0]).toHaveAttribute("href", dmg));
    expect(screen.getByRole("link", { name: "Download v1.0.1 for Mac" })).toHaveAttribute("href", dmg);
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute("href", dmg);
    expect(fetchMock).toHaveBeenCalledWith("/api/release/latest", expect.objectContaining({ method: "POST" }));
  });

  it("keeps the releases page link when the backend is down", async () => {
    mockRelease(null);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<App />);
    await waitFor(() => expect(warn).toHaveBeenCalled());
    for (const button of screen.getAllByRole("link", { name: "Download for Mac" })) {
      expect(button).toHaveAttribute("href", "https://github.com/levbern/Octype/releases/latest");
    }
  });
});
