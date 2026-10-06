import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";

export const Route = createFileRoute("/_authenticated/dashboard/instagram")({
  component: () => (
    <>
      <PageHeader title="Instagram Editor" sub="Create and manage your Instagram insight demo projects." action={<NewProjectButton platform="instagram" />} />
      <ProjectGrid platform="instagram" />
    </>
  ),
});
