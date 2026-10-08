import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { useAuth, useProfile } from "@/lib/auth";
import { useSiteContent } from "@/lib/content";

const links = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing", hash: "plans" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: prof } = useProfile();
  const isAdmin = !!prof?.isAdmin;
  const { data } = useSiteContent();
  const ann = data?.announcement;
  return (
    <header className="sticky top-0 z-50">
      {ann?.enabled && ann?.text && (
        <div className="bg-brand px-4 py-2 text-center text-xs font-medium text-primary-foreground">{ann.text}</div>
      )}
      <div className="px-3 pt-3 sm:px-4">
        <div className="nav-shell mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full px-4 sm:px-6">
          <Logo />
          <span className="nav-brand-text lg:hidden">
            <span className="nav-brand-dot" />
            Larp Insight
          </span>
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                hash={"hash" in l ? l.hash : undefined}
                className="nav-link rounded-lg px-3.5 py-2"
                activeProps={{ className: "is-active" }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" className="nav-link rounded-lg px-3.5 py-2" activeProps={{ className: "is-active" }}>
                Admin
              </Link>
            )}
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {user ? (
              <Button asChild className="rounded-full bg-brand shadow-glow">
                <Link to="/dashboard" className="gap-2">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="rounded-full bg-brand shadow-glow">
                  <Link to="/signup" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
          <Button variant="outline" size="icon"
            className="h-11 w-11 shrink-0 rounded-full border-border/70 bg-foreground/5 transition-colors hover:bg-foreground/10 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
        {open && (
          <div className="nav-shell mx-auto mt-2 max-w-7xl rounded-[1.75rem] px-4 pb-6 pt-2 lg:hidden">
            {links.map((l) => (
              <Link key={l.to} to={l.to} hash={"hash" in l ? l.hash : undefined} onClick={() => setOpen(false)} className="block border-b border-border/60 py-4 text-[17px] font-medium tracking-[-0.01em]">
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block border-b border-border/60 py-4 text-[17px] font-medium tracking-[-0.01em]">
                Admin
              </Link>
            )}
            <div className="mt-5 grid gap-3">
              {user ? (
                <Button asChild size="lg" className="rounded-full bg-brand">
                  <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" variant="outline" className="rounded-full">
                    <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild size="lg" className="rounded-full bg-brand">
                    <Link to="/signup" onClick={() => setOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
