import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout, SectionHeading } from "@/components/site/Sections";
import { PlatformPlans } from "@/components/site/PlatformPlans";
export const Route = createFileRoute("/instagram")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Instagram Editor Lifetime — LARPFY" },
    { name: "description", content: "Instagram Editor lifetime access for $25, with a matching APK and private product key after verified payment." },
    { property: "og:title", content: "Instagram Editor Lifetime — LARPFY" },
    { property: "og:description", content: "Watch the Instagram demo and choose lifetime access; shorter plans are available separately from the Telegram bot." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <PublicLayout><section className="hero-bg"><div className="mx-auto max-w-4xl px-4 py-20 sm:px-6"><SectionHeading title="Instagram Editor" eyebrow="Lifetime access" /><div className="mt-10"><PlatformPlans product="instagram" /></div></div></section></PublicLayout>,
});