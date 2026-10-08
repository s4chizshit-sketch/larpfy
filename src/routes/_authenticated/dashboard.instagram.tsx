import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";
import { InstagramVideoShowcase } from "@/components/site/InstagramVideoShowcase";
import { CustomizeVideoSeries } from "@/components/site/CustomizeVideoSeries";
import { useProfile } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/dashboard/instagram")({
  head: () => ({ meta: [
    { title: "Instagram App UI & Customization — LARP Insight" },
    { name: "description", content: "Watch Instagram demo recordings and customization tutorials in your LARP Insight workspace." },
    { property: "og:title", content: "Instagram App UI & Customization — LARP Insight" },
    { property: "og:description", content: "Instagram app UI recordings and customization tutorials." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: InstagramPage,
});

function InstagramPage() {
  const { data } = useProfile();
  return (
    <>
      <PageHeader title="Instagram Editor" action={data?.isAdmin ? <NewProjectButton platform="instagram" /> : undefined} />
      {data?.isAdmin ? <ProjectGrid platform="instagram" /> : (
        <div className="mx-auto w-full min-w-0 max-w-2xl space-y-10">
          <InstagramVideoShowcase />
          <CustomizeVideoSeries />
        </div>
      )}
    </>
  );
}
