import { createFileRoute } from "@tanstack/react-router";
import { ShopifySection } from "@/components/site/ShopifySection";

export const Route = createFileRoute("/_authenticated/dashboard/shopify")({
  head: () => ({ meta: [
    { title: "Shopify Dashboard Insights — LARP Insight Workspace" },
    { name: "description", content: "View Shopify dashboard and notification demo recordings in your LARP Insight workspace." },
    { property: "og:title", content: "Shopify Dashboard Insights — LARP Insight Workspace" },
    { property: "og:description", content: "Shopify dashboard and notification demo recordings in your workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ShopifyPage,
});

function ShopifyPage() {
  return <ShopifySection />;
}