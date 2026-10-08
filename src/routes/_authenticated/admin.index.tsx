import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: UsersAdmin,
});

function UsersAdmin() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    refetchInterval: 10000,
    queryFn: async () => {
      const [{ data: users, error }, { data: plans }, { data: counts }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("plans").select("id,name"),
        supabase.from("projects").select("user_id"),
      ]);
      if (error) throw error;
      const pc: Record<string, number> = {};
      counts?.forEach((c) => (pc[c.user_id] = (pc[c.user_id] ?? 0) + 1));
      return { users: users ?? [], plans: plans ?? [], pc };
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

  const users = (data?.users ?? []).filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Users" sub="Search, review and manage accounts." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={data?.users.length ?? "—"} />
        <StatCard label="Active subscriptions" value={data?.users.filter((u) => u.subscription_status === "active").length ?? "—"} />
        <StatCard label="Signups today" value={data?.users.filter((u) => new Date(u.created_at).toDateString() === new Date().toDateString()).length ?? "—"} />
        <StatCard label="Projects" value={Object.values(data?.pc ?? {}).reduce((a, b) => a + b, 0)} />
      </div>
      <div className="relative mt-8 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow><TableHead>User</TableHead><TableHead>Signed up</TableHead><TableHead>IP</TableHead><TableHead>Country</TableHead><TableHead>Last seen</TableHead><TableHead>Projects</TableHead><TableHead>Plan</TableHead><TableHead>Subscription</TableHead><TableHead>Status</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{new Date(u.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{u.signup_ip ?? "—"}{u.last_ip && u.last_ip !== u.signup_ip && <p className="text-muted-foreground">now: {u.last_ip}</p>}</TableCell>
                  <TableCell className="text-sm">{u.signup_country ?? u.last_country ?? "—"}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{u.last_seen_at ? new Date(u.last_seen_at).toLocaleString() : "—"}</TableCell>
                  <TableCell>{data?.pc[u.id] ?? 0}</TableCell>
                  <TableCell>
                    <select className="h-8 rounded-md border border-input bg-transparent px-2 text-sm" value={u.plan_id ?? ""} onChange={(e) => update.mutate({ id: u.id, patch: { plan_id: e.target.value || null } })}>
                      <option value="">Free</option>
                      {data?.plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <select className="h-8 rounded-md border border-input bg-transparent px-2 text-sm" value={u.subscription_status} onChange={(e) => update.mutate({ id: u.id, patch: { subscription_status: e.target.value } })}>
                      {["free", "active", "past_due", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant={u.status === "active" ? "outline" : "default"} onClick={() => update.mutate({ id: u.id, patch: { status: u.status === "active" ? "suspended" : "active" } })}>
                      {u.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!users.length && <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">No users found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
}
