import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { setResponseHeader } from "@tanstack/react-start/server";

export const listLifetimePurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data, error } = await context.supabase.from("lifetime_orders").select("id,user_id,product,amount,currency,status,track_id,payment_url,created_at,payment_verified_at").eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error("Purchase history unavailable.");
    const { verifyStandaloneOrder } = await import("./standalone-lifetime.server");
    const purchases = [];
    for (const order of data ?? []) {
      let receipt = order;
      if (order.status === "pending") { try { receipt = await verifyStandaloneOrder(order.id, context.supabase); } catch {} }
      purchases.push({ ...receipt, access_key: null as string | null });
    }
    return { connected: true, purchases };
  });

export const recheckLifetimePurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ purchaseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data: owned } = await context.supabase.from("lifetime_orders").select("id").eq("id", data.purchaseId).eq("user_id", context.userId).maybeSingle();
    if (!owned) throw new Error("Order unavailable.");
    const { verifyStandaloneOrder } = await import("./standalone-lifetime.server");
    return verifyStandaloneOrder(data.purchaseId, context.supabase);
  });

export const getLifetimeKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ purchaseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { data: delivery, error } = await context.supabase.rpc("get_lifetime_delivery", { _order_id: data.purchaseId });
    if (error) throw new Error("Delivery unavailable.");
    return z.object({ access_key: z.string().nullable() }).parse(delivery);
  });

export const lifetimeAvailability = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("./public-db.server");
  const { data, error } = await publicDb().rpc("lifetime_availability");
  if (error) throw new Error("Availability unavailable");
  return z.object({ instagram: z.boolean(), tiktok: z.boolean() }).parse(data);
});