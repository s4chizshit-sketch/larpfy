import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { PlatformPlans } from "@/components/site/PlatformPlans";
import { useProfile } from "@/lib/auth";
import { PlanPriceEditor } from "@/components/app/PlanPriceEditor";
import { PlanHistory } from "@/components/app/PlanHistory";
import { HowToGetPlan } from "@/components/app/HowToGetPlan";
import { ProSubscriptionCard } from "@/components/app/ProSubscription";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  head: () => ({ meta: [
    { title: "Pricing & Subscription | LARPIFY" },
    { name: "description", content: "Choose your LARPIFY plan and view subscription history and payment options." },
    { property: "og:title", content: "Pricing & Subscription | LARPIFY" },
    { property: "og:description", content: "Instagram and TikTok plans, subscription history, and automatic USDT payment." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Billing,
});

function Billing() {
  const { data } = useProfile();
  return (
    <>
      <PageHeader title="Pricing / Subscription" sub="Your current plan and available upgrades." />
      <ProSubscriptionCard />
      <HowToGetPlan />
      <PlanHistory />
      {data?.isAdmin && <PlanPriceEditor />}
      <h2 className="pro-title mb-6 mt-12 text-xl">Available plans</h2>
      <PlatformPlans />
      <p className="billing-payment-note">Pay with USDT — your plan activates automatically after payment.</p>
    </>
  );
}
