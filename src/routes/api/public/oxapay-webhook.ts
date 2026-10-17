import { createFileRoute } from "@tanstack/react-router";

async function hmacSha512Hex(key: string, body: string) {
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
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
        let body: { status?: string; order_id?: string; track_id?: string | number };
        try { body = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
        if (String(body.status).toLowerCase() !== "paid" || !body.order_id) return new Response("ok");
        const { publicDb, sha256Hex } = await import("@/lib/public-db.server");
        const { data, error } = await publicDb().rpc("oxapay_mark_paid", {
          _order_id: body.order_id,
          _key_hash: await sha256Hex(key),
          _track_id: body.track_id != null ? String(body.track_id) : undefined,
        });
        if (error) {
          console.error("OxaPay activation failed", error.message);
          return new Response("activation failed", { status: 500 });
        }
        const r = data as { notify?: boolean; name?: string; email?: string; plan?: string; amount?: number; ip?: string; country?: string } | null;
        if (r?.notify && r.plan) {
          const { sendPlanAlert } = await import("@/lib/telegram-notify.server");
          const delivered = await sendPlanAlert({
            name: r.name ?? null, email: r.email ?? null, plan: r.plan, amount: Number(r.amount ?? 0),
            ip: r.ip ?? null, country: r.country ?? null,
          });
          if (!delivered) return new Response("alert pending", { status: 503 });
          const { error: ackError } = await publicDb().rpc("oxapay_ack_alert", { _order_id: body.order_id, _key_hash: await sha256Hex(key) });
          if (ackError) return new Response("alert pending", { status: 503 });
        }
        return new Response("ok");
      },
    },
  },
});
