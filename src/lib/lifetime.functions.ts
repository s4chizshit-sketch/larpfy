import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listLifetimePurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("lifetime_orders").select("*").eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error("Purchase history unavailable.");
    const { verifyStandaloneOrder } = await import("./standalone-lifetime.server");
    const purchases = [];
    for (const order of data ?? []) {
      let receipt = order;
      if (order.status === "pending") { try { receipt = await verifyStandaloneOrder(order.id, context.supabase); } catch {} }
      purchases.push(receipt);
    }
    return { connected: true, purchases };
  });

export const recheckLifetimePurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ purchaseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: owned } = await context.supabase.from("lifetime_orders").select("id").eq("id", data.purchaseId).eq("user_id", context.userId).maybeSingle();
    if (!owned) throw new Error("Order unavailable.");
    const { verifyStandaloneOrder } = await import("./standalone-lifetime.server");
    return verifyStandaloneOrder(data.purchaseId, context.supabase);
  });