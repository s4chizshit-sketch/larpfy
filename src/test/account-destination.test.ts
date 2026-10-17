import { describe, expect, it } from "vitest";
import { accountDestination } from "@/lib/account-destination";

describe("Account destination", () => {
  it("sends admins to the admin panel", () => {
    expect(accountDestination(true)).toBe("/admin");
  });
  it("keeps admins out of user billing even with a billing redirect", () => {
    expect(accountDestination(true, "billing")).toBe("/admin");
  });
  it("preserves regular user destinations", () => {
    expect(accountDestination(false)).toBe("/dashboard");
    expect(accountDestination(false, "billing")).toBe("/dashboard/billing");
  });
});