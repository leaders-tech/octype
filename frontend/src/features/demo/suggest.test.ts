/*
This file tests the fake suggestion logic behind the website demo.
Edit this file when demo suggestions, Tab chunks, or streaming steps change.
Copy a test pattern here when you add another rule to suggest.ts.
*/

import { describe, expect, it } from "vitest";
import { nextChunk, nextWordEnd, suggest } from "./suggest";

const candidates = ["Yes, absolutely! What time works for you?", "Yes! Ramen sounds perfect. Should we meet at 7?"];

describe("suggest", () => {
  it("suggests nothing for empty text", () => {
    expect(suggest("", candidates)).toBe("");
    expect(suggest("   ", candidates)).toBe("");
  });

  it("finishes a whole scene message, ignoring case", () => {
    expect(suggest("Yes! R", candidates)).toBe("amen sounds perfect. Should we meet at 7?");
    expect(suggest("yes, ABS", candidates)).toBe("olutely! What time works for you?");
  });

  it("falls back to a common sentence for the sentence being typed", () => {
    expect(suggest("Hi there. Let me ch", [], ["Let me check and get back to you."])).toBe("eck and get back to you.");
  });

  it("finishes the current word when nothing else fits", () => {
    expect(suggest("See you tomor", [], [])).toBe("row");
  });

  it("suggests nothing when no word matches", () => {
    expect(suggest("zzqx", [], [])).toBe("");
  });
});

describe("nextChunk", () => {
  it("takes leading space plus one word", () => {
    expect(nextChunk("amen sounds perfect")).toBe("amen");
    expect(nextChunk(" sounds perfect")).toBe(" sounds");
    expect(nextChunk("\n\nThanks for")).toBe("\n\nThanks");
  });
});

describe("nextWordEnd", () => {
  it("moves one word at a time and stops at the end", () => {
    const text = "every app on";
    expect(nextWordEnd(text, 0)).toBe(5);
    expect(nextWordEnd(text, 5)).toBe(9);
    expect(nextWordEnd(text, 9)).toBe(12);
    expect(nextWordEnd(text, 12)).toBe(12);
  });
});
