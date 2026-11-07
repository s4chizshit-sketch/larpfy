import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — LARPIFY" },
      { name: "description", content: "Reset your LARPIFY password." },
      { property: "og:title", content: "Forgot Password — LARPIFY" },
      { property: "og:description", content: "Reset your LARPIFY password." },
    ],
  }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!z.string().email().safeParse(email.trim()).success) return setErr("Enter a valid email");
    setErr("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/reset-password` });
      if (error) return setErr(error.message);
      setSent(true);
    } catch {
      setErr("Connection interrupted. Please try again.");
    } finally { setLoading(false); }
  };
  return (
    <AuthShell
      title="Forgot password"
      sub={
        <>
          We'll email you a <em>link to reset</em> it.
        </>
      }
      footer={
        <Link to="/login">Back to login</Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="text-foreground">{email}</span>, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-5" noValidate>
          <div>
            <Label htmlFor="email" className="auth-label">
              Email
            </Label>
            <div className="relative mt-2">
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                className="auth-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <FieldError msg={err} />
          </div>
          <Button type="submit" size="lg" className="btn-plan mt-1 h-[50px] w-full text-sm font-semibold" disabled={loading}>
            <span className="relative z-[2] inline-flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
            </span>
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
