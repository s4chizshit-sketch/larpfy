import { Sparkles } from "lucide-react";
import { CustomizeSeriesPlayer, type CustomizeClip } from "./CustomizeVideoSeries";

// TikTok customize-series clips — appended in order as recordings arrive
// (with their length in seconds and the caption shown below the seek bar).
const tiktokClipList: CustomizeClip[] = [];

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
