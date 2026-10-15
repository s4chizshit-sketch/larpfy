import { RecordingVideoShowcase } from "./InstagramVideoShowcase";
import homeVideo from "@/assets/tiktok-home.mp4";
import homeWebm from "@/assets/tiktok-home.webm";
import inboxVideo from "@/assets/tiktok-inbox.mp4";
import inboxWebm from "@/assets/tiktok-inbox.webm";
import profileVideo from "@/assets/tiktok-profile-reels.mp4";
import profileWebm from "@/assets/tiktok-profile-reels.webm";
import analysisVideo from "@/assets/tiktok-analysis.mp4";
import analysisWebm from "@/assets/tiktok-analysis.webm";

const recordings = [
  { label: "Open app home feed", url: homeVideo, webm: homeWebm },
  { label: "inbox", url: inboxVideo, webm: inboxWebm },
  { label: "Profile/reels", url: profileVideo, webm: profileWebm },
  { label: "Video analysis", url: analysisVideo, webm: analysisWebm },
];

export function TiktokVideoShowcase() {
  return <RecordingVideoShowcase title="Tiktok Larp Insight App UI" platform="TikTok" recordings={recordings} />;
}
