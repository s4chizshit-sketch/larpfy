export type EditorProduct = "instagram" | "tiktok";
export const EDITOR_DETAILS = {
  instagram: { name: "Instagram Editor", video: "https://youtu.be/6fyQY7e4h9o", embed: "https://www.youtube-nocookie.com/embed/6fyQY7e4h9o", apk: "instagram.apk" },
  tiktok: { name: "TikTok Editor", video: "https://youtube.com/shorts/KITGjjZQMuQ", embed: "https://www.youtube-nocookie.com/embed/KITGjjZQMuQ", apk: "tiktok.apk" },
} as const;
export const TELEGRAM_BOT = "https://t.me/Insightseditorall_bot";
export const OWNER_CHAT = "https://t.me/TheDanielBrooks";
export const BOT_PLANS = [{ name: "Daily", price: 1, days: 1 }, { name: "Weekly", price: 5, days: 7 }, { name: "Monthly", price: 10, days: 30 }] as const;
export function shorterAccessMessage(product: EditorProduct) {
  return `Hi, mujhe ${EDITOR_DETAILS[product].name} ka daily / weekly / monthly access chahiye. Plans aur payment details bata dein.`;
}
export function paidSupportMessage(product: EditorProduct, orderId: string) {
  return `Product: ${EDITOR_DETAILS[product].name}\nOrder: ${orderId}`;
}
export function ownerDraft(message: string) { return `${OWNER_CHAT}?text=${encodeURIComponent(message)}`; }