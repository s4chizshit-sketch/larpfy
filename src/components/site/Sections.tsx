import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ArrowRight, BarChart3, CalendarRange, Check, Globe2, Heart, Instagram, LayoutDashboard, Music2, Play, Save, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Reveal } from "./Reveal";
import { InstagramVideoShowcase } from "./InstagramVideoShowcase";
import { TiktokVideoShowcase } from "./TiktokVideoShowcase";
import { CustomizeVideoSeries } from "./CustomizeVideoSeries";
import { TiktokCustomizeVideoSeries } from "./TiktokCustomizeVideoSeries";
import { DEFAULT_HERO, usePlans, usePublishedVideos, useSiteContent, type FaqItem, type Hero } from "@/lib/content";

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
      <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2>
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
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-brand opacity-70" aria-hidden />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">
        <span className="masthead-in inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Larp Insight
        </span>
        <h1
          className="masthead-in mt-7 font-display text-4xl font-semibold leading-[1.06] sm:text-6xl"
          style={{ animationDelay: "90ms" }}
        >
          <span className="block">{lead}</span>
          {tail && (
            <span className="mt-2 block font-premium text-5xl font-normal italic leading-[1.02] text-gradient sm:text-7xl">
              {tail}
            </span>
          )}
        </h1>
        <p
          className="masthead-in mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "180ms" }}
        >
          {hero.description}
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
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur-sm">
              {ig ? <Instagram className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />} {ig ? "Instagram" : "TikTok"}
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl">
              {titleLead}{" "}
              <span className="font-premium font-normal italic text-gradient">{titleAccent}</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {ig ? (
                <>
                  Customize your Instagram insight visuals with an{" "}
                  <span className="font-premium italic text-foreground/90">easy-to-use</span> editing interface.
                </>
              ) : (
                "Create customized TikTok insight demos with the same simple workflow."
              )}
            </p>
            <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {bullets.map((b, i) => (
                <Reveal key={b} delay={i * 70}>
                  <li className="group flex h-full items-start gap-3 rounded-xl border border-border/70 bg-card/40 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-glow">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary transition-colors duration-300 group-hover:bg-primary/25">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-[13px] font-medium leading-snug text-foreground/90">{b}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={bullets.length * 70}>
              <div className="group relative mt-9 inline-block">
                <div className="absolute -inset-1.5 rounded-2xl bg-brand opacity-35 blur-xl transition-opacity duration-300 group-hover:opacity-60" aria-hidden="true" />
                <Button asChild size="lg" className="relative bg-brand shadow-glow transition-transform duration-200 hover:scale-[1.02]">
                  <Link to={ig ? "/dashboard/instagram" : "/dashboard/tiktok"}>Try {ig ? "Instagram" : "TikTok"} Editor</Link>
                </Button>
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
  ["01", "Create Account", "Create your LARP Insight account in seconds."],
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
  const { data, isLoading, error } = usePlans();
  if (isLoading)
    return <div className="grid gap-5 md:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-[420px] rounded-3xl" />)}</div>;
  if (error) return <p className="text-center text-destructive">Couldn't load pricing. Please refresh.</p>;
  if (!data?.length) return <p className="text-center text-muted-foreground">Plans are coming soon.</p>;
  return (
    <div className={`mx-auto grid gap-5 ${data.length === 1 ? "max-w-md" : data.length === 2 ? "max-w-3xl md:grid-cols-2" : "md:grid-cols-3"}`}>
      {data.map((p) => (
        <div key={p.id} className={`relative flex flex-col rounded-3xl border p-7 ${p.popular ? "border-primary/60 bg-card shadow-glow" : "border-border bg-card/60"}`}>
          {p.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">Most popular</span>
          )}
          <h3 className="text-lg font-semibold">{p.name}</h3>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-5xl font-semibold">${Number(p.price)}</span>
            <span className="text-sm text-muted-foreground">/ {p.billing_period}</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {p.features.map((f) => (
              <li key={f} className="flex gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
          <Button asChild size="lg" className={`mt-8 ${p.popular ? "bg-brand" : ""}`} variant={p.popular ? "default" : "secondary"}>
            <Link to="/signup">{p.cta}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}

export function FaqList() {
  const { data, isLoading } = useSiteContent();
  const faq: FaqItem[] = data?.faq ?? [];
  if (isLoading) return <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>;
  return (
    <Accordion type="single" collapsible defaultValue="0" className="mx-auto max-w-3xl">
      {faq.map((f, i) => (
        <AccordionItem key={i} value={String(i)}>
          <AccordionTrigger className="text-left text-base">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
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
      <SectionHeading eyebrow="Product demo" title="See LARP Insight in Action" sub="Watch how a demo insight goes from default values to a finished, presentation-ready visual." />
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-accent/60 px-2.5 py-0.5 text-[11px] font-medium">
      {p === "tiktok" ? <Music2 className="h-3 w-3" /> : <Instagram className="h-3 w-3" />}
      {p === "tiktok" ? "TikTok" : "Instagram"}
    </span>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-10 text-center sm:p-16">
        <div className="hero-bg absolute inset-0" />
        <div className="relative">
          <h2 className="text-3xl font-semibold sm:text-4xl">Build your first demo insight today</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Create an account, pick a platform, and start customizing in minutes.</p>
          <Button asChild size="lg" className="mt-8 bg-brand shadow-glow"><Link to="/signup">Get Started</Link></Button>
        </div>
      </div>
    </section>
  );
}
