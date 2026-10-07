import { RecordingVideoShowcase } from "./InstagramVideoShowcase";
import homeVideo from "@/assets/tiktok-home.mp4.asset.json";
import homeWebm from "@/assets/tiktok-home.webm.asset.json";
import inboxVideo from "@/assets/tiktok-inbox.mp4.asset.json";
import inboxWebm from "@/assets/tiktok-inbox.webm.asset.json";

const recordings = [
  { label: "Open app home feed", url: homeVideo.url, webm: homeWebm.url },
  { label: "inbox", url: inboxVideo.url, webm: inboxWebm.url },
];

export function TiktokVideoShowcase() {
  return <RecordingVideoShowcase title="Tiktok Larp inght App UI" platform="TikTok" recordings={recordings} />;
}