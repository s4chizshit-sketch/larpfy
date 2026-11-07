import { RecordingVideoShowcase } from "./InstagramVideoShowcase";
import homeVideo from "@/assets/tiktok-home.mp4";
import homeWebm from "@/assets/tiktok-home.webm";
import inboxVideo from "@/assets/tiktok-inbox.mp4";
import inboxWebm from "@/assets/tiktok-inbox.webm";
import profileVideo from "@/assets/tiktok-profile-reels.mp4";
import profileWebm from "@/assets/tiktok-profile-reels.webm";
import analysisVideo from "@/assets/tiktok-analysis.mp4";
import analysisWebm from "@/assets/tiktok-analysis.webm";
import homePoster from "@/assets/tiktok-home-poster.jpg";
import inboxPoster from "@/assets/tiktok-inbox-poster.jpg";
import profilePoster from "@/assets/tiktok-profile-reels-poster.jpg";
import analysisPoster from "@/assets/tiktok-analysis-poster.jpg";

const recordings = [
  { label: "Open app home feed", url: homeVideo, webm: homeWebm, poster: homePoster },
  { label: "inbox", url: inboxVideo, webm: inboxWebm, poster: inboxPoster },
  { label: "Profile/reels", url: profileVideo, webm: profileWebm, poster: profilePoster },
  { label: "Video analysis", url: analysisVideo, webm: analysisWebm, poster: analysisPoster },
];

export function TiktokVideoShowcase() {
  return <RecordingVideoShowcase title="Tiktok Larp Insight App UI" platform="TikTok" recordings={recordings} />;
}
