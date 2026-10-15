import { Sparkles } from "lucide-react";
import { CustomizeSeriesPlayer, type CustomizeClip } from "./CustomizeVideoSeries";
import tiktokCustomize1 from "@/assets/tiktok-customize-1.mp4";
import tiktokCustomize2 from "@/assets/tiktok-customize-2.mp4";
import tiktokCustomize3 from "@/assets/tiktok-customize-3.mp4";
import tiktokCustomize4 from "@/assets/tiktok-customize-4.mp4";
import tiktokCustomize5 from "@/assets/tiktok-customize-5.mp4";

// TikTok customize-series clips — appended in order as recordings arrive
// (with their length in seconds and the caption shown below the seek bar).
const tiktokClipList: CustomizeClip[] = [
  { url: tiktokCustomize1.url, duration: 49.807, caption: "Click Edit, enter the username of any TikTok account, and click Clone." },
  { url: tiktokCustomize2.url, duration: 78.933, caption: "Open More Insights on any TikTok video, then customize the Video Analytics as needed." },
  { url: tiktokCustomize3.url, duration: 65.4, caption: "Click Video Analytics, then activate Edit Mode and continue customizing the analytics." },
  { url: tiktokCustomize4.url, duration: 81.367, caption: "Customize all sections according to your preferences." },
  { url: tiktokCustomize5.url, duration: 61.733, caption: "Customize all sections according to your preferences." },
];

export function TiktokCustomizeVideoSeries() {
  if (tiktokClipList.length === 0) {
    return (
      <div className="min-w-0 py-4">
        <h3 className="text-center text-xl font-semibold tracking-normal sm:text-2xl">Tiktok Larp Insight App UI</h3>
        <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">How to Customize your Larp Insight</p>
        <div className="mx-auto flex w-[70%] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <Sparkles className="h-8 w-8 text-primary" />
          <p className="mt-3 font-medium">Customize series videos are on the way</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon for the full walkthrough.</p>
        </div>
      </div>
    );
  }
  return <CustomizeSeriesPlayer title="Tiktok Larp Insight App UI" subtitle="How to Customize your Larp Insight" clipList={tiktokClipList} />;
}
