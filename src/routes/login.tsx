import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — LARP Insight" },
      { name: "description", content: "Log in to your LARP Insight account." },
      { property: "og:title", content: "Login — LARP Insight" },
      { property: "og:description", content: "Log in to your LARP Insight account." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const r = schema.safeParse(form);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(r.data);
    setLoading(false);
    if (error) return setServerError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    navigate({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Welcome back" sub="Log in with the email and password you registered with." footer={<>New here? <Link to="/signup" className="text-foreground underline-offset-4 hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" className="mt-2 h-11" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <FieldError msg={errors.email} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link>
          </div>
          <Input id="password" type="password" autoComplete="current-password" className="mt-2 h-11" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <FieldError msg={errors.password} />
        </div>
        {serverError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" className="w-full bg-brand" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Login
        </Button>
      </form>
    </AuthShell>
  );
}
