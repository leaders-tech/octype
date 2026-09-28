/*
This file checks the landing page in a real browser: it loads, the demo accepts suggestions, and the app window works.
Edit this file when the main browser flows on the page change.
Copy a test pattern here when you add another end-to-end browser flow.
*/

import { expect, test } from "@playwright/test";

test("landing page loads with a working download link and no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Autocomplete for everything you type." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download for Mac" }).first()).toHaveAttribute("href", /github\.com\/levbern\/Octype\/releases/);
  await expect(page.locator("canvas.tentacles-hero")).toBeVisible();
  expect(errors).toEqual([]);
});

test("backend health and release endpoints answer through the frontend origin", async ({ page, request }) => {
  await page.goto("/");
  const health = await request.get("/api/health");
  expect(await health.json()).toEqual({ ok: true, data: { status: "ok" } });

  const release = await request.post("/api/release/latest", { data: {} });
  const payload = await release.json();
  expect(payload.ok).toBe(true);
  expect(payload.data.release.page_url).toContain("github.com/levbern/Octype/releases");
});

test("demo: type, accept a word with Tab, accept the rest with Shift+Tab, send", async ({ page }) => {
  await page.goto("/#try");
  const field = page.getByLabel("Messages demo text field");
  await field.click();
  await expect(page.getByText("Your turn: type, then press Tab")).toBeVisible();

  await field.pressSequentially("Yes! R");
  await expect(page.getByTestId("ghost")).toHaveText("amen sounds perfect. Should we meet at 7 at the office?");

  await field.press("Tab");
  await expect(field).toHaveValue("Yes! Ramen");
  await expect(field).toBeFocused();

  await field.press("Shift+Tab");
  await expect(field).toHaveValue("Yes! Ramen sounds perfect. Should we meet at 7 at the office?");

  await field.press("Enter");
  await expect(field).toHaveValue("");
  await expect(page.locator(".bubble.out")).toHaveText("Yes! Ramen sounds perfect. Should we meet at 7 at the office?");
});

test("app window: switch pages and toggle Octype off", async ({ page }) => {
  await page.goto("/#app");
  const window = page.getByLabel("Octype app window preview");
  await window.getByRole("switch", { name: "Enabled" }).click();
  await expect(window.getByRole("heading", { name: "Octype is off" })).toBeVisible();
  await window.getByRole("button", { name: "Statistics" }).click();
  await expect(window.getByText("Accept rate")).toBeVisible();
});
