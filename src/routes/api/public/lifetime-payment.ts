import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/public/lifetime-payment")({
  staticData: { sitemap: false }, server: { handlers: { POST: async ({ request }) => {
  const key = process.env["OXAPAY_MERCHANT_API_KEY"]?.trim();
  const signature = request.headers.get("hmac");
  if (!key || !signature || !/^[a-f0-9]{128}$/i.test(signature)) return new Response("Invalid signature", { status: 401 });
  const raw = await request.text();
  const imported = await crypto.subtle.importKey("raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-512" }, false, ["verify"]);
  const bytes = new Uint8Array(signature.match(/.{2}/g)?.map((s) => parseInt(s,16)) ?? []);
  if (!await crypto.subtle.verify("HMAC", imported, bytes, new TextEncoder().encode(raw))) return new Response("Invalid signature", { status: 401 });
  let parsed: unknown; try { parsed=JSON.parse(raw); } catch { return new Response("Invalid body",{status:400}); }
  const body = z.object({ order_id: z.string().uuid() }).safeParse(parsed);
  if (!body.success) return new Response("Invalid order", { status: 400 });
  try {
    const { publicDb } = await import("@/lib/public-db.server");
    // Anonymous order reads are unavailable: a narrowly fingerprint-authorized lookup supplies the immutable order.
    const db = publicDb();
    const { sha256Hex } = await import("@/lib/public-db.server");
    const { data, error } = await db.rpc("lookup_lifetime_callback", { _order_id: body.data.order_id, _key_hash: await sha256Hex(key) });
    if (error || !data) throw new Error("Order unavailable");
    const { verifyCallbackOrder } = await import("@/lib/standalone-lifetime.server");
    await verifyCallbackOrder(data);
    return new Response("ok");
  } catch { return new Response("Verification unavailable", { status: 503 }); }
} } } });