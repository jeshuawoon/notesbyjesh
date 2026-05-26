import { describe, expect, it } from "vitest";
import { buildVersePrompt, parseVerseSuggestion } from "./verse-suggestion";

describe("parseVerseSuggestion", () => {
  it("parses a strict NIV verse suggestion", () => {
    expect(
      parseVerseSuggestion(
        JSON.stringify({
          verseText: "Sample verse text.",
          verseRef: "Example 1:1",
          version: "NIV",
        }),
      ),
    ).toEqual({
      verseText: "Sample verse text.",
      verseRef: "Example 1:1",
      version: "NIV",
    });
  });

  it("parses fenced JSON from Gemini", () => {
    expect(
      parseVerseSuggestion(
        '```json\n{"verseText":"Be strong.","verseRef":"Joshua 1:9","version":"NIV"}\n```',
      ),
    ).toEqual({
      verseText: "Be strong.",
      verseRef: "Joshua 1:9",
      version: "NIV",
    });
  });

  it("rejects missing fields or another version", () => {
    expect(parseVerseSuggestion('{"verseText":"Text.","verseRef":"Ref.","version":"ESV"}')).toBeNull();
    expect(parseVerseSuggestion('{"verseText":"Text.","version":"NIV"}')).toBeNull();
  });
});

describe("buildVersePrompt", () => {
  it("keeps the draft short and avoids resending the previous verse text", () => {
    const prompt = buildVersePrompt({
      eventDateLabel: "June 2026",
      eventName: "LifeGen Camp",
      message: "A very encouraging note. ".repeat(40),
      personName: "Sarah",
      previousVerseRef: "Joshua 1:9 (NIV)",
      previousVerseText: "Do not include this long previous verse text in the next prompt.",
    });

    expect(prompt).toContain("Avoid ref: Joshua 1:9");
    expect(prompt).not.toContain("Do not include this long previous verse text");
    expect(prompt.length).toBeLessThan(850);
  });
});
