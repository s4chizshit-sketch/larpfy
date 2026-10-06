import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — LARP Insight" },
      { name: "description", content: "Choose a new password for your LARP Insight account." },
      { property: "og:title", content: "Reset Password — LARP Insight" },
      { property: "og:description", content: "Choose a new password for your LARP Insight account." },
    ],
  }),
  component: Reset,
});

function Reset() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8 || !/[0-9]/.test(pw) || !/[A-Za-z]/.test(pw)) return setErr("At least 8 characters with a letter and a number");
    if (pw !== confirm) return setErr("Passwords don't match");
    setErr("");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (error) return setErr(error.message.includes("session") ? "This reset link is invalid or expired. Request a new one." : error.message);
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };
  return (
    <AuthShell title="Set a new password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" autoComplete="new-password" className="mt-2 h-11" value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c">Confirm password</Label>
          <Input id="c" type="password" autoComplete="new-password" className="mt-2 h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          <FieldError msg={err} />
        </div>
        <Button type="submit" size="lg" className="w-full bg-brand" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
        </Button>
      </form>
    </AuthShell>
  );
}
