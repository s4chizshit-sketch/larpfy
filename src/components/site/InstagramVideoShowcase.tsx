import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import homeVideo from "@/assets/instagram-home.mp4.asset.json";
import profileVideo from "@/assets/instagram-profile.mp4.asset.json";

const recordings = [
  { label: "Home interface", url: homeVideo.url },
  { label: "Profile", url: profileVideo.url },
];

export function InstagramVideoShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % recordings.length), 7000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-w-0 py-4">
      <h3 className="mb-7 text-center text-xl font-semibold tracking-normal sm:text-2xl">Instagram Larp Insight App UI</h3>
      <div className="instagram-video-window">
        <div className={`instagram-video-track ${active === 1 ? "instagram-video-track-profile" : ""}`}>
          {recordings.map((recording, index) => (
            <figure key={recording.label} className={`instagram-video-slide ${active === index ? "is-active" : ""}`}>
              <figcaption className="mb-3 text-center text-xs font-medium text-muted-foreground">{recording.label}</figcaption>
              <div className="instagram-video-phone">
                <video
                  src={recording.url}
                  aria-label={`${recording.label} screen recording`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  onCanPlay={(event) => { void event.currentTarget.play().catch(() => undefined); }}
                  className="block aspect-[1732/3840] w-full object-contain"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2" aria-label="Recording selection">
        {recordings.map((recording, index) => (
          <Button key={recording.label} variant="ghost" size="icon" className="h-7 w-8" aria-label={`Show ${recording.label}`} aria-pressed={active === index} onClick={() => setActive(index)}>
            <span className={`h-1.5 rounded-full transition-all duration-500 ${active === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          </Button>
        ))}
      </div>
    </div>
  );
}