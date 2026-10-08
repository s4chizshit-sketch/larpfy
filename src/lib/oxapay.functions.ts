import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createOxapayInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ planId: z.string().uuid(), origin: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const key = process.env.OXAPAY_MERCHANT_API_KEY;
    if (!key) throw new Error("USD payments are not configured yet.");
    const { data: plan, error } = await context.supabase
      .from("plans").select("id,name,price,active").eq("id", data.planId).single();
    if (error || !plan || !plan.active) throw new Error("Plan not available.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error: oe } = await supabaseAdmin.from("payment_orders")
      .insert({ user_id: context.userId, plan_id: plan.id, amount: Number(plan.price) })
      .select("id").single();
    if (oe || !order) throw new Error("Could not create order.");
    const res = await fetch("https://api.oxapay.com/v1/payment/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json", merchant_api_key: key },
      body: JSON.stringify({
        amount: Number(plan.price),
        currency: "USD",
        lifetime: 60,
        order_id: order.id,
        description: `Larp Insight - ${plan.name}`.slice(0, 100),
        callback_url: `${data.origin}/api/public/oxapay-webhook`,
        return_url: `${data.origin}/dashboard/billing`,
      }),
    });
    const json = (await res.json().catch(() => null)) as
      | { data?: { track_id?: string; payment_url?: string }; message?: string } | null;
    const url = json?.data?.payment_url;
    if (!res.ok || !url) {
      console.error("OxaPay invoice failed", res.status, json);
      throw new Error("Payment gateway error. Please try again.");
    }
    await supabaseAdmin.from("payment_orders").update({ track_id: String(json.data!.track_id) }).eq("id", order.id);
    return { url };
  });
