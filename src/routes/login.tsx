import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { accountDestination } from "@/lib/account-destination";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — LARP Insight" },
      { name: "description", content: "Log in to your LARP Insight account." },
      { property: "og:title", content: "Login — LARP Insight" },
      { property: "og:description", content: "Log in to your LARP Insight account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { redirect?: "billing" } => (s.redirect === "billing" ? { redirect: "billing" } : {}),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function Login() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const r = schema.safeParse(form);
    if (!r.success) return setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
    setErrors({});
    setLoading(true);
    try {
      const creds = { email: r.data.email.toLowerCase(), password: r.data.password };
      let { data: signIn, error } = await supabase.auth.signInWithPassword(creds);
      if (error && /fetch|network/i.test(error.message)) ({ data: signIn, error } = await supabase.auth.signInWithPassword(creds));
      if (error || !signIn.user) {
        setLoading(false);
        const m = error?.message ?? "";
        return setServerError(/invalid login/i.test(m) ? "Incorrect email or password." : /fetch|network/i.test(m) ? "Network issue — please check your connection and try again." : m || "Login failed, please try again.");
      }
      const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", signIn.user.id);
      if (roleError) {
        setLoading(false);
        return setServerError("Unable to load your account access. Please try again.");
      }
      navigate({ to: accountDestination(!!roles?.some((x) => x.role === "admin"), redirect) });
    } catch {
      setLoading(false);
      setServerError("Network issue — please check your connection and try again.");
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      sub={
        <>
          Log in with the <em>email and password</em> you registered with.
        </>
      }
      footer={
        <>
          New here?{" "}
          <Link to="/signup" search={redirect ? { redirect } : {}}>
            Create an account
          </Link>
        </>
      }
    >
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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <FieldError msg={errors.email} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="auth-label">
              Password
            </Label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-2">
            <Input
              id="password"
              type={shown ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Your password"
              className="auth-field pr-12"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShown(!shown)}
              aria-label={shown ? "Hide password" : "Show password"}
              className="auth-eye"
            >
              {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError msg={errors.password} />
        </div>
        {serverError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" className="btn-plan mt-1 h-[50px] w-full text-sm font-semibold" disabled={loading}>
          <span className="relative z-[2] inline-flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Login
          </span>
        </Button>
      </form>
    </AuthShell>
  );
}
