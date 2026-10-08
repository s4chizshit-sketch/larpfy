import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Music2 } from "lucide-react";
import { PageHeader, StatCard } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";
import { useProfile } from "@/lib/auth";
import { useProjects } from "@/lib/projects";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [
    { title: "Your Workspace — LARP Insight" },
    { name: "description", content: "Your LARP Insight subscription and platform workspace." },
    { property: "og:title", content: "Your Workspace — LARP Insight" },
    { property: "og:description", content: "Your LARP Insight subscription and platform workspace." },
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
      <h2 className="mb-4 mt-10 text-lg font-semibold">Quick launch</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/dashboard/instagram" className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary"><Instagram className="h-5 w-5" /></span>
          <div><p className="font-semibold">Instagram Editor</p><p className="text-sm text-muted-foreground">Customize Instagram insight demos</p></div>
        </Link>
        <Link to="/dashboard/tiktok" className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 hover:border-primary/40">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary"><Music2 className="h-5 w-5" /></span>
          <div><p className="font-semibold">TikTok Editor</p><p className="text-sm text-muted-foreground">Customize TikTok insight demos</p></div>
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
