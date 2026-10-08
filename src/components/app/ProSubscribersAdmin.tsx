import { useQuery } from "@tanstack/react-query";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Admin list of accounts with a confirmed paid purchase. */
export function ProSubscribersAdmin() {
  const { data } = useQuery({
    queryKey: ["admin", "pro-subscribers"],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data: buys } = await supabase.from("plan_purchases").select("*").order("started_at", { ascending: false }).limit(200);
      const ids = [...new Set((buys ?? []).map((b) => b.user_id))];
      const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,email,name").in("id", ids) : { data: [] };
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return (buys ?? []).map((b) => ({ ...b, email: map.get(b.user_id)?.email ?? "—", name: map.get(b.user_id)?.name }));
    },
  });
  return (
    <section className="mt-10">
      <h2 className="pro-title mb-4 flex items-center gap-2 text-xl"><Crown className="h-5 w-5 text-primary" /> Pro Subscriptions <span className="text-sm font-normal text-muted-foreground">({data?.length ?? 0})</span></h2>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border"><th className="p-3">Gmail</th><th className="p-3">Plan</th><th className="p-3">Paid</th><th className="p-3">Purchased</th><th className="p-3">Expires</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {data?.map((p) => {
              const active = !p.expires_at || new Date(p.expires_at).getTime() > Date.now();
              return (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3"><p className="font-medium">{p.email}</p>{p.name && <p className="text-xs text-muted-foreground">{p.name}</p>}</td>
                  <td className="p-3">{p.plan_name}</td>
                  <td className="p-3">${Number(p.price)}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{new Date(p.started_at).toLocaleString()}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "Lifetime"}</td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${active ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{active ? "Pro active" : "Expired"}</span></td>
                </tr>
              );
            })}
            {!data?.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No paid subscriptions yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
