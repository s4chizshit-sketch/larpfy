import { describe, expect, it } from "vitest";
import { purchaseTelegramLink } from "@/lib/purchase-message";

describe("Paid plan Telegram draft", () => {
  it.each(["Instagram Monthly Plan", "TikTok Lifetime Pro Plan", "Instagram 10 Day Plan", "TikTok Yearly Plan"])("preserves the purchased %s", (name) => {
    const url = new URL(purchaseTelegramLink(name));
    expect(url.origin + url.pathname).toBe("https://t.me/larpinght");
    expect(url.searchParams.get("text")).toContain(`I purchased the ${name}. My payment is complete.`);
  });
});