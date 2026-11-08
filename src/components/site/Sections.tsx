import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, CalendarRange, Check, Globe2, Heart, Instagram, LayoutDashboard, Lock, Music2, Play, Save, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";
import { InstagramVideoShowcase } from "./InstagramVideoShowcase";
import { InstagramMark, TiktokMark, InstagramGlyph, TiktokGlyph } from "./BrandMarks";
import { TiktokVideoShowcase } from "./TiktokVideoShowcase";
import { CustomizeVideoSeries } from "./CustomizeVideoSeries";
import { TiktokCustomizeVideoSeries } from "./TiktokCustomizeVideoSeries";
import { useAuth } from "@/lib/auth";
import { DEFAULT_HERO, usePublishedVideos, useSiteContent, type FaqItem, type Hero } from "@/lib/content";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export function SectionHeading({ eyebrow, title, sub, center = true }: { eyebrow?: string; title: ReactNode; sub?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>}
      <h2 className="title-gradient mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{sub}</p>}
    </div>
  );
}

export function Masthead() {
  const { data } = useSiteContent();
  const hero: Hero = { ...DEFAULT_HERO, ...(data?.hero ?? {}) };
  const comma = hero.title.lastIndexOf(",");
  const lead = comma > 0 ? hero.title.slice(0, comma + 1) : hero.title;
  const tail = comma > 0 ? hero.title.slice(comma + 1).trim() : "";
  return (
    <section className="relative isolate overflow-hidden">
      <div className="hero-bg absolute inset-0 -z-10" aria-hidden />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
        <span className="masthead-in inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          LARPFY
        </span>
        <h1
          className="title-gradient masthead-in mt-7 font-sans text-5xl font-extrabold leading-[1.06] tracking-tight sm:text-7xl"
          style={{ animationDelay: "90ms" }}
        >
          <span className="block">{lead}</span>
          {tail && <span className="mt-2 block text-6xl sm:text-8xl">{tail}</span>}
        </h1>
        <p
          className="masthead-in mx-auto mt-8 max-w-2xl font-premium text-2xl leading-[1.4] text-foreground/80 sm:text-[30px]"
          style={{ animationDelay: "180ms" }}
        >
          {hero.description.replace(/Larp Insight/gi, "LARPFY")}
        </p>
      </div>
    </section>
  );
}

export const Disclaimer = () => (
  <p className="text-xs leading-relaxed text-muted-foreground">
    Demo visuals are for presentation, entertainment, and customization purposes only and are not official Instagram or
    TikTok analytics.
  </p>
);

const features = [
  { icon: Instagram, t: "Instagram Insight Editor", d: "Customize supported Instagram insight elements in a dedicated interface." },
  { icon: Music2, t: "TikTok Insight Editor", d: "Customize supported TikTok insight elements with a similar editing workflow." },
  { icon: Globe2, t: "Audience Country", d: "Customize displayed audience country and percentage values for demo visuals." },
  { icon: Heart, t: "Engagement Editor", d: "Customize supported engagement metrics such as views, likes, comments, shares, saves, and reach." },
  { icon: BarChart3, t: "Graph Editor", d: "Customize graph values and visual presentation." },
  { icon: LayoutDashboard, t: "Professional Dashboard", d: "Customize supported professional-dashboard-style metrics and visual elements." },
  { icon: CalendarRange, t: "Date & Time", d: "Customize supported date ranges and displayed periods." },
  { icon: Save, t: "Save Your Work", d: "Save your customized demo projects and return to them later." },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Features" title="Everything You Need to Customize Your Insights" />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div key={f.t} className="group rounded-2xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/40">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-base font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PlatformSection({ platform, reverse }: { platform: "instagram" | "tiktok"; reverse?: boolean }) {
  const ig = platform === "instagram";
  const bullets = ig
    ? ["Edit supported audience insights", "Customize country/source display", "Adjust engagement metrics", "Customize graph values", "Edit supported professional dashboard metrics", "Customize date ranges", "Save customized projects", "Export/share your customized demo visual"]
    : ["Customize audience information", "Customize country/source display", "Edit supported engagement metrics", "Customize graph values", "Customize supported dashboard metrics", "Customize date ranges", "Save projects", "Export/share customized demo visuals"];
  const titleLead = ig ? "Instagram Insight" : "TikTok Insight";
  const titleAccent = "Editor";
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className={`grid items-center gap-12 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <Reveal>
          <div>
            <span className="inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/60 px-5 py-2.5">
              {ig ? <InstagramMark /> : <TiktokMark />}
            </span>
            <h2 className="title-gradient mt-5 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {titleLead} {titleAccent}
            </h2>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-foreground/85 sm:text-xl">
              {ig ? (
                <>
                  Customize your Instagram insight visuals with an{" "}
                  <span className="font-premium italic whitespace-nowrap text-foreground/90">easy-to-use</span> editing interface.
                </>
              ) : (
                <>
                  Create customized TikTok insight demos with the same{" "}
                  <span className="font-premium italic whitespace-nowrap text-foreground/90">simple workflow</span>.
                </>
              )}
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {bullets.map((b, i) => (
                <Reveal key={b} delay={i * 80} className="bullet-reveal">
                  <li className="group flex h-full items-start gap-3.5 rounded-xl border border-border/70 bg-card/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-glow">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary/25">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] font-semibold leading-snug text-foreground/90 sm:text-base">{b}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={bullets.length * 70}>
              <div className="group relative mt-8 inline-flex">
                <div
                  className="absolute -inset-2 rounded-full opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
                  style={{ background: "var(--primary)" }}
                  aria-hidden="true"
                />
                <Link
                  to="/pricing"
                  className="btn-plan relative inline-flex h-11 w-auto items-center justify-center gap-2.5 px-7 text-xs font-bold uppercase tracking-[0.12em]"
                >
                  <span className="relative z-[2]">Get Plan</span>
                  <ArrowRight className="relative z-[2] h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
          </div>
        </Reveal>
        {ig ? (
          <div className="min-w-0 space-y-10">
            <InstagramVideoShowcase />
            <CustomizeVideoSeries />
          </div>
        ) : (
          <div className="min-w-0 space-y-10">
            <TiktokVideoShowcase />
            <TiktokCustomizeVideoSeries />
          </div>
        )}
      </div>
    </section>
  );
}

const steps = [
  ["01", "Create Account", "Create your LARPFY account in seconds."],
  ["02", "Choose Platform", "Choose Instagram or TikTok."],
  ["03", "Customize", "Edit supported insight fields, metrics, graphs, countries, and other available visual elements."],
  ["04", "Save & Showcase", "Save your customized demo and use it for presentations, content, entertainment, or showcasing."],
];
export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="How it works" title="From blank to showcase in four steps" />
      <div className="mt-12 grid gap-4 md:grid-cols-4">
        {steps.map(([n, t, d]) => (
          <div key={n} className="rounded-2xl border border-border bg-card/60 p-6">
            <span className="font-display text-3xl font-semibold text-gradient">{n}</span>
            <h3 className="mt-4 font-semibold">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PricingGrid() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Reveal>
        <div className="pricing-gate mx-auto max-w-xl rounded-[28px] p-8 text-center sm:p-10">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-foreground/5">
            <Lock className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Instagram &amp; TikTok Lifetime Access</h3>
          <p className="mx-auto mt-3 max-w-sm text-muted-foreground">
            Plan prices are shown inside your account. Sign up or log in to view them.
          </p>
          <div className="group relative mt-8 inline-flex">
            <div
              className="absolute -inset-2 rounded-full opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
              style={{ background: "var(--primary)" }}
              aria-hidden="true"
            />
            {user ? (
              <Link
                to="/dashboard/billing"
                className="btn-plan relative inline-flex h-11 w-auto items-center justify-center gap-2.5 px-7 text-xs font-bold uppercase tracking-[0.12em]"
              >
                <span className="relative z-[2]">View Pricing</span>
                <ArrowRight className="relative z-[2] h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="btn-plan relative inline-flex h-11 w-auto items-center justify-center gap-2.5 px-7 text-xs font-bold uppercase tracking-[0.12em]"
              >
                <span className="relative z-[2]">View Pricing</span>
                <ArrowRight className="relative z-[2] h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </Reveal>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl text-center">
          <DialogTitle className="font-display text-2xl font-bold">Log in to get a plan</DialogTitle>
          <p className="text-sm text-muted-foreground">
            To view and choose a plan, please create a new account or log in if you already have one.
          </p>
          <div className="mt-2 grid gap-3">
            <Button asChild size="lg" className="rounded-full bg-brand shadow-glow">
              <Link to="/signup" search={{ redirect: "billing" }}>Create new account</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link to="/login" search={{ redirect: "billing" }}>I already have an account — Log in</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function FaqList() {
  const { data, isLoading } = useSiteContent();
  const faq: FaqItem[] = data?.faq ?? [];
  if (isLoading) return <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>;
  return (
    <Accordion type="single" collapsible defaultValue="0" className="mx-auto max-w-3xl">
      {faq.map((f, i) => (
        <Reveal key={i} delay={i * 80}>
          <AccordionItem value={String(i)}>
            <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        </Reveal>
      ))}
    </Accordion>
  );
}

export function DemoVideos() {
  const { data, isLoading } = usePublishedVideos();
  const [active, setActive] = useState<null | { video: string | null; title: string }>(null);
  const [main, ...rest] = data ?? [];
  return (
    <section id="demo" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading eyebrow="Product demo" title="See LARPFY in Action" sub="Watch how a demo insight goes from default values to a finished, presentation-ready visual." />
      <div className="mt-12">
        {isLoading ? (
          <Skeleton className="aspect-video rounded-3xl" />
        ) : !main ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <p className="mt-3 font-medium">Demo videos are on the way</p>
            <p className="mt-1 text-sm text-muted-foreground">Check back soon for a full walkthrough.</p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
              {main.video ? (
                <video src={main.video} poster={main.thumb ?? undefined} controls playsInline preload="metadata" className="aspect-video w-full bg-background object-contain" />
              ) : (
                <div className="aspect-video" />
              )}
              <div className="flex flex-wrap items-center gap-3 p-5">
                <PlatformBadge p={main.platform} />
                <h3 className="font-semibold">{main.title}</h3>
                {main.description && <p className="w-full text-sm text-muted-foreground">{main.description}</p>}
              </div>
            </div>
            {rest.length > 0 && (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card/60">
                    <button className="group relative block aspect-video w-full bg-muted" onClick={() => setActive({ video: v.video, title: v.title })}>
                      {v.thumb && <img src={v.thumb} alt={v.title} loading="lazy" className="h-full w-full object-cover" />}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand shadow-glow transition-transform group-hover:scale-105"><Play className="h-5 w-5 fill-current" /></span>
                      </span>
                    </button>
                    <div className="p-5">
                      <PlatformBadge p={v.platform} />
                      <h3 className="mt-3 font-semibold">{v.title}</h3>
                      {v.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{v.description}</p>}
                      <Button size="sm" variant="secondary" className="mt-4" onClick={() => setActive({ video: v.video, title: v.title })}>
                        <Play className="h-3.5 w-3.5" /> Watch Demo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{active?.title}</DialogTitle>
          {active?.video && <video src={active.video} controls autoPlay playsInline className="aspect-video w-full rounded-lg bg-background" />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function PlatformBadge({ p }: { p: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/60 px-3 py-1">
      {p === "tiktok" ? (
        <>
          <TiktokGlyph className="h-4 w-4" />
          <span className="word-tt text-sm font-semibold leading-none">TikTok</span>
        </>
      ) : (
        <>
          <InstagramGlyph className="h-4 w-4" />
          <span className="word-ig text-lg leading-none">Instagram</span>
        </>
      )}
    </span>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-label="Platform pricing">
      <PricingGrid />
    </section>
  );
}
