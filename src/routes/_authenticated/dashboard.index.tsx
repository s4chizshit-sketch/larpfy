import { createFileRoute, Link } from "@tanstack/react-router";
import { PlatformLogo, PlatformName } from "@/components/app/PlatformBrand";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";
import { useProfile } from "@/lib/auth";
import { useProjects } from "@/lib/projects";
import { ProSubscriptionCard } from "@/components/app/ProSubscription";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [
    { title: "Your Workspace — LARPFY" },
    { name: "description", content: "Your LARPFY subscription and platform workspace." },
    { property: "og:title", content: "Your Workspace — LARPFY" },
    { property: "og:description", content: "Your LARPFY subscription and platform workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Overview,
});

function Overview() {
  const { data } = useProfile();
  const { data: projects } = useProjects();
  const plan = (data?.profile as any)?.plans?.name ?? "Free";
  const status = data?.profile?.subscription_status ?? "free";
  return (
    <>
      <PageHeader title={`Welcome${data?.profile?.name ? `, ${data.profile.name.split(" ")[0]}` : ""}`} sub="Here's what's happening in your workspace." action={data?.isAdmin ? <NewProjectButton /> : undefined} />
      <div className={`grid grid-cols-2 gap-4 ${data?.isAdmin ? "lg:grid-cols-3" : ""}`}>
        <StatCard label="Current plan" value={plan} />
        <StatCard label="Subscription" value={<span className="capitalize">{status}</span>} />
        {data?.isAdmin && <StatCard label="Projects created" value={projects?.length ?? "—"} />}
      </div>
      <ProSubscriptionCard />
      <h2 className="mb-4 mt-10 text-lg font-semibold">Quick launch</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/dashboard/instagram" className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40">
          <PlatformLogo platform="instagram" className="h-11 w-11" />
          <div className="min-w-0"><p className="flex flex-wrap items-baseline gap-x-2 font-semibold"><PlatformName platform="instagram" />Editor</p><p className="text-sm text-muted-foreground">Customize Instagram insight demos</p></div>
        </Link>
        <Link to="/dashboard/tiktok" className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40">
          <PlatformLogo platform="tiktok" className="h-11 w-11" />
          <div className="min-w-0"><p className="flex flex-wrap items-baseline gap-x-2 font-semibold"><PlatformName platform="tiktok" />Editor</p><p className="text-sm text-muted-foreground">Customize TikTok insight demos</p></div>
        </Link>
        <Link to="/dashboard/shopify" className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40">
          <PlatformLogo platform="shopify" className="h-11 w-11" />
          <div className="min-w-0"><p className="flex flex-wrap items-baseline gap-x-2 font-semibold"><PlatformName platform="shopify" />Editor</p><p className="text-sm text-muted-foreground">Customize Shopify dashboard demos</p></div>
        </Link>
      </div>
      {data?.isAdmin && <><div className="mb-4 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent projects</h2>
        <Link to="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
      </div>
      <ProjectGrid limit={3} /></>}
    </>
  );
}
