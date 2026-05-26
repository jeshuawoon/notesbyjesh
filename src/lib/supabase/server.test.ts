import { describe, expect, it } from "vitest";
import { isSupabaseServerConfigured } from "./server";

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
});
