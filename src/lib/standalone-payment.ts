export type PaymentOrder = { id: string; product: string; track_id: string | null; amount: number; currency: string };
export function verifiedLifetimePayment(order: PaymentOrder, p: Record<string, unknown>) {
  const txs = Array.isArray(p.txs) ? p.txs as Record<string, unknown>[] : [];
  const assets = txs.map((t) => String(t.currency ?? t.coin ?? "").toUpperCase());
  if (!txs.length) assets.push(String(p.pay_currency ?? p.to_currency ?? "").toUpperCase());
  return order.track_id !== null && String(p.track_id) === order.track_id && p.order_id === order.id
    && order.amount === 25 && Number(p.amount) === 25 && order.currency === "USD" && String(p.currency).toUpperCase() === "USD"
    && String(p.status).toLowerCase() === "paid" && assets.length > 0 && assets.every((c) => c === "USDT");
}