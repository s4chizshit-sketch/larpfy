import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { PlatformPlans } from "@/components/site/PlatformPlans";
import { LifetimePurchases } from "@/components/app/LifetimePurchases";
import { PlanHistory } from "@/components/app/PlanHistory";
import { HowToGetPlan } from "@/components/app/HowToGetPlan";
import { ProSubscriptionCard } from "@/components/app/ProSubscription";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  head: () => ({ meta: [
    { title: "Pricing & Subscription | LARPFY" },
    { name: "description", content: "Buy Instagram or TikTok lifetime access and view your own keys, APKs and purchase history." },
    { property: "og:title", content: "Pricing & Subscription | LARPFY" },
    { property: "og:description", content: "Your private lifetime purchases, verified keys, APK downloads and historical subscriptions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Billing,
});

function Billing() {
  return (
    <>
      <PageHeader title="Pricing / Subscription" sub="Lifetime access and your purchase history." />
      <ProSubscriptionCard />
      <HowToGetPlan />
      <LifetimePurchases />
      <PlanHistory />
      <h2 className="pro-title mb-6 mt-12 text-xl">Available plans</h2>
      <PlatformPlans />
      <p className="billing-payment-note">Lifetime access is delivered only after payment verification.</p>
    </>
  );
}
