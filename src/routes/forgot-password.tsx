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
      { title: "Forgot Password — LARP Insight" },
      { name: "description", content: "Reset your LARP Insight password." },
      { property: "og:title", content: "Forgot Password — LARP Insight" },
      { property: "og:description", content: "Reset your LARP Insight password." },
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
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setLoading(false);
    if (error) return setErr(error.message);
    setSent(true);
  };
  return (
    <AuthShell title="Forgot password" sub="We'll email you a link to reset it." footer={<Link to="/login" className="text-foreground">Back to login</Link>}>
      {sent ? (
        <p className="text-sm text-muted-foreground">If an account exists for <span className="text-foreground">{email}</span>, a reset link is on its way.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" className="mt-2 h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
            <FieldError msg={err} />
          </div>
          <Button type="submit" size="lg" className="w-full bg-brand" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
