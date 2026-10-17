import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { ProSubscribersAdmin } from "@/components/app/ProSubscribersAdmin";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({
  head: () => ({ meta: [{ title: "Admin Subscriptions — LARP Insight" }, { name: "robots", content: "noindex" }] }),
  component: SubscriptionsAdmin,
});

function SubscriptionsAdmin() {
  return (
    <>
      <PageHeader title="Subscriptions" />
      <ProSubscribersAdmin />
    </>
  );
}
