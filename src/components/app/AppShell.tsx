import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, Globe, LogOut, Menu, Shield, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/auth";
import telegramLogo from "@/assets/telegram-about.png.asset.json";

const TELEGRAM_URL = "https://t.me/+HAwfutUg1gNlZDZl";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean; adminOnly?: boolean };

export function AppShell({ nav, children, title, secondary }: { nav: NavItem[]; children: ReactNode; title: string; secondary?: { title: string; nav: NavItem[] } }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useProfile();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  };

  const sidebar = (
    <div className="flex flex-col">
      <div className="flex h-16 items-center px-5 [&_img]:h-12 [&_img]:w-auto [&_img]:max-w-[180px]"><Logo to="/dashboard" /></div>
      <p className="px-5 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <nav className="space-y-0.5 px-3 pb-3">
        {nav.filter((n) => !n.adminOnly || data?.isAdmin).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            activeOptions={{ exact: !!n.exact }}
            className="side-link"
            activeProps={{ className: "is-active" }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
        {secondary && (
          <>
            <p className="px-2 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{secondary.title}</p>
            {secondary.nav.filter((n) => !n.adminOnly || data?.isAdmin).map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: !!n.exact }}
                className="side-link"
                activeProps={{ className: "is-active" }}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            ))}
          </>
        )}
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(false)}
          className="side-telegram mt-4"
        >
          <img src={telegramLogo.url} alt="Telegram logo" draggable={false} className="side-telegram-logo" />
          <span className="min-w-0 flex-1">
            <span className="side-telegram-title">Telegram Updates</span>
            <span className="side-telegram-sub">New feature drops and UI updates.</span>
          </span>
          <ArrowUpRight className="side-telegram-arrow h-4 w-4 shrink-0" />
        </a>
        <Link to="/" onClick={() => setOpen(false)} className="mt-2 flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">
          <Globe className="h-4 w-4 text-primary" /> View website
        </Link>
        {data?.isAdmin && title !== "Admin" && (
          <Link
            to="/admin"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Shield className="h-4 w-4 text-primary" /> Admin panel
          </Link>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <div className="px-3 pb-2 text-xs">
          <p className="truncate font-medium">{data?.profile?.name ?? "—"}</p>
          <p className="truncate text-muted-foreground">{data?.profile?.email}</p>
        </div>
        <Button variant="outline" onClick={signOut} className="h-10 w-full justify-start gap-3 border-destructive/30 bg-destructive/10 px-3 text-destructive hover:border-destructive/50 hover:bg-destructive/20 hover:text-destructive">
          <LogOut className="h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 hidden max-h-dvh self-start overflow-y-auto rounded-b-xl border-b border-r border-sidebar-border bg-sidebar lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 max-h-dvh w-72 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-br-xl border-b border-r border-sidebar-border bg-sidebar">
            <Button variant="ghost" size="icon" className="absolute right-3 top-3" onClick={() => setOpen(false)} aria-label="Close menu"><X className="h-5 w-5" /></Button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
          <Button variant="outline" size="icon" onClick={() => setOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></Button>
          <div className="[&_img]:h-12 [&_img]:w-auto [&_img]:max-w-[180px]"><Logo to="/dashboard" /></div>
        </header>
        {data?.profile?.status === "suspended" && (
          <div className="bg-destructive/15 px-6 py-3 text-sm text-destructive">Your account is suspended. You can view your work but can't save changes. Contact support for help.</div>
        )}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="pro-title text-3xl sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-[15px] text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="pro-panel p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="pro-title mt-2 text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub, action }: { icon: LucideIcon; title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <Icon className="h-8 w-8 text-primary" />
      <p className="mt-3 font-medium">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{sub}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
