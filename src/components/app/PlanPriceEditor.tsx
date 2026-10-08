import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Minus, Plus, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Row = { id: string; name: string; price: number; billing_period: string };

export function PlanPriceEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "plans", "prices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("id,name,price,billing_period").eq("active", true).order("sort_order");
      if (error) throw error;
      return data as Row[];
    },
  });
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  useEffect(() => {
    if (data) setDraft(Object.fromEntries(data.map((p) => [p.id, String(Number(p.price))])));
  }, [data]);

  const bump = (id: string, d: number) =>
    setDraft((s) => ({ ...s, [id]: String(Math.max(0, Math.round((Number(s[id] || 0) + d) * 100) / 100)) }));

  const save = async (p: Row) => {
    const price = Number(draft[p.id]);
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid price");
    setSaving(p.id);
    const { error } = await supabase.from("plans").update({ price }).eq("id", p.id);
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success(`${p.name} saved — $${price}`);
    qc.invalidateQueries({ queryKey: ["plans"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  return (
    <section className="pro-panel mt-10 p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <h2 className="pro-title text-xl">Manage plan prices</h2>
          <p className="mt-1 text-sm text-muted-foreground">Admin only. Saved prices update instantly for every user.</p>
        </div>
      </div>
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data?.map((p) => {
            const changed = draft[p.id] !== String(Number(p.price));
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-background/40 p-4">
                <p className="font-semibold tracking-tight">{p.name}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">per {p.billing_period}</p>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => bump(p.id, -1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-accent" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <input type="number" min={0} step="0.01" value={draft[p.id] ?? ""} onChange={(e) => setDraft((s) => ({ ...s, [p.id]: e.target.value }))}
                      className="h-10 w-full rounded-xl border border-border bg-background pl-7 pr-3 text-lg font-semibold outline-none focus:border-primary" />
                  </div>
                  <button onClick={() => bump(p.id, 1)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border hover:bg-accent" aria-label="Increase"><Plus className="h-4 w-4" /></button>
                </div>
                <button disabled={!changed || saving === p.id} onClick={() => save(p)}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0">
                  {saving === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save price
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
