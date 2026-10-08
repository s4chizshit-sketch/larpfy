import { createFileRoute } from "@tanstack/react-router";

async function hmacSha512Hex(key: string, body: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function durationDays(period: string): number | null {
  const p = period.toLowerCase();
  if (p === "once" || p.includes("life")) return null;
  const n = p.match(/(\d+)\s*day/);
  if (n) return Number(n[1]);
  if (p.includes("year")) return 365;
  return 30;
}

export const Route = createFileRoute("/api/public/oxapay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.OXAPAY_MERCHANT_API_KEY;
        if (!key) return new Response("not configured", { status: 500 });
        const raw = await request.text();
        const sent = (request.headers.get("hmac") ?? "").toLowerCase();
        if (!sent || sent !== (await hmacSha512Hex(key, raw))) return new Response("invalid", { status: 400 });
        const body = JSON.parse(raw) as { status?: string; order_id?: string; track_id?: string | number };
        if (String(body.status).toLowerCase() !== "paid" || !body.order_id) return new Response("ok");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin.from("payment_orders").select("*").eq("id", body.order_id).maybeSingle();
        if (!order || order.status === "paid") return new Response("ok");
        const { data: plan } = await supabaseAdmin.from("plans").select("*").eq("id", order.plan_id).maybeSingle();
        await supabaseAdmin.from("payment_orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.id).eq("status", "pending");
        if (plan) {
          const days = durationDays(plan.billing_period);
          await supabaseAdmin.from("plan_purchases").insert({
            user_id: order.user_id, plan_id: plan.id, plan_name: plan.name, price: order.amount,
            billing_period: plan.billing_period, duration_days: days,
            expires_at: days ? new Date(Date.now() + days * 86400000).toISOString() : null,
          });
          await supabaseAdmin.from("profiles").update({ subscription_status: "active", plan_id: plan.id }).eq("id", order.user_id);
          const { data: u } = await supabaseAdmin.from("profiles").select("name, email").eq("id", order.user_id).maybeSingle();
          const { sendPlanAlert } = await import("@/lib/telegram-notify.server");
          await sendPlanAlert({ name: u?.name ?? null, email: u?.email ?? null, plan: plan.name, amount: Number(order.amount) });
        }
        return new Response("ok");
      },
    },
  },
});
