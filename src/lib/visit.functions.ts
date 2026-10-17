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
    const { data } = await context.supabase.rpc("record_my_visit", { _ip: ip ?? "", _country: country ?? "" });
    const r = data as { first?: boolean; name?: string; email?: string } | null;
    if (r?.first) {
      const { sendSignupAlert } = await import("./telegram-notify.server");
      await sendSignupAlert({ name: r.name ?? null, email: r.email ?? null, ip, country });
    }
    return { ok: true };
  });

// Anonymous visitor counter: one row per browser session, country only (no IP stored).
export const trackSiteVisit = createServerFn({ method: "POST" }).handler(async () => {
  const country = await clientCountry(clientIp());
  const { publicDb } = await import("./public-db.server");
  await publicDb().rpc("track_site_visit", { _country: country ?? "" });
  return { ok: true };
});
