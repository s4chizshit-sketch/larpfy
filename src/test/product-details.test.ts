import { describe, expect, it } from "vitest";
import { EDITOR_DETAILS, BOT_PLANS, TELEGRAM_BOT, OWNER_CHAT, ownerDraft, shorterAccessMessage, paidSupportMessage } from "@/lib/product-details";
describe("Product delivery and external-plan references", () => {
  it("keeps the Instagram guide and APK mapped to Instagram", () => { expect(EDITOR_DETAILS.instagram.video).toBe("https://youtu.be/6fyQY7e4h9o"); expect(EDITOR_DETAILS.instagram.apk).toBe("instagram.apk"); });
  it("keeps the TikTok guide and APK mapped to TikTok", () => { expect(EDITOR_DETAILS.tiktok.video).toBe("https://youtube.com/shorts/KITGjjZQMuQ"); expect(EDITOR_DETAILS.tiktok.apk).toBe("tiktok.apk"); });
  it("uses the given bot and owner", () => { expect(TELEGRAM_BOT).toBe("https://t.me/Insightseditorall_bot"); expect(OWNER_CHAT).toBe("https://t.me/TheDanielBrooks"); });
  it("references daily $1 for 1 day", () => { expect(BOT_PLANS[0]).toEqual({ name: "Daily", price: 1, days: 1 }); });
  it("references weekly $5 for 7 days", () => { expect(BOT_PLANS[1]).toEqual({ name: "Weekly", price: 5, days: 7 }); });
  it("references monthly $10 for 30 days", () => { expect(BOT_PLANS[2]).toEqual({ name: "Monthly", price: 10, days: 30 }); });
  for (const product of ["instagram", "tiktok"] as const) {
    it(`URL encodes ${product} owner drafts`, () => { const text = shorterAccessMessage(product); expect(new URL(ownerDraft(text)).searchParams.get("text")).toBe(text); expect(text).toContain(EDITOR_DETAILS[product].name); });
    it(`includes only ${product} product and order in paid support`, () => { expect(paidSupportMessage(product, "order-reference")).toBe(`Product: ${EDITOR_DETAILS[product].name}\nOrder: order-reference`); });
  }
});