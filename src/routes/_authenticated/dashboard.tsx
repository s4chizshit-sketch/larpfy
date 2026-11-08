import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { CreditCard, FolderKanban, LayoutGrid, Settings } from "lucide-react";
import { InstagramIcon, TiktokIcon, ShopifyIcon } from "@/components/app/PlatformBrand";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { useProfile } from "@/lib/auth";

const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/instagram", label: "Instagram Editor", icon: InstagramIcon },
  { to: "/dashboard/tiktok", label: "TikTok Editor", icon: TiktokIcon },
  { to: "/dashboard/shopify", label: "Shopify Editor", icon: ShopifyIcon },
  { to: "/dashboard/projects", label: "My Projects", icon: FolderKanban, adminOnly: true },
  { to: "/dashboard/billing", label: "Purchases & Access", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LARPFY" }, { name: "description", content: "Your LARPFY account, platform tools and subscriptions." }, { property: "og:title", content: "Dashboard — LARPFY" }, { property: "og:description", content: "Your LARPFY account, platform tools and subscriptions." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { data, isLoading, error } = useProfile();
  if (isLoading) return <div role="status" className="p-8 text-muted-foreground">Loading account…</div>;
  if (error) return <div role="alert" className="p-8 text-destructive">Unable to load account access. Please reload.</div>;
  if (data?.isAdmin) return <Navigate to="/admin" replace />;
  return (
    <AppShell nav={nav} title="Workspace">
      <Outlet />
    </AppShell>
  );
}
