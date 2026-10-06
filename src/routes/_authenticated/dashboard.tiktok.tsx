import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";

export const Route = createFileRoute("/_authenticated/dashboard/tiktok")({
  component: () => (
    <>
      <PageHeader title="TikTok Editor" sub="Create and manage your TikTok insight demo projects." action={<NewProjectButton platform="tiktok" />} />
      <ProjectGrid platform="tiktok" />
    </>
  ),
});
