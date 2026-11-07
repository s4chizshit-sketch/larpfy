import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { ProSubscribersAdmin } from "@/components/app/ProSubscribersAdmin";

export const Route = createFileRoute("/_authenticated/admin/subscriptions")({
  head: () => ({ meta: [{ title: "Admin Subscriptions — LARPIFY" }, { name: "description", content: "Review confirmed LARPIFY purchases, customer details and subscription expiry." }, { property: "og:title", content: "Admin Subscriptions — LARPIFY" }, { property: "og:description", content: "Private confirmed purchase and subscription records." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
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
