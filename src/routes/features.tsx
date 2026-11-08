import { createFileRoute } from "@tanstack/react-router";
import { CtaBand, HowItWorks, PlatformSection, PublicLayout } from "@/components/site/Sections";

export const Route = createFileRoute("/features")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Features — LARPFY" },
      { name: "description", content: "Instagram and TikTok insight editors, audience country, engagement, graph and date customization." },
      { property: "og:title", content: "Features — LARPFY" },
      { property: "og:description", content: "Every tool you need to customize Instagram and TikTok insight demo visuals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PublicLayout>
      <PlatformSection platform="instagram" />
      <PlatformSection platform="tiktok" reverse />
      <HowItWorks />
      <CtaBand />
    </PublicLayout>
  ),
});
