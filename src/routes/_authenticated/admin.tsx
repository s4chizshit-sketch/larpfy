import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BadgeDollarSign, FileText, Film, Loader2, ShieldAlert, Tags, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app/AppShell";
import { useProfile } from "@/lib/auth";

const nav: NavItem[] = [
  { to: "/admin", label: "Users", icon: Users, exact: true },
  { to: "/admin/videos", label: "Demo Videos", icon: Film },
  { to: "/admin/pricing", label: "Pricing", icon: Tags },
  { to: "/admin/affiliate", label: "Affiliate", icon: BadgeDollarSign },
  { to: "/admin/content", label: "Website Content", icon: FileText },
];

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — LARP Insight" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { data, isLoading } = useProfile();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!data?.isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <ShieldAlert className="h-10 w-10 text-destructive" />
        <h1 className="text-xl font-semibold">Admins only</h1>
        <Link to="/dashboard" className="text-sm text-primary">Back to dashboard</Link>
      </div>
    );
  return (
    <AppShell nav={nav} title="Admin">
      <Outlet />
    </AppShell>
  );
}
