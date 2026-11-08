import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import {
  CtaBand, FaqList, Masthead, PlatformSection, PublicLayout, SectionHeading,
} from "@/components/site/Sections";
import { useSiteContent } from "@/lib/content";
import { ShopifySection } from "@/components/site/ShopifySection";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "LARPFY — Your Social Analytics, Your Way" },
      { name: "description", content: "Powerful tools by LARPFY to customize, manage, and transform your social media insights." },
      { property: "og:title", content: "LARPFY — Your Social Analytics, Your Way" },
      { property: "og:description", content: "Powerful tools by LARPFY to customize, manage, and transform your social media insights." },
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
      <Masthead />
      <PlatformSection platform="instagram" />
      <PlatformSection platform="tiktok" reverse />
      <ShopifySection />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="Questions" title="What people ask us" />
        </Reveal>
        <div className="mt-10"><FaqList /></div>
      </section>
      <CtaBand />
    </PublicLayout>
  );
}
