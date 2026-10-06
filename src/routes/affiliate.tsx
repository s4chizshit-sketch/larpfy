import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeDollarSign, Link2, MousePointerClick, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout, SectionHeading } from "@/components/site/Sections";
import { useSiteContent } from "@/lib/content";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/affiliate")({
  head: () => ({
    meta: [
      { title: "Affiliate Program — Earn With LARP Insight" },
      { name: "description", content: "Share your referral link and earn recurring commission on every paid LARP Insight customer." },
      { property: "og:title", content: "Earn With LARP Insight" },
      { property: "og:description", content: "Join the LARP Insight affiliate program and earn commission on paid referrals." },
    ],
  }),
  component: AffiliatePage,
});

function AffiliatePage() {
  const { data } = useSiteContent();
  const { user } = useAuth();
  const pct = data?.affiliate?.commission_percent ?? 20;
  const min = data?.affiliate?.min_payout ?? 50;
  const items = [
    { icon: Link2, t: "Your own referral link", d: "Get a unique link from your dashboard in one click. No approval needed." },
    { icon: MousePointerClick, t: "Click & signup tracking", d: "Every click and signup through your link is tracked in real time." },
    { icon: BadgeDollarSign, t: `${pct}% commission`, d: "Earn commission on every referred customer who upgrades to a paid plan." },
    { icon: Wallet, t: "Simple payouts", d: `Request a payout from your dashboard once you reach $${min}.` },
  ];
  return (
    <PublicLayout>
      <section className="hero-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Affiliate program</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Earn With LARP Insight</h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Share LARP Insight with your audience and earn {pct}% commission on every paid customer you refer.
            </p>
            <Button asChild size="lg" className="mt-8 bg-brand shadow-glow">
              <Link to={user ? "/dashboard/affiliate" : "/signup"}>{user ? "Open affiliate dashboard" : "Become an affiliate"}</Link>
            </Button>
          </div>
          <div className="rounded-3xl border border-border glass p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your dashboard at a glance</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {["Total clicks", "Signups", "Paid customers", "Commission earned", "Pending", "Paid out"].map((k) => (
                <div key={k} className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-[11px] text-muted-foreground">{k}</p>
                  <div className="mt-2 h-5 w-12 rounded bg-muted" />
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Your real numbers appear here once you join.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading title="How the program works" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i) => (
            <div key={i.t} className="rounded-2xl border border-border bg-card/60 p-6">
              <i.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{i.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{i.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <UserPlus className="h-4 w-4" /> Last-click attribution · 30-day referral window
        </div>
      </section>
    </PublicLayout>
  );
}
