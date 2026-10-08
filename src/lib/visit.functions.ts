import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Records the caller's IP + country on their own profile (signup_* set once).
export const recordVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-real-ip") ||
      (getRequestHeader("x-forwarded-for") || "").split(",")[0].trim() ||
      null;
    let country = getRequestHeader("cf-ipcountry") || null;
    if ((!country || country === "XX") && ip) {
      try {
        const r = await fetch(`https://ipwho.is/${ip}`);
        const j: any = await r.json();
        if (j?.success) country = j.country || j.country_code || null;
      } catch {}
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin.from("profiles").select("signup_ip, visit_count").eq("id", context.userId).maybeSingle();
    const patch: { last_ip: string | null; last_country: string | null; last_seen_at: string; visit_count: number; signup_ip?: string | null; signup_country?: string | null } = { last_ip: ip, last_country: country, last_seen_at: new Date().toISOString(), visit_count: (p?.visit_count ?? 0) + 1 };
    if (!p?.signup_ip) { patch.signup_ip = ip; patch.signup_country = country; }
    await supabaseAdmin.from("profiles").update(patch).eq("id", context.userId);
    return { ok: true };
  });
