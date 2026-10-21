import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const setup = readFileSync("database-setup.sql", "utf8");

describe("Shopify starter plans", () => {
  it("starts the monthly plan at $25 with monthly billing", () => {
    const row = setup.match(/\('Shopify Monthly Plan',\s*(\d+),\s*'([^']+)'/);
    expect(row?.[1]).toBe("25");
    expect(row?.[2]).toBe("month");
  });
  it("starts lifetime access at $30 with one-time billing", () => {
    const row = setup.match(/\('Shopify Lifetime Pro Plan',\s*(\d+),\s*'([^']+)'/);
    expect(row?.[1]).toBe("30");
    expect(row?.[2]).toBe("once");
  });
});