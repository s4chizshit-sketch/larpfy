import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkedReceipt } from "./lifetime-contract";

export const listLifetimePurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { bridgeConfiguration, readLifetimePurchases } = await import("./lifetime-bridge.server");
    try { bridgeConfiguration(); } catch { return { connected: false, purchases: [] }; }
    return { connected: true, purchases: await readLifetimePurchases(context.userId) };
  });

export const recheckLifetimePurchase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ purchaseId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { bridgeRequest } = await import("./lifetime-bridge.server");
    const response = await bridgeRequest(`purchases/${data.purchaseId}/verify`, { website_user_id: context.userId });
    return checkedReceipt(await response.json(), context.userId);
  });