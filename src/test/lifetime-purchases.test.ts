import { afterEach, describe, expect, it, vi } from "vitest";
import { bridgeReadiness, checkedReceipt, lifetimePlanProduct } from "@/lib/lifetime-contract";
import { createLifetimeCheckout, readLifetimePurchases } from "@/lib/lifetime-bridge.server";

const user = "10000000-0000-4000-8000-000000000001";
const receipt = {
  id: "20000000-0000-4000-8000-000000000001", website_user_id: user,
  product: "instagram", plan: "lifetime", amount: 25, currency: "USD", payment_asset: "USDT",
  status: "pending", expires_at: null, created_at: "2026-11-08T08:00:00Z", invoice_id: "invoice-1",
  access_key: null, license_product: null, license_registered: false, apk_product: "instagram", payment_verified_at: null,
};
const capabilities = { contract_version: 1, ready: true, capacity_limit: 100, atomic_reservations: true, idempotent_fulfillment: true, provider_recheck: true, products: ["instagram", "tiktok"] };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function configure() { vi.stubEnv("INSIGHTS_WEBSITE_API_ORIGIN", "https://issuer.example"); vi.stubEnv("INSIGHTS_WEBSITE_SHARED_SECRET", "test-only-shared-credential"); }

describe("Lifetime website safety gates (not real payment/issuer tests)", () => {
  it("maps only the two allowed website catalog products", () => { expect(Object.values(lifetimePlanProduct)).toEqual(["instagram", "tiktok"]); expect(lifetimePlanProduct["monthly"]).toBeUndefined(); });
  it("refuses invoices when the bot connection is missing", async () => {
    vi.stubEnv("INSIGHTS_WEBSITE_API_ORIGIN", ""); vi.stubEnv("INSIGHTS_WEBSITE_SHARED_SECRET", ""); const request = vi.fn(); vi.stubGlobal("fetch", request);
    await expect(createLifetimeCheckout(user, "verified@example.test", "instagram", "https://larpfy.store")).rejects.toThrow("connects"); expect(request).not.toHaveBeenCalled();
  });
  it("requires the combined 100-slot transactional capability before checkout", async () => {
    configure(); const request = vi.fn().mockResolvedValue(Response.json({ ...capabilities, capacity_limit: 101 })); vi.stubGlobal("fetch", request);
    await expect(createLifetimeCheckout(user, "verified@example.test", "instagram", "https://larpfy.store")).rejects.toThrow(); expect(request).toHaveBeenCalledTimes(1);
    expect(bridgeReadiness.safeParse({ ...capabilities, atomic_reservations: false }).success).toBe(false);
  });
  it("never exposes keys for an unpaid purchase", () => { expect(() => checkedReceipt({ ...receipt, access_key: "not-a-license" }, user)).toThrow("Unfulfilled"); });
  it("rejects forged fulfilled status without real registration and verification", () => { expect(() => checkedReceipt({ ...receipt, status: "fulfilled", access_key: "not-a-license", license_product: "instagram" }, user)).toThrow("Verified"); });
  it("rejects wrong price", () => { expect(() => checkedReceipt({ ...receipt, amount: 24 }, user)).toThrow(); });
  it("rejects wrong invoice currency", () => { expect(() => checkedReceipt({ ...receipt, currency: "INR" }, user)).toThrow(); });
  it("rejects wrong payment asset", () => { expect(() => checkedReceipt({ ...receipt, payment_asset: "BTC" }, user)).toThrow(); });
  it("rejects mismatched invoice identity", () => { expect(() => checkedReceipt(receipt, user, undefined, "20000000-0000-4000-8000-000000000002")).toThrow("identity"); });
  it("rejects cross-account receipts", () => { expect(() => checkedReceipt(receipt, "10000000-0000-4000-8000-000000000002")).toThrow("unavailable"); });
  it("rejects mismatched product", () => { expect(() => checkedReceipt(receipt, user, "tiktok")).toThrow("Product mismatch"); });
  it("rejects mismatched APK", () => { expect(() => checkedReceipt({ ...receipt, apk_product: "tiktok" }, user)).toThrow("APK"); });
  it("rejects expiring lifetime licenses", () => { expect(() => checkedReceipt({ ...receipt, expires_at: "2027-01-01T00:00:00Z" }, user)).toThrow(); });
  it("requires the fulfilled key to belong to the matching real license product", () => { expect(() => checkedReceipt({ ...receipt, status: "fulfilled", payment_verified_at: "2026-11-08T08:01:00Z", access_key: "test-fixture-not-an-active-key", license_registered: true, license_product: "tiktok" }, user)).toThrow("Verified"); });
  it("sends only verified website identity and fixed lifetime terms to the bridge", async () => {
    configure(); const request = vi.fn().mockResolvedValueOnce(Response.json(capabilities)).mockResolvedValueOnce(Response.json({ purchase: receipt, payment_url: "https://pay.oxapay.com/invoice-1" })); vi.stubGlobal("fetch", request);
    expect(await createLifetimeCheckout(user, "verified@example.test", "instagram", "https://larpfy.store")).toEqual({ url: "https://pay.oxapay.com/invoice-1" });
    const body = JSON.parse(request.mock.calls[1][1].body); expect(body).toMatchObject({ website_user_id: user, product: "instagram", amount: 25, currency: "USD", plan: "lifetime" }); expect(body).not.toHaveProperty("telegram_chat_id");
  });
  it("blocks an attacker-controlled checkout URL", async () => {
    configure(); vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json(capabilities)).mockResolvedValueOnce(Response.json({ purchase: receipt, payment_url: "https://oxapay.com.attacker.test/pay" })));
    await expect(createLifetimeCheckout(user, "verified@example.test", "instagram", "https://larpfy.store")).rejects.toThrow("address");
  });
  it("refuses another account's purchase list from an incorrectly scoped bridge", async () => {
    configure(); vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ purchases: [{ ...receipt, website_user_id: "10000000-0000-4000-8000-000000000002" }] })));
    await expect(readLifetimePurchases(user)).rejects.toThrow("unavailable");
  });
});