import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestUrl } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { lifetimePlanProduct } from "./lifetime-contract";

export const createOxapayInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ planId: z.string().uuid(), origin: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const requestOrigin = getRequestUrl().origin;
    if (new URL(data.origin).origin !== requestOrigin) throw new Error("Invalid checkout address.");
    const product = lifetimePlanProduct[data.planId];
    if (!product) throw new Error("Only Instagram and TikTok lifetime purchases are available on this website.");
    const { data: identity, error } = await context.supabase.auth.getUser();
    if (error || identity.user?.id !== context.userId || !identity.user.email || !identity.user.email_confirmed_at) throw new Error("Please verify your account email before purchasing.");
    const { standaloneCheckout } = await import("./standalone-lifetime.server");
    return standaloneCheckout(product, requestOrigin, context.supabase);
  });

// Admin-only: stores a fingerprint of the host's OxaPay key so the payment
// webhook can be verified by the database without any secret service key.
export const syncOxapayKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const key = process.env.OXAPAY_MERCHANT_API_KEY?.trim();
    if (!key) return { ok: false, reason: "missing" as const };
    const { sha256Hex } = await import("./public-db.server");
    const { error } = await context.supabase.rpc("set_oxapay_key_hash", { _hash: await sha256Hex(key) });
    return { ok: !error, reason: error ? ("forbidden" as const) : undefined };
  });
