/*
This file tests the fake suggestion logic behind the website demo.
Edit this file when demo suggestions, Tab chunks, or streaming steps change.
Copy a test pattern here when you add another rule to suggest.ts.
*/

import { describe, expect, it } from "vitest";
import { SCENE_SOURCES } from "./scenes";
import { nextChunk, nextWordEnd, suggest } from "./suggest";

const sources = [
  "Yes, absolutely! What time works for you?",
  "Yes! Ramen sounds perfect. Should we meet at 7 at the office?",
  "Hi Sam,\n\nThanks for the update! Best,\nAlex",
  "Can you share the Figma link?",
];

describe("suggest", () => {
  it("suggests nothing for empty text", () => {
    expect(suggest("", sources)).toBe("");
    expect(suggest("   ", sources)).toBe("");
  });

  it("finishes a whole source that starts with the typed text, ignoring case", () => {
    expect(suggest("Yes! R", sources)).toBe("amen sounds perfect. Should we meet at 7 at the office?");
    expect(suggest("yes, ABS", sources)).toBe("olutely! What time works for you?");
  });

  it("matches the sentence being typed against sentence starts inside a source", () => {
    expect(suggest("Hello Sam!\n\nThanks for the u", sources)).toBe("pdate! Best,\nAlex");
  });

  it("lets a typed space stand in for the source's punctuation, but not other punctuation", () => {
    expect(suggest("Yes ", sources)).toBe("absolutely! What time works for you?");
    expect(suggest("Yes, ", sources)).toBe("absolutely! What time works for you?");
  });

  it("continues from the last few typed words when the sentence started differently", () => {
    expect(suggest("I think we should meet at the", sources)).toBe(" office?");
    expect(suggest("Could you share the", sources)).toBe(" Figma link?");
  });

  it("finishes the current word from the scene's words first", () => {
    expect(suggest("See you tomor", [])).toBe("row");
    expect(suggest("I like ram", sources)).toBe("en");
  });

  it("suggests nothing when nothing fits instead of guessing", () => {
    expect(suggest("zzqx", sources)).toBe("");
    expect(suggest("Sure! ", sources)).toBe("");
  });

  it("stays on topic in every demo scene", () => {
    expect(suggest("Th", SCENE_SOURCES.messages)).toBe("anks for finding it! See you tomorrow.");
    expect(suggest("Sounds good, what time should", SCENE_SOURCES.messages)).toBe(" we meet?");
    expect(suggest("Best,", SCENE_SOURCES.mail)).toBe("\nAlex Chen\nProduct Designer, Northwind");
    expect(suggest("Lisbon trip\n\nBud", SCENE_SOURCES.notes)).toBe("get: about 600 euros for four days.");
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
