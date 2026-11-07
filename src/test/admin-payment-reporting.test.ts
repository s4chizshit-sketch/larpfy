import { webcrypto } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock("@/lib/public-db.server", () => ({ publicDb: () => ({ rpc }), sha256Hex: async () => "test-only-fingerprint" }));
import { Route } from "@/routes/api/public/oxapay-webhook";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("Admin-only payment reporting", () => {
  it("accepts a confirmed payment without Telegram tokens or external messages", async () => {
    vi.stubGlobal("crypto", webcrypto);
    vi.stubEnv("OXAPAY_MERCHANT_API_KEY", "  test-only-merchant-key\n");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.stubEnv("TELEGRAM_SALES_BOT_TOKEN", "");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    rpc.mockResolvedValue({ data: { notify: true, plan: "Shopify Monthly Plan" }, error: null });
    const raw = JSON.stringify({ status: "Paid", order_id: "test-order", track_id: "test-track" });
    const key = await webcrypto.subtle.importKey("raw", new TextEncoder().encode("test-only-merchant-key"), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
    const signature = await webcrypto.subtle.sign("HMAC", key, new TextEncoder().encode(raw));
    const hmac = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
    const config = Route as unknown as { server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } } };
    const result = await config.server.handlers.POST({ request: new Request("http://localhost/api/public/oxapay-webhook", { method: "POST", headers: { hmac }, body: raw }) });
    expect(result.status).toBe(200);
    expect(await result.text()).toBe("ok");
    expect(rpc).toHaveBeenCalledWith("oxapay_mark_paid", { _order_id: "test-order", _key_hash: "test-only-fingerprint", _track_id: "test-track" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});