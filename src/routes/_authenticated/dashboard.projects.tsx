import { createFileRoute, Navigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";
import { useProfile } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "My Projects — LARPFY" },
    { name: "description", content: "Manage saved LARPFY demo projects." },
    { property: "og:title", content: "My Projects — LARPFY" },
    { property: "og:description", content: "Manage saved LARPFY demo projects." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Projects,
});

function Projects() {
  const { data, isPending } = useProfile();
  if (isPending) return null;
  if (!data?.isAdmin) return <Navigate to="/dashboard" replace />;
  return (
    <>
      <PageHeader title="My Projects" sub="All your saved Instagram and TikTok demo projects." action={<NewProjectButton />} />
      <ProjectGrid />
    </>
  );
}
