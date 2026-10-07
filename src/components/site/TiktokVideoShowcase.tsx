import { RecordingVideoShowcase } from "./InstagramVideoShowcase";
import homeVideo from "@/assets/tiktok-home.mp4.asset.json";
import homeWebm from "@/assets/tiktok-home.webm.asset.json";
import inboxVideo from "@/assets/tiktok-inbox.mp4.asset.json";
import inboxWebm from "@/assets/tiktok-inbox.webm.asset.json";
import profileVideo from "@/assets/tiktok-profile-reels.mp4.asset.json";
import profileWebm from "@/assets/tiktok-profile-reels.webm.asset.json";
import analysisVideo from "@/assets/tiktok-analysis.mp4.asset.json";
import analysisWebm from "@/assets/tiktok-analysis.webm.asset.json";

const recordings = [
  { label: "Open app home feed", url: homeVideo.url, webm: homeWebm.url },
  { label: "inbox", url: inboxVideo.url, webm: inboxWebm.url },
  { label: "Profile/reels", url: profileVideo.url, webm: profileWebm.url },
];

export function TiktokVideoShowcase() {
  return <RecordingVideoShowcase title="Tiktok Larp inght App UI" platform="TikTok" recordings={recordings} />;
}
