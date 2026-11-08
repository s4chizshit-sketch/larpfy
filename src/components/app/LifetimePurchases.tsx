import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { checkoutSession } from "@/lib/checkout-session";
import { listLifetimePurchases, recheckLifetimePurchase } from "@/lib/lifetime.functions";
import { getLifetimeKey } from "@/lib/lifetime.functions";
import { useEffect, useState } from "react";
import { OwnerContact, ProductVideo } from "@/components/site/EditorProductInfo";
import { EDITOR_DETAILS, paidSupportMessage, type EditorProduct } from "@/lib/product-details";

function PurchaseKey({ id }: { id: string }) {
  const retrieve = useServerFn(getLifetimeKey);
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => { let active = true; retrieve({ data: { purchaseId: id } }).then(data => { if (active) { setKey(data.access_key); setError(!data.access_key); } }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, [id, retrieve]);
  if (!key) return <p className="mt-4 text-sm text-muted-foreground">{error ? "Key delivery unavailable. Contact the owner with your order reference." : "Retrieving your private access key…"}</p>;
  return <div className="mt-4 space-y-3"><code className="block break-all rounded-md border border-border bg-background p-3 text-sm">{key}</code><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(key); toast.success("Access key copied"); } catch { toast.error("Could not copy key."); } }}><Copy className="size-4" />Copy key</Button></div>;
}

export function LifetimePurchases() {
  const { user } = useAuth();
  const list = useServerFn(listLifetimePurchases);
  const verify = useServerFn(recheckLifetimePurchase);
  const qc = useQueryClient();
  const [checking, setChecking] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const { data, error } = useQuery({ queryKey: ["lifetime-purchases", user?.id], enabled: !!user, queryFn: () => list(), retry: false, refetchInterval: query => query.state.data?.purchases.some(p => p.status === "pending") ? 15000 : false });
  const recheck = async (id: string) => {
    setChecking(id);
    try { await verify({ data: { purchaseId: id } }); await qc.invalidateQueries({ queryKey: ["lifetime-purchases", user?.id] }); }
    catch { toast.error("Payment could not be verified. Please try again later."); }
    finally { setChecking(null); }
  };
  const download = async (id: string, product: string) => {
    setDownloading(id);
    try {
      const session = await checkoutSession();
      if (!session) throw new Error("Please log in again.");
      const response = await fetch("/api/public/lifetime-apk", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ purchaseId: id }) });
      if (!response.ok) throw new Error("APK download is unavailable.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${product}-editor.apk`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Download unavailable."); }
    finally { setDownloading(null); }
  };
  if (error) return <p className="mt-8 text-destructive">Couldn't load lifetime purchases. Please refresh.</p>;
  if (!data?.purchases.length) return null;
  return <section className="mt-10"><h2 className="pro-title mb-6 text-xl">Lifetime purchases</h2><div className="grid gap-4 md:grid-cols-2">
    {data.purchases.map((p) => <article key={p.id} className="pro-panel p-5">
      <h3 className="font-semibold">{p.product === "instagram" ? "Instagram" : "TikTok"} Editor</h3>
      <p className="mt-1 text-sm text-muted-foreground">$25 · Lifetime · No expiry</p>
      <p className="mt-3 text-sm font-semibold">{p.status === "fulfilled" && p.payment_verified_at ? "Payment successful · Lifetime access" : p.status === "expired" ? "Payment failed or expired · No access delivered" : p.status === "revoked" ? "Access unavailable" : p.status === "reserved" ? "Invoice not ready · Contact owner before retrying" : "Pending payment · Awaiting server verification"}</p>
      <p className="mt-2 break-all text-xs text-muted-foreground">Order: {p.id}</p>
      {p.status === "fulfilled" && p.payment_verified_at && p.product in EDITOR_DETAILS ? <>
        <PurchaseKey id={p.id} />
        <Button className="mt-4" disabled={downloading === p.id} onClick={() => download(p.id, p.product)}><Download className="size-4" />{downloading === p.id ? "Downloading…" : "Download APK"}</Button>
        <ProductVideo product={p.product as EditorProduct} howTo />
        <p className="mt-3 text-xs text-muted-foreground">Edited analytics change presentation only, not real views, engagement or earnings.</p>
      </> : p.status !== "revoked" ? <>
        {p.status === "pending" && p.payment_url && /^https:\/\/([a-z0-9-]+\.)*oxapay\.com\//i.test(p.payment_url) ? <Button asChild className="mt-4"><a href={p.payment_url} target="_blank" rel="noopener noreferrer">Continue payment</a></Button> : null}
        <Button className="mt-4 ml-2" disabled={checking === p.id} variant="outline" onClick={() => recheck(p.id)}><RefreshCw className="size-4" />{checking === p.id ? "Verifying…" : "Check payment"}</Button>
        <p className="mt-3 text-xs text-muted-foreground">Payment can take time to verify. A return page or screenshot does not confirm payment.</p>
      </> : null}
      {p.product in EDITOR_DETAILS ? <div className="mt-5"><OwnerContact message={paidSupportMessage(p.product as EditorProduct, p.id)} /></div> : null}
    </article>)}
  </div></section>;
}