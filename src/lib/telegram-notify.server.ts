// Sends private admin alerts to the owner's chat with the bot. Never throws.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function sendSignupAlert(info: { email: string | null; ip: string | null; country: string | null }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "medium" });
  const text =
    `🆕 <b>New account</b>\n` +
    `📧 ${esc(info.email ?? "unknown")}\n` +
    `🌐 IP: <code>${esc(info.ip ?? "unknown")}</code>\n` +
    `🏳️ Country: ${esc(info.country ?? "unknown")}\n` +
    `🕒 ${esc(time)} IST`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
      signal: AbortSignal.timeout(4000),
    });
    if (!r.ok) console.error("Telegram alert failed", r.status);
  } catch (e) {
    console.error("Telegram alert error", e instanceof Error ? e.message : "unknown");
  }
}
