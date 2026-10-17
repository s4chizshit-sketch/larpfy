import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestUrl } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createOxapayInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ planId: z.string().uuid(), origin: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.OXAPAY_MERCHANT_API_KEY;
    if (!key) throw new Error("USDT payments are not configured yet.");
    const requestOrigin = getRequestUrl().origin;
    if (new URL(data.origin).origin !== requestOrigin) throw new Error("Invalid checkout address.");
    const { data: order, error: oe } = await context.supabase.rpc("create_payment_order", { _plan_id: data.planId });
    const o = order as { id?: string; amount?: number; name?: string } | null;
    if (oe || !o?.id) throw new Error("Plan not available.");
    const res = await fetch("https://api.oxapay.com/v1/payment/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json", merchant_api_key: key },
      body: JSON.stringify({
        amount: Number(o.amount),
        currency: "USD",
        to_currency: "USDT",
        lifetime: 60,
        order_id: o.id,
        description: `Larp Insight - ${o.name ?? "Plan"}`.slice(0, 100),
        callback_url: `${requestOrigin}/api/public/oxapay-webhook`,
        return_url: `${requestOrigin}/dashboard/billing`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    const json = (await res.json().catch(() => null)) as
      | { data?: { track_id?: string; payment_url?: string }; message?: string } | null;
    const url = json?.data?.payment_url;
    if (!res.ok || !url) {
      console.error("OxaPay invoice failed", res.status, json);
      throw new Error("Payment gateway error. Please try again.");
    }
    const track = json?.data?.track_id;
    if (track == null) throw new Error("Payment reference missing. Please try again.");
    const { error: trackError } = await context.supabase.rpc("set_order_track", { _order_id: o.id, _track: String(track) });
    if (trackError) throw new Error("Could not save payment reference. Please try again.");
    return { url };
  });

// Admin-only: stores a fingerprint of the host's OxaPay key so the payment
// webhook can be verified by the database without any secret service key.
export const syncOxapayKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.OXAPAY_MERCHANT_API_KEY;
    if (!key) return { ok: false, reason: "missing" as const };
    const { sha256Hex } = await import("./public-db.server");
    const { error } = await context.supabase.rpc("set_oxapay_key_hash", { _hash: await sha256Hex(key) });
    return { ok: !error, reason: error ? ("forbidden" as const) : undefined };
  });
