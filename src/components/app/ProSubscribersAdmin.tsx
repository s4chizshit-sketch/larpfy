import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { countryInfo } from "@/lib/country";

/** Admin list of accounts with a confirmed paid purchase. */
export function ProSubscribersAdmin() {
  const [page, setPage] = useState(0);
  const size = 50;
  const { data, isError, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["admin", "pro-subscribers", page],
    placeholderData: keepPreviousData,
    refetchInterval: 60000,
    queryFn: async () => {
      const { data: legacy, error } = await supabase.from("plan_purchases").select("*").order("started_at", { ascending: false });
      if (error) throw error;
      const { data: lifetime, error: lifetimeError } = await supabase.from("lifetime_orders").select("id,user_id,product,amount,payment_verified_at,status").in("status",["fulfilled","revoked"]);
      if(lifetimeError) throw lifetimeError;
      const all=[...(legacy??[]),...(lifetime??[]).map(p=>({id:p.id,user_id:p.user_id,plan_name:`${p.product === "instagram"?"Instagram":"TikTok"} Editor Lifetime`,price:p.amount,started_at:p.payment_verified_at??"",expires_at:p.status==="revoked"?"1970-01-01T00:00:00Z":null}))].sort((a,b)=>Date.parse(b.started_at)-Date.parse(a.started_at));
      const count=all.length;
      const buys=all.slice(page*size,(page+1)*size);
      const ids = [...new Set((buys ?? []).map((b) => b.user_id))];
      const { data: profiles, error: profileError } = ids.length ? await supabase.from("profiles").select("id,email,name,signup_ip,signup_country").in("id", ids) : { data: [], error: null };
      if (profileError) throw profileError;
      const map = new Map((profiles ?? []).map((p) => [p.id, p]));
      return { count: count ?? 0, rows: (buys ?? []).map((b) => ({ ...b, email: map.get(b.user_id)?.email ?? "—", name: map.get(b.user_id)?.name, ip: map.get(b.user_id)?.signup_ip, country: map.get(b.user_id)?.signup_country })) };
    },
  });
  return (
    <section className="mt-10">
      <h2 className="pro-title mb-4 flex items-center gap-2 text-xl"><Crown className="h-5 w-5 text-primary" /> Pro Subscriptions <span className="text-sm font-normal text-muted-foreground">({data?.count ?? 0})</span></h2>
      {isError && <p role="alert" className="mb-3 text-destructive">Unable to load subscriptions. Please refresh.</p>}
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border"><th className="p-3">Gmail</th><th className="p-3">IP</th><th className="p-3">Country</th><th className="p-3">Plan</th><th className="p-3">Paid</th><th className="p-3">Purchased</th><th className="p-3">Expires</th><th className="p-3">Status</th></tr>
          </thead>
          <tbody>
            {data?.rows.map((p) => {
              const active = !p.expires_at || new Date(p.expires_at).getTime() > Date.now();
              return (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3"><p className="font-medium">{p.email}</p>{p.name && <p className="text-xs text-muted-foreground">{p.name}</p>}</td>
                  <td className="p-3 font-mono text-xs">{p.ip || "—"}</td>
                  <td className="whitespace-nowrap p-3">{countryInfo(p.country ?? null).flag} {countryInfo(p.country ?? null).name}</td>
                  <td className="p-3">{p.plan_name}</td>
                  <td className="p-3">${Number(p.price)}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{new Date(p.started_at).toLocaleString()}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{p.expires_at ? new Date(p.expires_at).toLocaleDateString() : "Lifetime"}</td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${active ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>{active ? "Pro active" : "Expired"}</span></td>
                </tr>
              );
            })}
            {!isError && !data?.rows.length && <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">{isLoading ? "Loading subscriptions…" : "No paid subscriptions yet."}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>Page {page + 1} of {Math.max(1, Math.ceil((data?.count ?? 0) / size))}</span>
        <Button variant="outline" size="icon" aria-label="Previous subscriptions" disabled={page === 0 || isPlaceholderData} onClick={() => setPage(page - 1)}><ChevronLeft className="size-4" /></Button>
        <Button variant="outline" size="icon" aria-label="Next subscriptions" disabled={isPlaceholderData || (page + 1) * size >= (data?.count ?? 0)} onClick={() => setPage(page + 1)}><ChevronRight className="size-4" /></Button>
      </div>
    </section>
  );
}
