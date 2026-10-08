import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function clientIp() {
  return (
    getRequestHeader("cf-connecting-ip") ||
    getRequestHeader("x-real-ip") ||
    (getRequestHeader("x-forwarded-for") || "").split(",")[0].trim() ||
    null
  );
}

// Returns an ISO-2 country code (cheap header first, lookup fallback).
async function clientCountry(ip: string | null) {
  const h = getRequestHeader("cf-ipcountry");
  if (h && h !== "XX" && h !== "T1") return h.toUpperCase();
  if (!ip) return null;
  try {
    const r = await fetch(`https://ipwho.is/${ip}?fields=success,country_code`, { signal: AbortSignal.timeout(2500) });
    const j: any = await r.json();
    return j?.success && j.country_code ? String(j.country_code).toUpperCase() : null;
  } catch {
    return null;
  }
}

// Records the caller's IP + country on their own profile (signup_* set once).
export const recordVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ip = clientIp();
    const country = await clientCountry(ip);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: p } = await supabaseAdmin.from("profiles").select("signup_ip, visit_count, email, name").eq("id", context.userId).maybeSingle();
    const patch: { last_ip: string | null; last_country: string | null; last_seen_at: string; visit_count: number; signup_ip?: string | null; signup_country?: string | null } = { last_ip: ip, last_country: country, last_seen_at: new Date().toISOString(), visit_count: (p?.visit_count ?? 0) + 1 };
    if (!p?.signup_ip) { patch.signup_ip = ip; patch.signup_country = country; }
    await supabaseAdmin.from("profiles").update(patch).eq("id", context.userId);
    if (!p?.signup_ip) {
      const { sendSignupAlert } = await import("./telegram-notify.server");
      await sendSignupAlert({ name: p?.name ?? null, email: p?.email ?? null, ip, country });
    }
    return { ok: true };
  });

// Anonymous visitor counter: one row per browser session, country only (no IP stored).
export const trackSiteVisit = createServerFn({ method: "POST" }).handler(async () => {
  const country = await clientCountry(clientIp());
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("site_visits").insert({ country });
  return { ok: true };
});
