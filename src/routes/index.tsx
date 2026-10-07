import { createFileRoute } from "@tanstack/react-router";
import {
  CtaBand, FaqList, PlatformSection, PricingGrid, PublicLayout, SectionHeading,
} from "@/components/site/Sections";
import { useSiteContent } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LARP Insight — Customize Your Social Insights. Your Way." },
      { name: "description", content: "Create polished, customizable Instagram and TikTok insight demos for presentations, content, showcases, and entertainment." },
      { property: "og:title", content: "LARP Insight — Customize Your Social Insights" },
      { property: "og:description", content: "Customizable Instagram and TikTok insight demo visuals for presentations and content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useSiteContent();
  return (
    <PublicLayout>
      <PlatformSection platform="instagram" />
      <PlatformSection platform="tiktok" reverse />
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
