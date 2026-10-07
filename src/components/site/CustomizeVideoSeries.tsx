import { useRef, useState } from "react";
import { BatteryFull, Play, Signal, Wifi } from "lucide-react";
import clip1 from "@/assets/customize-1.mp4.asset.json";
import clip2 from "@/assets/customize-2.mp4.asset.json";

// Add further clips here in order; they play back-to-back in one iPhone frame.
const clips = [clip1.url, clip2.url];

export function CustomizeVideoSeries() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const start = () => { void videoRef.current?.play().catch(() => undefined); };

  return (
    <div className="min-w-0 py-4">
      <h3 className="text-center text-xl font-semibold tracking-normal sm:text-2xl">Instagram Larp Insight App UI</h3>
      <p className="mb-7 mt-1 text-center text-sm text-muted-foreground">How to Customize your Larp Insight</p>
      <div className="mx-auto w-[70%]">
        <div className="instagram-video-phone" style={{ pointerEvents: "auto" }}>
          <span aria-hidden="true" className="instagram-iphone-button silent" />
          <span aria-hidden="true" className="instagram-iphone-button volume-up" />
          <span aria-hidden="true" className="instagram-iphone-button volume-down" />
          <span aria-hidden="true" className="instagram-iphone-button power" />
          <div className="instagram-iphone-screen">
            <div className="instagram-iphone-status" aria-hidden="true">
              <span>9:41</span>
              <span className="instagram-iphone-island" />
              <span className="instagram-iphone-status-icons"><Signal /><Wifi /><BatteryFull /></span>
            </div>
            <div className="instagram-iphone-recording">
              <video
                ref={videoRef}
                key={clips[index]}
                src={clips[index]}
                aria-label={`How to customize, part ${index + 1} of ${clips.length}`}
                playsInline
                preload="metadata"
                autoPlay={playing}
                controls={playing}
                onPlay={() => setPlaying(true)}
                onEnded={() => setIndex((i) => (i + 1) % clips.length)}
              />
              {!playing && (
                <button
                  type="button"
                  onClick={start}
                  aria-label="Play video"
                  className="absolute inset-0 flex items-center justify-center bg-background/30"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-glow">
                    <Play className="ml-1 h-7 w-7 text-primary-foreground" fill="currentColor" />
                  </span>
                </button>
              )}
            </div>
            <div className="instagram-iphone-home" aria-hidden="true" />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Part {index + 1} of {clips.length}</p>
      </div>
    </div>
  );
}
