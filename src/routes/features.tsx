import { createFileRoute } from "@tanstack/react-router";
import { CtaBand, FeaturesGrid, HowItWorks, PlatformSection, PublicLayout } from "@/components/site/Sections";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — LARP Insight" },
      { name: "description", content: "Instagram and TikTok insight editors, audience country, engagement, graph and date customization." },
      { property: "og:title", content: "Features — LARP Insight" },
      { property: "og:description", content: "Every tool you need to customize Instagram and TikTok insight demo visuals." },
    ],
  }),
  component: () => (
    <PublicLayout>
      <FeaturesGrid />
      <PlatformSection platform="instagram" />
      <PlatformSection platform="tiktok" reverse />
      <HowItWorks />
      <CtaBand />
    </PublicLayout>
  ),
});
