import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  component: () => (
    <>
      <PageHeader title="My Projects" sub="All your saved Instagram and TikTok demo projects." action={<NewProjectButton />} />
      <ProjectGrid />
    </>
  ),
});
