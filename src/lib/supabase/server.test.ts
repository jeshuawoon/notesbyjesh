import { describe, expect, it } from "vitest";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "./server";

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

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SECRET_KEY = originalSecret;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceRole;
  });
});
