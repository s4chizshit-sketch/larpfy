import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PublicLayout, SectionHeading } from "@/components/site/Sections";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — LARPIFY" },
      { name: "description", content: "Get in touch with the LARPIFY team." },
      { property: "og:title", content: "Contact — LARPIFY" },
      { property: "og:description", content: "Get in touch with the LARPIFY team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PublicLayout>
      <section className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <SectionHeading eyebrow="Contact" title="We're here to help" sub="Questions about your account, billing or the affiliate program? Send us an email." />
        <a href="mailto:support@larpinsight.com" className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-6 py-4 font-medium hover:border-primary/50">
          <Mail className="h-5 w-5 text-primary" /> support@larpinsight.com
        </a>
      </section>
    </PublicLayout>
  ),
});
