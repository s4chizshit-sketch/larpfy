import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/affiliate")({
  component: AffiliateAdmin,
});

function AffiliateAdmin() {
  const qc = useQueryClient();
  const { data: content } = useSiteContent();
  const [cfg, setCfg] = useState({ commission_percent: 20, min_payout: 50 });
  useEffect(() => { if (content?.affiliate) setCfg({ ...cfg, ...content.affiliate }); }, [content]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "affiliate"],
    queryFn: async () => {
      const [{ data: affs }, { data: refs }, { data: payouts }, { data: profiles }, { data: clicks }] = await Promise.all([
        supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
        supabase.from("referrals").select("*").order("created_at", { ascending: false }),
        supabase.from("payouts").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,name,email"),
        supabase.from("referral_clicks").select("affiliate_user_id"),
      ]);
      const who = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
      return { affs: affs ?? [], refs: refs ?? [], payouts: payouts ?? [], who, clicks: clicks ?? [] };
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "affiliate"] });

  const saveCfg = async () => {
    if (cfg.commission_percent < 0 || cfg.commission_percent > 100) return toast.error("Commission must be 0–100%");
    const { error } = await supabase.from("site_content").upsert({ key: "affiliate", value: cfg, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["site_content"] });
    toast.success("Affiliate settings saved");
  };
  const setPayout = async (id: string, status: string) => {
    const { error } = await supabase.from("payouts").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Payout ${status}`); refresh(); }
  };
  const name = (id: string) => data?.who[id]?.email ?? id.slice(0, 8);

  return (
    <>
      <PageHeader title="Affiliate" sub="Commission settings, affiliates, referrals and payouts." />
      <section className="rounded-2xl border border-border bg-card/60 p-6">
        <h2 className="font-semibold">Program settings</h2>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div><Label>Commission %</Label><Input type="number" min={0} max={100} className="mt-2 w-32" value={cfg.commission_percent} onChange={(e) => setCfg({ ...cfg, commission_percent: Number(e.target.value) })} /></div>
          <div><Label>Minimum payout ($)</Label><Input type="number" min={0} className="mt-2 w-32" value={cfg.min_payout} onChange={(e) => setCfg({ ...cfg, min_payout: Number(e.target.value) })} /></div>
          <Button className="bg-brand" onClick={saveCfg}>Save</Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Commission is recorded when you set a referred user's subscription to "active" in Users.</p>
      </section>
      {isLoading ? <Skeleton className="mt-6 h-64" /> : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Affiliates" value={data!.affs.length} />
            <StatCard label="Clicks" value={data!.clicks.length} />
            <StatCard label="Referrals" value={data!.refs.length} />
            <StatCard label="Commission owed" value={`$${data!.refs.reduce((s, r) => s + Number(r.commission), 0).toFixed(2)}`} />
          </div>
          <Tabs defaultValue="payouts" className="mt-8">
            <TabsList><TabsTrigger value="payouts">Payout requests</TabsTrigger><TabsTrigger value="affiliates">Affiliates</TabsTrigger><TabsTrigger value="referrals">Referrals</TabsTrigger></TabsList>
            <TabsContent value="payouts" className="overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader><TableRow><TableHead>Affiliate</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Details</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
                <TableBody>
                  {data!.payouts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{name(p.user_id)}</TableCell><TableCell>${Number(p.amount).toFixed(2)}</TableCell><TableCell>{p.method}</TableCell>
                      <TableCell className="max-w-48 truncate text-xs">{p.details}</TableCell><TableCell className="capitalize">{p.status}</TableCell>
                      <TableCell className="space-x-2 whitespace-nowrap">
                        {p.status === "pending" && <><Button size="sm" variant="outline" onClick={() => setPayout(p.id, "approved")}>Approve</Button><Button size="sm" variant="ghost" onClick={() => setPayout(p.id, "rejected")}>Reject</Button></>}
                        {p.status === "approved" && <Button size="sm" className="bg-brand" onClick={() => setPayout(p.id, "paid")}>Mark paid</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data!.payouts.length && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No payout requests.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="affiliates" className="overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader><TableRow><TableHead>Affiliate</TableHead><TableHead>Code</TableHead><TableHead>Clicks</TableHead><TableHead>Referrals</TableHead><TableHead>Earned</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data!.affs.map((a) => {
                    const r = data!.refs.filter((x) => x.affiliate_user_id === a.user_id);
                    return (
                      <TableRow key={a.user_id}>
                        <TableCell>{name(a.user_id)}</TableCell><TableCell className="font-mono text-xs">{a.code}</TableCell>
                        <TableCell>{data!.clicks.filter((c) => c.affiliate_user_id === a.user_id).length}</TableCell><TableCell>{r.length}</TableCell>
                        <TableCell>${r.reduce((s, x) => s + Number(x.commission), 0).toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {!data!.affs.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No affiliates yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="referrals" className="overflow-x-auto rounded-2xl border border-border">
              <Table>
                <TableHeader><TableRow><TableHead>Affiliate</TableHead><TableHead>Referred user</TableHead><TableHead>Status</TableHead><TableHead>Commission</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data!.refs.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{name(r.affiliate_user_id)}</TableCell><TableCell>{name(r.referred_user_id)}</TableCell>
                      <TableCell className="capitalize">{r.status}</TableCell><TableCell>${Number(r.commission).toFixed(2)}</TableCell>
                      <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {!data!.refs.length && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No referrals yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </>
      )}
    </>
  );
}
