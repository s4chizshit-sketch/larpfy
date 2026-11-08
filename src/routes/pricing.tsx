import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FaqList, PublicLayout, SectionHeading } from "@/components/site/Sections";
import { PlatformPlans } from "@/components/site/PlatformPlans";

export const Route = createFileRoute("/pricing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Pricing — LARPFY" },
      { name: "description", content: "Instagram Editor and TikTok Editor lifetime access for $25 each, with no expiry." },
      { property: "og:title", content: "Pricing — LARPFY" },
      { property: "og:description", content: "Choose the LARPFY plan that fits your workflow." },
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
          <SectionHeading eyebrow="Pricing" title="Instagram & TikTok Lifetime Access" />
          <nav className="mt-6 flex flex-wrap justify-center gap-6 text-sm text-primary"><Link to="/instagram" className="underline">Instagram Editor details</Link><Link to="/tiktok" className="underline">TikTok Editor details</Link></nav>
          <div className="mt-14 scroll-mt-28" id="plans"><PlatformPlans /></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading title="Pricing questions" />
        <div className="mt-10"><FaqList /></div>
      </section>
    </PublicLayout>
  );
}
