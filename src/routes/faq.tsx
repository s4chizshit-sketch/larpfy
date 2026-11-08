import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand, FaqList, PublicLayout, SectionHeading } from "@/components/site/Sections";

export const Route = createFileRoute("/faq")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "FAQ — LARPFY" },
      { name: "description", content: "Answers about LARPFY, customization, saving projects, and platform affiliation." },
      { property: "og:title", content: "FAQ — LARPFY" },
      { property: "og:description", content: "Frequently asked questions about LARPFY." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionHeading eyebrow="FAQ" title="What people ask us" />
        </Reveal>
        <div className="mt-12"><FaqList /></div>
      </section>
      <CtaBand />
    </PublicLayout>
  ),
});
