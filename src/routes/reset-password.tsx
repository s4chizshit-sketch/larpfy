import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — LARPIFY" },
      { name: "description", content: "Choose a new password for your LARPIFY account." },
      { property: "og:title", content: "Reset Password — LARPIFY" },
      { property: "og:description", content: "Choose a new password for your LARPIFY account." },
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
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 6 || pw.length > 72) return setErr("At least 6 characters — numbers, letters or symbols");
    if (pw !== confirm) return setErr("Passwords don't match");
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) return setErr(error.message.includes("session") ? "This reset link is invalid or expired. Request a new one." : error.message);
      toast.success("Password updated");
      navigate({ to: "/dashboard" });
    } catch {
      setErr("Connection interrupted. Please try again.");
    } finally { setLoading(false); }
  };

  const pwField = (k: "pw" | "c", id: string, label: string, value: string, set: (v: string) => void, auto: string, placeholder: string) => {
    const visible = !!shown[k];
    return (
      <div>
        <Label htmlFor={id} className="auth-label">
          {label}
        </Label>
        <div className="relative mt-2">
          <Input
            id={id}
            type={visible ? "text" : "password"}
            autoComplete={auto}
            placeholder={placeholder}
            className="auth-field pr-12"
            value={value}
            onChange={(e) => set(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShown({ ...shown, [k]: !visible })}
            aria-label={visible ? "Hide password" : "Show password"}
            className="auth-eye"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AuthShell
      title="Set a new password"
      sub={
        <>
          Choose a <em>fresh password</em> for your account.
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {pwField("pw", "pw", "New password", pw, setPw, "new-password", "At least 6 characters")}
        <div>
          {pwField("c", "c", "Confirm password", confirm, setConfirm, "new-password", "Repeat your password")}
          <FieldError msg={err} />
        </div>
        <Button type="submit" size="lg" className="btn-plan mt-1 h-[50px] w-full text-sm font-semibold" disabled={loading}>
          <span className="relative z-[2] inline-flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </span>
        </Button>
      </form>
    </AuthShell>
  );
}
