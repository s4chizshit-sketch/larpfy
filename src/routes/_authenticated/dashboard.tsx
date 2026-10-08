import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CreditCard, FolderKanban, Instagram, LayoutGrid, Music2, Settings } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";

const nav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/dashboard/instagram", label: "Instagram Editor", icon: Instagram },
  { to: "/dashboard/tiktok", label: "TikTok Editor", icon: Music2 },
  { to: "/dashboard/projects", label: "My Projects", icon: FolderKanban },
  { to: "/dashboard/billing", label: "Pricing / Subscription", icon: CreditCard },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LARP Insight" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AppShell nav={nav} title="Workspace">
      <Outlet />
    </AppShell>
  ),
});
