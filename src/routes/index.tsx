import { createFileRoute } from "@tanstack/react-router";
import {
  CtaBand, FaqList, Masthead, PlatformSection, PublicLayout, SectionHeading,
} from "@/components/site/Sections";
import { useSiteContent } from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Larp Insight — Your Social Analytics, Your Way" },
      { name: "description", content: "Powerful tools by Larp Insight to customize, manage, and transform your social media insights." },
      { property: "og:title", content: "Larp Insight — Your Social Analytics, Your Way" },
      { property: "og:description", content: "Powerful tools by Larp Insight to customize, manage, and transform your social media insights." },
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
