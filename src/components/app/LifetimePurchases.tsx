import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { checkoutSession } from "@/lib/checkout-session";
import { listLifetimePurchases, recheckLifetimePurchase } from "@/lib/lifetime.functions";

export function LifetimePurchases() {
  const { user } = useAuth();
  const list = useServerFn(listLifetimePurchases);
  const verify = useServerFn(recheckLifetimePurchase);
  const qc = useQueryClient();
  const { data, error } = useQuery({ queryKey: ["lifetime-purchases", user?.id], enabled: !!user, queryFn: () => list(), retry: false });
  const recheck = async (id: string) => {
    try { await verify({ data: { purchaseId: id } }); await qc.invalidateQueries({ queryKey: ["lifetime-purchases", user?.id] }); }
    catch { toast.error("Payment could not be verified. Please try again later."); }
  };
  const download = async (id: string, product: string) => {
    try {
      const session = await checkoutSession();
      if (!session) throw new Error("Please log in again.");
      const response = await fetch("/api/public/lifetime-apk", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ purchaseId: id }) });
      if (!response.ok) throw new Error("APK download is unavailable.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${product}-editor.apk`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Download unavailable."); }
  };
  if (error) return <p className="mt-8 text-destructive">Couldn't load lifetime purchases. Please refresh.</p>;
  if (!data?.purchases.length) return null;
  return <section className="mt-10"><h2 className="pro-title mb-6 text-xl">Lifetime purchases</h2><div className="grid gap-4 md:grid-cols-2">
    {data.purchases.map((p) => <article key={p.id} className="pro-panel p-5">
      <h3 className="font-semibold">{p.product === "instagram" ? "Instagram" : "TikTok"} Editor</h3>
      <p className="mt-1 text-sm text-muted-foreground">$25 · Lifetime · No expiry</p>
      <p className="mt-3 text-sm font-semibold capitalize">{p.status === "fulfilled" ? "Payment verified · Access ready" : p.status}</p>
      {p.status === "fulfilled" && p.access_key ? <>
        <div className="mt-4 flex items-center gap-2"><code className="min-w-0 flex-1 break-all rounded-md border border-border bg-background p-3 text-sm">{p.access_key}</code>
          <Button size="icon" variant="outline" aria-label="Copy access key" onClick={async () => { try { await navigator.clipboard.writeText(p.access_key ?? ""); toast.success("Access key copied"); } catch { toast.error("Could not copy key."); } }}><Copy className="size-4" /></Button></div>
        <Button className="mt-4" onClick={() => download(p.id, p.product)}><Download className="size-4" /> Download {p.product === "instagram" ? "Instagram" : "TikTok"} APK</Button>
      </> : p.status !== "revoked" && p.status !== "expired" ? <Button className="mt-4" variant="outline" onClick={() => recheck(p.id)}><RefreshCw className="size-4" /> Check payment</Button> : null}
    </article>)}
  </div></section>;
}