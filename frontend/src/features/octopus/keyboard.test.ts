/*
This file tests the hero keyboard layout: every row fills the keyboard width and the keys the headline presses exist.
Edit this file when keyboard rows or key names change.
Copy a test pattern here when you add another layout helper.
*/

import { describe, expect, it } from "vitest";
import { layoutKeyboard } from "./keyboard";

describe("layoutKeyboard", () => {
  const kb = layoutKeyboard(100, 50, 600, 180);

  it("has the keys the headline presses", () => {
    expect(kb.keys.map((k) => k.id)).toEqual(expect.arrayContaining(["tab", "delete", "space", "q", "a", "z"]));
  });

  it("keeps every row inside the keyboard with equal side padding", () => {
    const rows = new Map<number, typeof kb.keys>();
    for (const key of kb.keys) rows.set(key.y, [...(rows.get(key.y) ?? []), key]);
    expect(rows.size).toBe(5);
    for (const row of rows.values()) {
      const left = row[0].x - kb.x;
      const last = row[row.length - 1];
      const right = kb.x + kb.w - (last.x + last.w);
      expect(right).toBeCloseTo(left, 5);
    }
    const bottom = Math.max(...kb.keys.map((k) => k.y + k.h));
    expect(bottom).toBeLessThanOrEqual(kb.y + kb.h);
  });
});
