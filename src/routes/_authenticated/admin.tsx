import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { CreditCard, LayoutGrid, Settings, FileText, Film, Loader2, Tags, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useProfile } from "@/lib/auth";
import { syncOxapayKey } from "@/lib/oxapay.functions";

const nav: NavItem[] = [
  { to: "/admin", label: "Users", icon: Users, exact: true },
  { to: "/admin/videos", label: "Demo Videos", icon: Film },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/content", label: "Website Content", icon: FileText },
];

const workspace: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/billing", label: "Pricing / Subscription", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — LARP Insight" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { data, isLoading } = useProfile();
  const sync = useServerFn(syncOxapayKey);
  const isAdmin = !!data?.isAdmin;
  // Keeps the payment webhook verification in sync with this host's OxaPay key.
  useEffect(() => { if (isAdmin) sync().catch(() => {}); }, [isAdmin, sync]);
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data?.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <AppShell nav={nav} title="Admin" secondary={{ title: "Workspace", nav: workspace }}>
      <Outlet />
    </AppShell>
  );
}
