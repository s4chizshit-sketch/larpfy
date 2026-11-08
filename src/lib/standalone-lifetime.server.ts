import { verifiedLifetimePayment, type PaymentOrder } from "./standalone-payment";
import { publicDb, sha256Hex } from "./public-db.server";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function merchantKey() { const key = process.env["OXAPAY_MERCHANT_API_KEY"]?.trim(); if (!key) throw new Error("Payments are not configured."); return key; }
export async function verifyCallbackOrder(input: unknown) {
  const order = input as PaymentOrder;
  if (!order?.track_id) throw new Error("Order unavailable");
  if ((input as { status?: string }).status === "fulfilled") return;
  const key = merchantKey();
  const response = await fetch(`https://api.oxapay.com/v1/payment/${encodeURIComponent(order.track_id)}`, { headers: { merchant_api_key: key }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Provider unavailable");
  const json = await response.json() as { data?: Record<string, unknown> };
  if (!json.data) throw new Error("Payment verification unavailable");
  if (await updateTerminalOrder(order, json.data)) return;
  if (!verifiedLifetimePayment(order,json.data)) throw new Error("Payment mismatch");
  const { error } = await publicDb().rpc("fulfill_lifetime_order", { _order_id: order.id, _key_hash: await sha256Hex(key), _track_id: order.track_id, _amount:25,_currency:"USD",_status:"paid",_provider_order_id:order.id });
  if (error) throw new Error("Delivery unavailable");
}
export async function verifyStandaloneOrder(id: string, db: SupabaseClient<Database>) {
  const { data: order, error } = await db.from("lifetime_orders").select("id,user_id,product,amount,currency,status,track_id,payment_url,created_at,payment_verified_at").eq("id", id).maybeSingle();
  if (error || !order) throw new Error("Order unavailable.");
  if (order.status === "fulfilled") return order;
  if (!order.track_id || !["pending", "expired"].includes(order.status)) return order;
  const key = merchantKey();
  const response = await fetch(`https://api.oxapay.com/v1/payment/${encodeURIComponent(order.track_id)}`, { headers: { merchant_api_key: key }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Payment verification unavailable.");
  const json = await response.json() as { data?: Record<string, unknown> };
  if (!json.data) throw new Error("Payment verification unavailable.");
  if (await updateTerminalOrder(order, json.data)) return { ...order, status: "expired" };
  if (String(json.data.status).toLowerCase() !== "paid") return order;
  if (!verifiedLifetimePayment(order, json.data)) throw new Error("Payment mismatch.");
  const { error: fulfillError } = await publicDb().rpc("fulfill_lifetime_order", { _order_id: order.id, _key_hash: await sha256Hex(key), _track_id: order.track_id, _amount: Number(json.data.amount), _currency: String(json.data.currency), _status: String(json.data.status), _provider_order_id: String(json.data.order_id) });
  if (fulfillError) throw new Error("Payment delivery unavailable.");
  const { data: receipt, error: readError } = await db.from("lifetime_orders").select("id,user_id,product,amount,currency,status,track_id,payment_url,created_at,payment_verified_at").eq("id", id).single();
  if (readError) throw new Error("Purchase unavailable.");
  return receipt;
}

async function updateTerminalOrder(order: PaymentOrder, data: Record<string, unknown>) {
  const status = String(data.status).toLowerCase();
  if (!["expired", "failed"].includes(status)) return false;
  if (String(data.track_id) !== order.track_id || data.order_id !== order.id || Number(data.amount) !== 25 || String(data.currency).toUpperCase() !== "USD") throw new Error("Payment mismatch");
  const { error } = await publicDb().rpc("mark_lifetime_terminal", { _order_id: order.id, _key_hash: await sha256Hex(merchantKey()), _track_id: String(order.track_id), _provider_order_id: order.id, _status: status });
  if (error) throw new Error("Payment verification unavailable");
  return true;
}

export async function standaloneCheckout(product: string, origin: string, db: SupabaseClient<Database>) {
  const key = merchantKey();
  const { data, error } = await db.rpc("reserve_lifetime_order", { _product: product, _key_hash: await sha256Hex(key) });
  const order = data as { id?: string; payment_url?: string; status?: string; invoice_claim?: boolean } | null;
  if (error || !order?.id) throw new Error(error?.message ?? "Checkout unavailable.");
  if (order.payment_url) return { url: order.payment_url };
  if (!order.invoice_claim) throw new Error("Pending checkout needs owner review. No duplicate invoice was created.");
  // A recovered reservation without an invoice requires reconciliation, never a second invoice.
  const created = await db.from("lifetime_orders").select("created_at").eq("id", order.id).single();
  if (created.data && Date.now() - Date.parse(created.data.created_at) > 10000) throw new Error("A pending checkout needs owner review. No duplicate payment was created.");
  const response = await fetch("https://api.oxapay.com/v1/payment/invoice", { method: "POST", headers: { "Content-Type": "application/json", merchant_api_key: key }, body: JSON.stringify({ amount: 25, currency: "USD", to_currency: "USDT", lifetime: 60, order_id: order.id, description: `LARPFY ${product} lifetime`, callback_url: `${origin}/api/public/lifetime-payment`, return_url: `${origin}/dashboard/billing` }), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Could not create payment. Contact owner before trying again.");
  const result = await response.json() as { data?: { track_id?: string | number; payment_url?: string } };
  if (!result.data?.track_id || !result.data.payment_url) throw new Error("Invoice unavailable.");
  const url = new URL(result.data.payment_url);
  if (url.protocol !== "https:" || (url.hostname !== "oxapay.com" && !url.hostname.endsWith(".oxapay.com"))) throw new Error("Invalid checkout URL.");
  const { error: saveError } = await db.rpc("attach_lifetime_invoice", { _order_id: order.id, _track_id: String(result.data.track_id), _url: url.toString() });
  if (saveError) throw new Error("Checkout needs owner review.");
  return { url: url.toString() };
}