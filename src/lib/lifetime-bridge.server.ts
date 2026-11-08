import { bridgeReadiness, checkedReceipt, safeBridgeBase } from "./lifetime-contract";

export function bridgeConfiguration() {
  const origin = process.env["INSIGHTS_WEBSITE_API_ORIGIN"]?.trim();
  const secret = process.env["INSIGHTS_WEBSITE_SHARED_SECRET"]?.trim();
  if (!origin || !secret) throw new Error("Lifetime checkout is unavailable until the owner connects the editor license service.");
  return { origin: safeBridgeBase(origin), secret };
}

export async function bridgeRequest(path: string, body: Record<string, unknown>) {
  const { origin, secret } = bridgeConfiguration();
  const response = await fetch(`${origin}/v1/website/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${secret}` },
    body: JSON.stringify({ ...body, website_id: "larpfy.store" }),
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    // Never log provider bodies: they may contain license keys or buyer data.
    console.error("Editor bridge request failed", { status: response.status });
    throw new Error(response.status === 409 ? "Lifetime purchases are currently unavailable." : "Editor purchase service unavailable. Please try again later.");
  }
  return response;
}

export async function requireBridgeReady() {
  bridgeReadiness.parse(await (await bridgeRequest("capabilities", {})).json());
}

export async function createLifetimeCheckout(userId: string, email: string, product: "instagram" | "tiktok", origin: string) {
  await requireBridgeReady();
  const response = await bridgeRequest("checkout", {
    website_user_id: userId, verified_email: email, product, plan: "lifetime",
    amount: 25, currency: "USD", payment_asset: "USDT",
    return_url: `${origin}/dashboard/billing`,
  });
  const data = await response.json() as { purchase?: unknown; payment_url?: unknown };
  const purchase = checkedReceipt(data.purchase, userId, product);
  if (purchase.status !== "pending" || typeof data.payment_url !== "string") throw new Error("Invalid checkout response.");
  const url = new URL(data.payment_url);
  if (url.protocol !== "https:" || url.username || url.password || (url.hostname !== "oxapay.com" && !url.hostname.endsWith(".oxapay.com"))) throw new Error("Invalid payment address.");
  return { url: url.toString() };
}

export async function readLifetimePurchases(userId: string) {
  const response = await bridgeRequest("purchases", { website_user_id: userId });
  const data = await response.json() as { purchases?: unknown[] };
  if (!Array.isArray(data.purchases) || data.purchases.length > 100) throw new Error("Invalid purchase response.");
  return data.purchases.map((item) => checkedReceipt(item, userId));
}