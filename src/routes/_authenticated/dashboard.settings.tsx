import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app/AppShell";
import { useProfile } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  head: () => ({ meta: [{ title: "Account Settings — LARPFY" }, { name: "description", content: "Manage your private LARPFY account settings." }, { property: "og:title", content: "Account Settings — LARPFY" }, { property: "og:description", content: "Your LARPFY profile and account settings." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Settings,
});

function Settings() {
  const { data } = useProfile();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  useEffect(() => setName(data?.profile?.name ?? ""), [data]);

  const saveName = async () => {
    if (name.trim().length < 2) return toast.error("Name is too short");
    const { error } = await supabase.rpc("update_my_name", { _name: name.trim() });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated");
  };
  const changePw = async () => {
    if (pw.next.length < 6 || pw.next.length > 72) return toast.error("New password needs at least 6 characters");
    const { error } = await supabase.auth.updateUser({ password: pw.next, current_password: pw.current } as any);
    if (error) return toast.error(error.message);
    setPw({ current: "", next: "" });
    toast.success("Password changed");
  };

  return (
    <>
      <PageHeader title="Settings" sub="Manage your account." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Profile</h2>
          <div className="mt-5 space-y-4">
            <div><Label>Name</Label><Input className="mt-2" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Email</Label><Input className="mt-2" value={data?.profile?.email ?? ""} disabled /></div>
            <Button className="bg-brand" onClick={saveName}>Save changes</Button>
          </div>
        </section>
        <section className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="font-semibold">Change password</h2>
          <div className="mt-5 space-y-4">
            <div><Label>Current password</Label><Input type="password" className="mt-2" autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
            <div><Label>New password</Label><Input type="password" className="mt-2" autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></div>
            <Button variant="secondary" onClick={changePw}>Update password</Button>
          </div>
        </section>
      </div>
    </>
  );
}
