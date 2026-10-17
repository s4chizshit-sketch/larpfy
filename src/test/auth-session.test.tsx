import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/lib/auth";

const mocks = vi.hoisted(() => ({
  listener: undefined as undefined | ((event: string, session: unknown) => void),
  resolve: undefined as undefined | ((value: unknown) => void),
}));
vi.mock("@/integrations/supabase/client", () => ({ supabase: {
  auth: {
    onAuthStateChange: vi.fn((listener) => { mocks.listener = listener; return { data: { subscription: { unsubscribe: vi.fn() } } }; }),
    getSession: vi.fn(() => new Promise((resolve) => { mocks.resolve = resolve; })),
  },
  rpc: vi.fn(() => Promise.resolve({})),
} }));
vi.mock("@/lib/visit.functions", () => ({ recordVisit: vi.fn(() => Promise.resolve({ ok: true })), trackSiteVisit: vi.fn(() => Promise.resolve({ ok: true })) }));

function State() {
  const { user, loading } = useAuth();
  return <output>{loading ? "loading" : user?.id ?? "signed-out"}</output>;
}
afterEach(() => { sessionStorage.clear(); });
describe("Auth initialization", () => {
  it("does not overwrite a new signed-in session with an older startup result", async () => {
    render(<AuthProvider><State /></AuthProvider>);
    await act(async () => {
      mocks.listener?.("SIGNED_IN", { user: { id: "current-user" } });
      mocks.resolve?.({ data: { session: null } });
    });
    expect(screen.getByText("current-user")).toBeInTheDocument();
  });
  it("keeps a sign-out newer than a stale signed-in startup session", async () => {
    render(<AuthProvider><State /></AuthProvider>);
    await act(async () => {
      mocks.listener?.("SIGNED_OUT", null);
      mocks.resolve?.({ data: { session: { user: { id: "old-user" } } } });
    });
    expect(screen.getByText("signed-out")).toBeInTheDocument();
    expect(screen.queryByText("old-user")).not.toBeInTheDocument();
  });
});