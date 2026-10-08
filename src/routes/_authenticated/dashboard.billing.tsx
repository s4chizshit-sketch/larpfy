import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { PlatformPlans } from "@/components/site/PlatformPlans";
import { useProfile } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard/billing")({
  component: Billing,
});

function Billing() {
  const { data } = useProfile();
  const plan = (data?.profile as any)?.plans;
  return (
    <>
      <PageHeader title="Pricing / Subscription" sub="Your current plan and available upgrades." />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current plan" value={plan?.name ?? "Free"} />
        <StatCard label="Status" value={<span className="capitalize">{data?.profile?.subscription_status ?? "free"}</span>} />
        <StatCard label="Price" value={plan ? `$${Number(plan.price)} / ${plan.billing_period}` : "$0"} />
      </div>
      <h2 className="mb-6 mt-12 text-lg font-semibold">Available plans</h2>
      <PlatformPlans />
      <p className="mt-6 text-center text-xs text-muted-foreground">Online checkout is being set up. Contact support to upgrade in the meantime.</p>
    </>
  );
}
