import { describe, expect, it } from "vitest";
import {
  FRIENDLY_CODE_ALPHABET,
  generateFriendlyCode,
  isCompleteFriendlyCode,
  normalizeCode,
  normalizeFriendlyCodeInput,
} from "./code";

describe("normalizeCode", () => {
  it("uppercases and removes spaces and hyphens", () => {
    expect(normalizeCode(" k7-m 2q ")).toBe("K7M2Q");
  });
});

describe("isCompleteFriendlyCode", () => {
  it("returns true once the normalized code reaches five characters", () => {
    expect(isCompleteFriendlyCode("k7-m 2q")).toBe(true);
  });

  it("returns false before the normalized code reaches five characters", () => {
    expect(isCompleteFriendlyCode("k7-m2")).toBe(false);
  });
});

describe("normalizeFriendlyCodeInput", () => {
  it("normalizes and caps input at the friendly code length", () => {
    expect(normalizeFriendlyCodeInput(" k7-m 2qx ")).toBe("K7M2Q");
  });
});

describe("generateFriendlyCode", () => {
  it("creates a five-character code from the friendly alphabet", () => {
    const code = generateFriendlyCode();

    expect(code).toHaveLength(5);
    for (const char of code) {
      expect(FRIENDLY_CODE_ALPHABET).toContain(char);
    }
  });
});
