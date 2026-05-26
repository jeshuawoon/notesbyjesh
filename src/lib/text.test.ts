import { describe, expect, it } from "vitest";
import { parseStandoutText, splitParagraphs } from "./text";

describe("splitParagraphs", () => {
  it("turns separated text into trimmed paragraphs", () => {
    expect(splitParagraphs(" First line. \n\nSecond line.\n")).toEqual([
      "First line.",
      "Second line.",
    ]);
  });
});

describe("parseStandoutText", () => {
  it("extracts standout markers while preserving surrounding text", () => {
    expect(parseStandoutText("You stayed [[STEADFAST]] through it.")).toEqual([
      { kind: "text", value: "You stayed " },
      { kind: "standout", value: "STEADFAST" },
      { kind: "text", value: " through it." },
    ]);
  });
});

