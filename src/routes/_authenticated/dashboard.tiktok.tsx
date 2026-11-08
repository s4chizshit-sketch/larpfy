import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppShell";
import { NewProjectButton, ProjectGrid } from "@/components/app/ProjectGrid";
import { TiktokVideoShowcase } from "@/components/site/TiktokVideoShowcase";
import { TiktokCustomizeVideoSeries } from "@/components/site/TiktokCustomizeVideoSeries";
import { useProfile } from "@/lib/auth";
import { EditorProductInfo } from "@/components/site/EditorProductInfo";
import { PlatformPlans } from "@/components/site/PlatformPlans";

export const Route = createFileRoute("/_authenticated/dashboard/tiktok")({
  head: () => ({ meta: [
    { title: "TikTok App UI & Customization — LARPFY" },
    { name: "description", content: "Watch TikTok demo recordings and customization tutorials in your LARPFY workspace." },
    { property: "og:title", content: "TikTok App UI & Customization — LARPFY" },
    { property: "og:description", content: "TikTok app UI recordings and customization tutorials." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TiktokPage,
});

function TiktokPage() {
  const { data } = useProfile();
  return (
    <>
      <PageHeader title="TikTok Editor" action={data?.isAdmin ? <NewProjectButton platform="tiktok" /> : undefined} />
      {data?.isAdmin ? <ProjectGrid platform="tiktok" /> : (
        <div className="mx-auto w-full min-w-0 max-w-2xl space-y-10">
          <TiktokVideoShowcase />
          <TiktokCustomizeVideoSeries />
        </div>
      )}
      <EditorProductInfo product="tiktok" />
      <div className="mt-10"><PlatformPlans product="tiktok" /></div>
    </>
  );
}
