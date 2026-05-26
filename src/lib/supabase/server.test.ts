import { describe, expect, it } from "vitest";
import {
  getSupabasePublicClient,
  getSupabaseServerClient,
  isSupabasePublicConfigured,
  isSupabaseServerConfigured,
} from "./server";

describe("isSupabaseServerConfigured", () => {
  it("requires a Supabase URL and service role style secret", () => {
    expect(
      isSupabaseServerConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      } as NodeJS.ProcessEnv),
    ).toBe(true);

    expect(
      isSupabaseServerConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("throws when server credentials are missing", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalSecret = process.env.SUPABASE_SECRET_KEY;
    const originalServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SECRET_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(() => getSupabaseServerClient()).toThrow("Supabase server credentials are not configured.");

    restoreEnv("NEXT_PUBLIC_SUPABASE_URL", originalUrl);
    restoreEnv("SUPABASE_SECRET_KEY", originalSecret);
    restoreEnv("SUPABASE_SERVICE_ROLE_KEY", originalServiceRole);
  });
});

describe("isSupabasePublicConfigured", () => {
  it("requires a Supabase URL and publishable key", () => {
    expect(
      isSupabasePublicConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      } as NodeJS.ProcessEnv),
    ).toBe(true);

    expect(
      isSupabasePublicConfigured({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
  });

  it("throws when public credentials are missing", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const originalPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    expect(() => getSupabasePublicClient()).toThrow("Supabase public credentials are not configured.");

    restoreEnv("NEXT_PUBLIC_SUPABASE_URL", originalUrl);
    restoreEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", originalPublishableKey);
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
