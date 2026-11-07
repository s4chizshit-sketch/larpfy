import { afterEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ getSession: vi.fn(), refreshSession: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
import { checkoutSession } from "@/lib/checkout-session";
afterEach(() => vi.clearAllMocks());
describe("Checkout login", () => {
  it("requires login when there is no session", async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    expect(await checkoutSession()).toBeNull();
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });
  it("refreshes an expired session before starting payment", async () => {
    auth.getSession.mockResolvedValue({ data: { session: { expires_at: 1 } }, error: null });
    const session = { expires_at: Date.now() / 1000 + 3600, access_token: "test-refreshed-token" };
    auth.refreshSession.mockResolvedValue({ data: { session }, error: null });
    expect(await checkoutSession()).toEqual(session);
    expect(auth.refreshSession).toHaveBeenCalledTimes(1);
  });
  it("does not proceed when refresh fails", async () => {
    auth.getSession.mockResolvedValue({ data: { session: { expires_at: 1 } }, error: null });
    auth.refreshSession.mockResolvedValue({ data: { session: null }, error: new Error("expired") });
    expect(await checkoutSession()).toBeNull();
  });
  it("reuses a current session without refreshing", async () => {
    const session = { expires_at: Date.now() / 1000 + 3600 };
    auth.getSession.mockResolvedValue({ data: { session }, error: null });
    expect(await checkoutSession()).toEqual(session);
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });
});