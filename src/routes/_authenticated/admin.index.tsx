import { createFileRoute } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { countryInfo } from "@/lib/country";

export const Route = createFileRoute("/_authenticated/admin/")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Admin Users — LARPFY" }, { name: "description", content: "Review LARPFY accounts, signup details, country statistics and payment totals." }, { property: "og:title", content: "Admin Users — LARPFY" }, { property: "og:description", content: "Private customer account and payment analytics." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: UsersAdmin,
});

const PAGE = 50;

type Stats = {
  total_users: number; signups_today: number; signups_7d: number; online_now: number; active_today: number;
  visits_today: number; visits_7d: number; paid_orders: number; revenue: number; plan_buyers: number;
  active_plans: number; projects: number;
  countries: { country: string; users: number }[];
  visit_countries: { country: string; visits: number }[];
};

function fmtTime(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

function Country({ v }: { v: string | null }) {
  const c = countryInfo(v);
  return <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className="text-base leading-none">{c.flag}</span>{c.name}</span>;
}

function UsersAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(0);
  useEffect(() => { const t = setTimeout(() => { setTerm(q.trim()); setPage(0); }, 350); return () => clearTimeout(t); }, [q]);

  const stats = useQuery({
    queryKey: ["admin", "stats"],
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_stats" as never);
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  const plans = useQuery({
    queryKey: ["admin", "plan-names"],
    staleTime: 60000,
    queryFn: async () => (await supabase.from("plans").select("id,name")).data ?? [],
  });

  const list = useQuery({
    queryKey: ["admin", "users", term, page],
    refetchInterval: 60000,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      let qy = supabase.from("profiles").select("*", { count: "estimated" }).order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      if (term) { const t = term.replace(/[%,()]/g, ""); qy = qy.or(`email.ilike.%${t}%,name.ilike.%${t}%`); }
      const { data, error, count } = await qy;
      if (error) throw error;
      return { users: data ?? [], count: count ?? 0 };
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: any }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin"] }); toast.success("User updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const s = stats.data;
  const v = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString());
  const users = list.data?.users ?? [];
  const pages = Math.max(1, Math.ceil((list.data?.count ?? 0) / PAGE));
  const maxC = Math.max(1, ...(s?.countries ?? []).map((c) => c.users));

  return (
    <>
      <PageHeader title="Users & Analytics" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={v(s?.total_users)} />
        <StatCard label="New today" value={v(s?.signups_today)} />
        <StatCard label="New (7 days)" value={v(s?.signups_7d)} />
        <StatCard label="Online now" value={v(s?.online_now)} />
        <StatCard label="Visits today" value={v(s?.visits_today)} />
        <StatCard label="Visits (7 days)" value={v(s?.visits_7d)} />
        <StatCard label="Payments made" value={v(s?.paid_orders)} />
        <StatCard label="Plans bought" value={v(s?.plan_buyers)} />
        <StatCard label="Active plans" value={v(s?.active_plans)} />
        <StatCard label="Revenue" value={s ? `$${Number(s.revenue).toLocaleString()}` : "—"} />
        <StatCard label="Active today" value={v(s?.active_today)} />
        <StatCard label="Projects" value={v(s?.projects)} />
      </div>
      {(stats.isError || list.isError) && <p role="alert" className="mt-4 text-sm text-destructive">Unable to load current account data. Please refresh.</p>}

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold">Users by country</h2>
          {!s ? <Skeleton className="h-40" /> : s.countries.length ? (
            <ul className="space-y-2.5">
              {s.countries.map((c) => (
                <li key={c.country} className="text-sm">
                  <div className="flex justify-between"><Country v={c.country} /><span className="font-semibold">{c.users.toLocaleString()}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(c.users / maxC) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No country data yet.</p>}
        </section>
        <section className="rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-semibold">Visitors by country (7 days)</h2>
          {!s ? <Skeleton className="h-40" /> : s.visit_countries.length ? (
            <ul className="divide-y divide-border/60 text-sm">
              {s.visit_countries.map((c) => (
                <li key={c.country} className="flex justify-between py-2"><Country v={c.country} /><span className="font-semibold">{c.visits.toLocaleString()}</span></li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted-foreground">No visits recorded yet.</p>}
        </section>
      </div>

      <div className="relative mt-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        {list.isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Signed up</TableHead><TableHead>IP</TableHead><TableHead>Country</TableHead><TableHead>Last seen</TableHead><TableHead>Logins</TableHead><TableHead>Time on site</TableHead><TableHead>Plan</TableHead><TableHead>Subscription</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{u.signup_ip ?? "—"}{u.last_ip && u.last_ip !== u.signup_ip && <p className="text-muted-foreground">now: {u.last_ip}</p>}</TableCell>
                  <TableCell className="text-sm"><Country v={u.signup_country ?? u.last_country} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{u.last_seen_at ? new Date(u.last_seen_at).toLocaleString() : "—"}</TableCell>
                  <TableCell className="text-sm">{u.visit_count ?? 0}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{fmtTime(u.total_seconds ?? 0)}</TableCell>
                  <TableCell>
                    <select className="h-8 rounded-md border border-input bg-transparent px-2 text-sm" value={u.plan_id ?? ""} onChange={(e) => update.mutate({ id: u.id, patch: { plan_id: e.target.value || null } })}>
                      <option value="">Free</option>
                      {plans.data?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select className="h-8 rounded-md border border-input bg-transparent px-2 text-sm" value={u.subscription_status} onChange={(e) => update.mutate({ id: u.id, patch: { subscription_status: e.target.value } })}>
                      {["free", "active", "past_due", "cancelled"].map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant={u.status === "active" ? "outline" : "default"} onClick={() => update.mutate({ id: u.id, patch: { status: u.status === "active" ? "suspended" : "active" } })}>
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!users.length && <TableRow><TableCell colSpan={10} className="py-10 text-center text-muted-foreground">No users found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="mt-3 flex items-center justify-end gap-2 text-sm text-muted-foreground">
        <span>Page {page + 1} of {pages}</span>
        <Button size="icon" variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
        <Button size="icon" variant="outline" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </>
  );
}
