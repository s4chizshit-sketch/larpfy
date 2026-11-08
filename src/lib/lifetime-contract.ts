import { z } from "zod";

export const lifetimeProduct = z.enum(["instagram", "tiktok"]);
export const lifetimePlanProduct: Record<string, "instagram" | "tiktok"> = {
  "c752255b-bfe6-4de8-8c02-99fe314f0221": "instagram",
  "c752255b-bfe6-4de8-8c02-99fe314f0222": "tiktok",
};
export const bridgeReadiness = z.object({
  contract_version: z.literal(1),
  ready: z.literal(true),
  capacity_limit: z.literal(100),
  atomic_reservations: z.literal(true),
  idempotent_fulfillment: z.literal(true),
  provider_recheck: z.literal(true),
  products: z.tuple([z.literal("instagram"), z.literal("tiktok")]),
});
export const lifetimeReceipt = z.object({
  id: z.string().uuid(),
  website_user_id: z.string().uuid(),
  product: lifetimeProduct,
  plan: z.literal("lifetime"),
  amount: z.literal(25),
  currency: z.literal("USD"),
  payment_asset: z.literal("USDT"),
  status: z.enum(["pending", "paid", "fulfilled", "expired", "revoked"]),
  expires_at: z.null(),
  created_at: z.string().datetime(),
  invoice_id: z.string().min(1).max(100),
  access_key: z.string().min(1).max(512).nullable(),
  license_product: lifetimeProduct.nullable(),
  license_registered: z.boolean(),
  apk_product: lifetimeProduct,
  payment_verified_at: z.string().datetime().nullable(),
});
export type LifetimeReceipt = z.infer<typeof lifetimeReceipt>;

export function checkedReceipt(input: unknown, userId: string, product?: "instagram" | "tiktok") {
  const receipt = lifetimeReceipt.parse(input);
  if (receipt.website_user_id !== userId) throw new Error("Order unavailable.");
  if (product && receipt.product !== product) throw new Error("Product mismatch.");
  if (receipt.apk_product !== receipt.product) throw new Error("APK product mismatch.");
  if (receipt.status === "fulfilled") {
    if (!receipt.payment_verified_at || !receipt.license_registered || !receipt.access_key || receipt.license_product !== receipt.product) {
      throw new Error("Verified product license unavailable.");
    }
  } else if (receipt.access_key !== null) {
    throw new Error("Unfulfilled license must not be exposed.");
  }
  return receipt;
}

export function safeBridgeBase(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Secure editor connection required.");
  return url.origin;
}