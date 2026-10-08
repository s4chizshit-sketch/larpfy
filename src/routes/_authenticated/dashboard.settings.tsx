import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/app/AppShell";
import { useProfile } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import telegramLogo from "@/assets/telegram-about.png.asset.json";

const TELEGRAM_URL = "https://t.me/+HAwfutUg1gNlZDZl";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
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
    if (pw.next.length < 8 || !/[0-9]/.test(pw.next) || !/[A-Za-z]/.test(pw.next)) return toast.error("New password needs 8+ characters with a letter and a number");
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

      <section className="settings-telegram mt-6">
        <img
          src={telegramLogo.url}
          alt="Telegram logo"
          draggable={false}
          className="settings-telegram-logo"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-bold sm:text-2xl">Join Telegram Updates</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
            Get new feature drops, UI updates and early access announcements straight from the
            Larp Insight channel.
          </p>
        </div>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-plan group inline-flex h-11 shrink-0 items-center gap-2 px-7 text-xs font-bold uppercase tracking-[0.12em]"
        >
          <span className="relative z-[2]">Join Telegram</span>
          <ArrowUpRight className="relative z-[2] h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </section>
    </>
  );
}
