import { describe, it, expect, vi } from "vitest";
import { recoverModuleLoad } from "@/lib/module-recovery";
describe("Stale module recovery", () => {
  it("reloads a stale module once but prevents a reload loop", () => {
    let value: string | null = null;
    const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
    const reload = vi.fn();
    const error = new TypeError("Failed to fetch dynamically imported module: /src/routes/index.tsx");
    expect(recoverModuleLoad(error, storage, reload, 100000)).toBe(true);
    expect(recoverModuleLoad(error, storage, reload, 100001)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });
  it("does not reload ordinary application failures", () => {
    const reload = vi.fn();
    expect(recoverModuleLoad(new Error("Payment mismatch"), { getItem: () => null, setItem: vi.fn() }, reload)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});