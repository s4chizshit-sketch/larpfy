import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Gift } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, PageHeader, StatCard } from "@/components/app/AppShell";
import { useAffiliateStats } from "@/lib/affiliate";
import { useSiteContent } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/affiliate")({
  component: AffiliateDash,
});

function AffiliateDash() {
  const { user } = useAuth();
  const { data, isLoading } = useAffiliateStats();
  const { data: content } = useSiteContent();
  const qc = useQueryClient();
  const [payout, setPayout] = useState({ amount: "", method: "PayPal", details: "" });
  const pct = content?.affiliate?.commission_percent ?? 20;
  const min = Number(content?.affiliate?.min_payout ?? 50);

  const join = async () => {
    const code = (user!.email!.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 10) + Math.random().toString(36).slice(2, 6)).toLowerCase();
    const { error } = await supabase.from("affiliates").insert({ user_id: user!.id, code });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["affiliate"] });
    toast.success("Welcome to the affiliate program!");
  };
  const requestPayout = async () => {
    const amount = Number(payout.amount);
    if (!amount || amount < min) return toast.error(`Minimum payout is $${min}`);
    if (amount > (data?.available ?? 0)) return toast.error("Amount exceeds your available balance");
    if (!payout.details.trim()) return toast.error("Add your payout details");
    const { error } = await supabase.from("payouts").insert({ user_id: user!.id, amount, method: payout.method, details: payout.details.trim().slice(0, 300) });
    if (error) return toast.error(error.message);
    setPayout({ ...payout, amount: "" });
    qc.invalidateQueries({ queryKey: ["affiliate"] });
    toast.success("Payout requested");
  };

  if (isLoading) return <Skeleton className="h-96" />;
  if (!data?.affiliate)
    return (
      <>
        <PageHeader title="Affiliate" />
        <EmptyState icon={Gift} title="Earn With LARP Insight" sub={`Get your unique referral link and earn ${pct}% commission on every paid customer you refer.`} action={<Button className="bg-brand" onClick={join}>Join the affiliate program</Button>} />
      </>
    );

  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${data.affiliate.code}`;
  return (
    <>
      <PageHeader title="Affiliate" sub={`You earn ${pct}% commission on paid referrals.`} />
      <div className="rounded-2xl border border-primary/40 bg-card p-5">
        <Label className="text-xs text-muted-foreground">Your referral link</Label>
        <div className="mt-2 flex gap-2">
          <Input readOnly value={link} className="font-mono text-sm" />
          <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copied"); }}><Copy className="h-4 w-4" /> Copy</Button>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total clicks" value={data.clicks} />
        <StatCard label="Signups" value={data.signups} />
        <StatCard label="Paid customers" value={data.paidCustomers} />
        <StatCard label="Commission earned" value={`$${data.earned.toFixed(2)}`} />
        <StatCard label="Pending commission" value={`$${data.pending.toFixed(2)}`} hint={`$${data.available.toFixed(2)} available to withdraw`} />
        <StatCard label="Paid commission" value={`$${data.paidOut.toFixed(2)}`} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Request payout</h2>
          <p className="mt-1 text-xs text-muted-foreground">Minimum ${min}.</p>
          <div className="mt-5 space-y-4">
            <div><Label>Amount (USD)</Label><Input type="number" min={0} className="mt-2" value={payout.amount} onChange={(e) => setPayout({ ...payout, amount: e.target.value })} /></div>
            <div>
              <Label>Method</Label>
              <select className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={payout.method} onChange={(e) => setPayout({ ...payout, method: e.target.value })}>
                <option>PayPal</option><option>Bank transfer</option><option>Crypto (USDT)</option>
              </select>
            </div>
            <div><Label>Payout details</Label><Input className="mt-2" placeholder="PayPal email, IBAN or wallet address" value={payout.details} onChange={(e) => setPayout({ ...payout, details: e.target.value })} /></div>
            <Button className="bg-brand" onClick={requestPayout}>Request payout</Button>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Payout history</h2>
          {data.payouts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No payout requests yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span>${Number(p.amount).toFixed(2)} · {p.method}</span>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
          <h2 className="mt-8 font-semibold">Referrals</h2>
          {data.referrals.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Share your link to get your first referral.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {data.referrals.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <span>{new Date(r.created_at).toLocaleDateString()} · <span className="capitalize">{r.status}</span></span>
                  <span>${Number(r.commission).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
