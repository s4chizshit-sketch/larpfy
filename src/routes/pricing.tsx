import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FaqList, PricingGrid, PublicLayout, SectionHeading } from "@/components/site/Sections";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — LARP Insight" },
      { name: "description", content: "Simple plans for creating customizable Instagram, TikTok and Shopify insight demos." },
      { property: "og:title", content: "Pricing — LARP Insight" },
      { property: "og:description", content: "Choose the LARP Insight plan that fits your workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  useEffect(() => {
    if (window.location.hash !== "#plans") return;
    const target = document.getElementById("plans");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  return (
    <PublicLayout>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading eyebrow="Pricing" title="Instagram, TikTok & Shopify Plans" />
          <div className="mt-14 scroll-mt-28" id="plans"><PricingGrid /></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Pricing questions" />
        <div className="mt-10"><FaqList /></div>
      </section>
    </PublicLayout>
  );
}
