import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Save, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/pricing")({
  head: () => ({ meta: [
    { title: "Manage Plan Prices | LARP Insight" },
    { name: "description", content: "Manage Instagram, TikTok and Shopify subscription plans and prices." },
    { property: "og:title", content: "Manage Plan Prices | LARP Insight" },
    { property: "og:description", content: "Edit and save LARP Insight subscription plans." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PricingAdmin,
});

type Plan = { id?: string; name: string; price: number; billing_period: string; features: string[]; cta: string; popular: boolean; active: boolean; sort_order: number };

function PricingAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw error;
      return data as (Plan & { id: string })[];
    },
  });
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const savePrice = async (id: string) => {
    const v = Number(drafts[id]);
    if (drafts[id] === undefined || drafts[id] === "" || !(v >= 0)) return toast.error("Enter a valid price");
    const { error } = await supabase.from("plans").update({ price: v }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Price saved — all users now see the new price");
    setDrafts((d) => { const n = { ...d }; delete n[id]; return n; }); refresh();
  };
  const [edit, setEdit] = useState<(Plan & { featuresText: string }) | null>(null);
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin", "plans"] }); qc.invalidateQueries({ queryKey: ["plans"] }); };

  const save = async () => {
    if (!edit || !edit.name.trim()) return toast.error("Plan name is required");
    if (!(edit.price >= 0)) return toast.error("Enter a valid price");
    const { featuresText, id, ...rest } = edit;
    delete (rest as any).created_at;
    const row = { ...rest, features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean) };
    const { error } = id ? await supabase.from("plans").update(row).eq("id", id) : await supabase.from("plans").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Plan saved"); setEdit(null); refresh();
  };
  const toggle = async (id: string, active: boolean) => {
    const { error } = await supabase.from("plans").update({ active }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const del = async (id: string) => {
    if (!confirm("Delete this plan? Users on it will move to Free.")) return;
    const { error } = await supabase.from("plans").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const blank: Plan & { featuresText: string } = { name: "", price: 0, billing_period: "month", features: [], featuresText: "", cta: "Get Plan", popular: false, active: true, sort_order: (data?.length ?? 0) + 1 };

  return (
    <>
      <PageHeader title="Pricing" sub="Plans shown on the pricing page. Only active plans are visible to visitors." action={<Button className="bg-brand" onClick={() => setEdit(blank)}><Plus className="h-4 w-4" /> New plan</Button>} />
      {isLoading ? <Skeleton className="h-64" /> : !data?.length ? <EmptyState icon={Tags} title="No plans yet" /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-5 ${p.popular ? "border-primary/50" : "border-border"} bg-card/60`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name} {p.popular && <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px]">Popular</span>}</h3>
                <Switch checked={p.active} onCheckedChange={(c) => toggle(p.id, c)} />
              </div>
              <p className="mt-2 font-display text-3xl font-semibold">${Number(p.price)}<span className="text-sm text-muted-foreground"> / {p.billing_period}</span></p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">$</span>
                <Input type="number" min={0} step="0.01" aria-label="Price" className="h-9 w-28" value={drafts[p.id] ?? String(Number(p.price))} onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })} />
                <Button size="sm" className="bg-brand" disabled={drafts[p.id] === undefined || Number(drafts[p.id]) === Number(p.price)} onClick={() => savePrice(p.id)}><Save className="h-4 w-4" /> Save</Button>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">{p.features.map((f) => <li key={f}>• {f}</li>)}</ul>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEdit({ ...p, featuresText: p.features.join("\n") })}><Pencil className="h-4 w-4" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{edit?.id ? "Edit plan" : "New plan"}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Label>Plan name</Label><p className="mt-1 text-xs text-muted-foreground">Start with "Instagram", "TikTok" or "Shopify" so it shows in that platform box, e.g. "Shopify 10 Day Plan".</p><Input className="mt-2" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
              <div><Label>Price (USD)</Label><Input type="number" min={0} step="0.01" className="mt-2" value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></div>
              <div><Label>Plan length</Label>
                <select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={/days?$/.test(edit.billing_period) ? "days" : edit.billing_period} onChange={(e) => setEdit({ ...edit, billing_period: e.target.value === "days" ? "10 days" : e.target.value })}>
                  <option value="month">Monthly (30 days)</option>
                  <option value="year">Yearly (365 days)</option>
                  <option value="once">Lifetime</option>
                  <option value="days">Custom days</option>
                </select>
                {/days?$/.test(edit.billing_period) && (
                  <Input type="number" min={1} className="mt-2" aria-label="Number of days" value={parseInt(edit.billing_period) || 1} onChange={(e) => { const n = Math.max(1, Number(e.target.value) || 1); setEdit({ ...edit, billing_period: `${n} ${n === 1 ? "day" : "days"}` }); }} />
                )}
              </div>
              <div className="sm:col-span-2"><Label>Features (one per line)</Label><Textarea rows={5} className="mt-2" value={edit.featuresText} onChange={(e) => setEdit({ ...edit, featuresText: e.target.value })} /></div>
              <div><Label>Button text</Label><Input className="mt-2" value={edit.cta} onChange={(e) => setEdit({ ...edit, cta: e.target.value })} /></div>
              <div><Label>Order</Label><Input type="number" className="mt-2" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) })} /></div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={edit.popular} onCheckedChange={(c) => setEdit({ ...edit, popular: c })} /> Popular badge</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={edit.active} onCheckedChange={(c) => setEdit({ ...edit, active: c })} /> Active</label>
            </div>
          )}
          <DialogFooter><Button className="bg-brand" onClick={save}>Save plan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
