import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { BadgeCheck, FileText, Film, Loader2, Tags, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useProfile } from "@/lib/auth";
import { syncOxapayKey } from "@/lib/oxapay.functions";

const nav: NavItem[] = [
  { to: "/admin", label: "Users", icon: Users, exact: true },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: BadgeCheck },
  { to: "/admin/videos", label: "Demo Videos", icon: Film },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/content", label: "Website Content", icon: FileText },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — LARPIFY" }, { name: "description", content: "Manage LARPIFY accounts, payments, subscriptions and website content." }, { property: "og:title", content: "Admin — LARPIFY" }, { property: "og:description", content: "Private account and payment management for LARPIFY." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { data, isLoading } = useProfile();
  const sync = useServerFn(syncOxapayKey);
  const isAdmin = !!data?.isAdmin;
  const [paymentReady, setPaymentReady] = useState<boolean | null>(null);
  // Keeps the payment webhook verification in sync with this host's OxaPay key.
  useEffect(() => { if (isAdmin) sync().then((result) => setPaymentReady(result.ok)).catch(() => setPaymentReady(false)); }, [isAdmin, sync]);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data?.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <AppShell nav={nav} title="Admin">
      {paymentReady === false && <p role="alert" className="mb-4 text-sm text-destructive">Payment setup could not be completed. Check the merchant key and refresh this page before accepting payments.</p>}
      <Outlet />
    </AppShell>
  );
}
