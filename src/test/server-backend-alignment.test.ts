import { describe, expect, it } from "vitest";
import { alignServerBackend } from "@/lib/public-env-defaults";

describe("server backend alignment", () => {
  it("on Vercel, replaces a mismatched backend with the one the browser signs into", () => {
    const env: Record<string, string | undefined> = {
      VERCEL: "1",
      SUPABASE_URL: "https://other-project.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_other",
    };
    alignServerBackend(env);
    expect(env["SUPABASE_URL"]).not.toBe("https://other-project.supabase.co");
    expect(env["SUPABASE_PUBLISHABLE_KEY"]).not.toBe("sb_publishable_other");
  });

  it("off Vercel, keeps an existing backend configuration", () => {
    const env: Record<string, string | undefined> = {
      SUPABASE_URL: "https://hosted.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "sb_publishable_hosted",
    };
    alignServerBackend(env);
    expect(env["SUPABASE_URL"]).toBe("https://hosted.supabase.co");
    expect(env["SUPABASE_PUBLISHABLE_KEY"]).toBe("sb_publishable_hosted");
  });
});
