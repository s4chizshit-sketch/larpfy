import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";
import { CtaBand, FaqList, PublicLayout, SectionHeading } from "@/components/site/Sections";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — LARP Insight" },
      { name: "description", content: "Answers about LARP Insight, customization, saving projects, and platform affiliation." },
      { property: "og:title", content: "FAQ — LARP Insight" },
      { property: "og:description", content: "Frequently asked questions about LARP Insight." },
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
