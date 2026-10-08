import { createFileRoute } from "@tanstack/react-router";
import { FaqList, PricingGrid, PublicLayout, SectionHeading } from "@/components/site/Sections";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — LARP Insight" },
      { name: "description", content: "Simple plans for creating customizable Instagram and TikTok insight demos." },
      { property: "og:title", content: "Pricing — LARP Insight" },
      { property: "og:description", content: "Choose the LARP Insight plan that fits your workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PublicLayout>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Pricing" title="Instagram & TikTok Plans" />
          <div className="mt-14"><PricingGrid /></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Pricing questions" />
        <div className="mt-10"><FaqList /></div>
      </section>
    </PublicLayout>
  ),
});
