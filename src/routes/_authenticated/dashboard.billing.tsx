import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { PlatformPlans } from "@/components/site/PlatformPlans";
import { useProfile } from "@/lib/auth";
import { PlanPriceEditor } from "@/components/app/PlanPriceEditor";
import { PlanHistory } from "@/components/app/PlanHistory";
import { HowToGetPlan } from "@/components/app/HowToGetPlan";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: Billing,
});

function Billing() {
  const { data } = useProfile();
  return (
    <>
      <PageHeader title="Pricing / Subscription" sub="Your current plan and available upgrades." />
      <HowToGetPlan />
      <PlanHistory />
      {data?.isAdmin && <PlanPriceEditor />}
      <h2 className="pro-title mb-6 mt-12 text-xl">Available plans</h2>
      <PlatformPlans />
      <p className="mt-6 text-center text-xs text-muted-foreground">UPI payments are available now. USD checkout is coming soon.</p>
    </>
  );
}
