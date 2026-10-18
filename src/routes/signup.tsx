import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { accountDestination } from "@/lib/account-destination";
import { SignupCelebration } from "@/components/SignupCelebration";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — LARP Insight" },
      { name: "description", content: "Create your LARP Insight account in seconds." },
      { property: "og:title", content: "Create Account — LARP Insight" },
      { property: "og:description", content: "Create your LARP Insight account in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { redirect?: "billing" } => (s.redirect === "billing" ? { redirect: "billing" } : {}),
  component: Signup,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(6, "At least 6 characters (numbers, letters or symbols like @)").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don't match" });

function Signup() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [celebrating, setCelebrating] = useState(false);
  const [pendingNav, setPendingNav] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setLoading(true);
    try {
    let ref: string | undefined;
    try {
      const saved = JSON.parse(localStorage.getItem("larp_ref") ?? "null");
      if (saved && Date.now() - saved.at < 30 * 864e5) ref = saved.code;
    } catch {}
    const { data, error } = await supabase.auth.signUp({
      email: r.data.email.trim().toLowerCase(),
      password: r.data.password,
      options: { emailRedirectTo: window.location.origin, data: { name: r.data.name, ...(ref ? { ref } : {}) } },
    });
    setLoading(false);
    if (error) return setServerError(/registered|exists/i.test(error.message) ? "An account with this email already exists. Please log in." : error.message);
    if (data.user && data.user.identities?.length === 0) return setServerError("An account with this email already exists. Please log in.");
    if (data.session && data.user) {
      const { data: roles, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      if (roleError) return setServerError("Account created. Please log in to continue.");
      return navigate({ to: accountDestination(!!roles?.some((role) => role.role === "admin"), redirect) });
    }
    setDone(true);
    } catch {
      setServerError("Connection interrupted. If your account was created, try logging in; otherwise try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <AuthShell title="Check your email" footer={<Link to="/login" className="text-foreground">Back to login</Link>}>
        <div className="flex flex-col items-center text-center">
          <MailCheck className="h-10 w-10 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            We sent a confirmation link to <span className="text-foreground">{form.email}</span>. Click it to activate your account, then log in.
          </p>
        </div>
      </AuthShell>
    );

  const field = (k: keyof typeof form, label: string, type = "text", auto?: string, placeholder?: string) => {
    const isPw = type === "password";
    const visible = !!shown[k];
    return (
      <div>
        <Label htmlFor={k} className="auth-label">
          {label}
        </Label>
        <div className="relative mt-2">
          <Input
            id={k}
            type={isPw && visible ? "text" : type}
            autoComplete={auto}
            placeholder={placeholder}
            className={`auth-field ${isPw ? "pr-12" : ""}`}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
          />
          {isPw && (
            <button
              type="button"
              onClick={() => setShown({ ...shown, [k]: !visible })}
              aria-label={visible ? "Hide password" : "Show password"}
              className="auth-eye"
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
        <FieldError msg={errors[k]} />
      </div>
    );
  };

  return (
    <AuthShell
      title="Create your account"
      sub={
        <>
          Start customizing <em>insight demos</em> in minutes.
        </>
      }
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" search={redirect ? { redirect } : {}}>
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        {field("name", "Name", "text", "name", "Your name")}
        {field("email", "Email", "email", "email", "you@email.com")}
        {field("password", "Password", "password", "new-password", "At least 6 characters")}
        {field("confirm", "Confirm Password", "password", "new-password", "Repeat your password")}
        {serverError && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" className="btn-plan mt-1 h-[50px] w-full text-sm font-semibold" disabled={loading}>
          <span className="relative z-[2] inline-flex items-center gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create Account
          </span>
        </Button>
        <p className="auth-legal">
          By continuing you agree to our <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </form>
    </AuthShell>
  );
}
