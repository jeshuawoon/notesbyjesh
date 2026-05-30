import { describe, expect, it } from "vitest";
import {
  STUDIO_SESSION_MAX_AGE_SECONDS,
  canAccessStudio,
  createStudioSessionToken,
  isStudioPasswordConfigured,
  verifyStudioPassword,
  verifyStudioSessionToken,
} from "./studio-auth";

const productionEnv = {
  NODE_ENV: "production",
  STUDIO_PASSWORD: "open-sesame",
};

describe("studio auth", () => {
  it("allows local development when no studio password is configured", () => {
    expect(canAccessStudio({ NODE_ENV: "development", STUDIO_PASSWORD: "" })).toBe(true);
  });

  it("requires a session in production", () => {
    expect(canAccessStudio(productionEnv)).toBe(false);
  });

  it("accepts valid signed studio session tokens", () => {
    const now = Date.UTC(2026, 4, 30, 12);
    const token = createStudioSessionToken(productionEnv, now);

    expect(verifyStudioSessionToken(productionEnv, token, now + 1_000)).toBe(true);
    expect(canAccessStudio(productionEnv, token, now + 1_000)).toBe(true);
  });

  it("rejects expired studio session tokens", () => {
    const now = Date.UTC(2026, 4, 30, 12);
    const token = createStudioSessionToken(productionEnv, now);
    const expiredAt = now + STUDIO_SESSION_MAX_AGE_SECONDS * 1_000 + 1;

    expect(verifyStudioSessionToken(productionEnv, token, expiredAt)).toBe(false);
  });

  it("rejects tampered studio session tokens", () => {
    const now = Date.UTC(2026, 4, 30, 12);
    const token = createStudioSessionToken(productionEnv, now);

    expect(verifyStudioSessionToken(productionEnv, `${token}x`, now + 1_000)).toBe(false);
  });

  it("checks studio passwords exactly after trimming config", () => {
    const env = { NODE_ENV: "production", STUDIO_PASSWORD: "  secret phrase  " };

    expect(isStudioPasswordConfigured(env)).toBe(true);
    expect(verifyStudioPassword(env, "secret phrase")).toBe(true);
    expect(verifyStudioPassword(env, "Secret phrase")).toBe(false);
  });
});
