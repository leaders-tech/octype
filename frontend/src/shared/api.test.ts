/*
This file tests the shared browser API helper and its path-based request contract.
Edit this file when API base paths or error parsing change.
Copy this file when you add tests for another small shared browser helper.
*/

import { afterEach, describe, expect, it, vi } from "vitest";

describe("shared api helper", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("prefixes JSON requests with the configured API base path once", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "/api/");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, data: { version: "1.0.1" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { postJson } = await import("./api");
    const data = await postJson<{ version: string }>("/release/latest");

    expect(data).toEqual({ version: "1.0.1" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/release/latest",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
  });
});
