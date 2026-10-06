import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CtaBand, DemoVideos, Disclaimer, FaqList, FeaturesGrid, HowItWorks, PlatformSection, PricingGrid, PublicLayout, SectionHeading,
} from "@/components/site/Sections";
import { InsightPreview } from "@/components/InsightPreview";
import { defaultInsight } from "@/lib/insight";
import { DEFAULT_HERO, useSiteContent } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LARP Insight — Customize Your Social Insights. Your Way." },
      { name: "description", content: "Create polished, customizable Instagram and TikTok insight demos for presentations, content, showcases, and entertainment." },
      { property: "og:title", content: "LARP Insight — Customize Your Social Insights" },
      { property: "og:description", content: "Customizable Instagram and TikTok insight demo visuals for presentations and content." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useSiteContent();
  const hero = { ...DEFAULT_HERO, ...(data?.hero ?? {}) };
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <div className="hero-bg absolute inset-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Instagram & TikTok insight demo editor
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-6xl">{hero.title}</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground lg:mx-0">{hero.description}</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="h-12 bg-brand px-7 shadow-glow">
                <Link to="/signup">{hero.cta}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-7">
                <a href="#demo"><Play className="h-4 w-4" /> Watch Demo</a>
              </Button>
            </div>
            <div className="mx-auto mt-8 max-w-md lg:mx-0"><Disclaimer /></div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[3rem] bg-brand opacity-20 blur-3xl" />
            <div className="relative flex items-end justify-center gap-4">
              <div className="hidden w-[46%] translate-y-8 opacity-80 sm:block"><InsightPreview compact platform="tiktok" data={defaultInsight("tiktok")} /></div>
              <div className="w-full max-w-[340px] sm:w-[58%]"><InsightPreview platform="instagram" data={defaultInsight("instagram")} /></div>
            </div>
          </div>
        </div>
      </section>

      <DemoVideos />
      <FeaturesGrid />
      <PlatformSection platform="instagram" />
      <PlatformSection platform="tiktok" reverse />
      <HowItWorks />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Pricing" title="Simple plans, everything included" />
        <div className="mt-12"><PricingGrid /></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading eyebrow="Questions" title="What people ask us" />
        <div className="mt-10"><FaqList /></div>
      </section>
      <CtaBand />
    </PublicLayout>
  );
}
