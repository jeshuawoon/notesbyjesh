import { describe, expect, it } from "vitest";
import { canAccessStudio } from "./studio-access";

describe("canAccessStudio", () => {
  it("allows the studio during local development", () => {
    expect(canAccessStudio({ NODE_ENV: "development" })).toBe(true);
  });

  it("blocks the studio in production", () => {
    expect(canAccessStudio({ NODE_ENV: "production" })).toBe(false);
  });
});
