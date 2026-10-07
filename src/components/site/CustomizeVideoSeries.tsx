import { useRef, useState } from "react";
import { BatteryFull, Play, Signal, Wifi } from "lucide-react";
import clip1 from "@/assets/customize-1.mp4.asset.json";
import clip2 from "@/assets/customize-2.mp4.asset.json";
import clip3 from "@/assets/customize-3.mp4.asset.json";
import clip4 from "@/assets/customize-4.mp4.asset.json";
import clip5 from "@/assets/customize-5.mp4.asset.json";
import clip6 from "@/assets/customize-6.mp4.asset.json";

// Add further clips here in order; they play back-to-back as if they were one recording.
const clips = [clip1.url, clip2.url, clip3.url, clip4.url, clip5.url, clip6.url];

/**
 * Two stacked <video> elements: while one plays, the other has the next clip
 * preloaded. When the playing clip ends the standby one starts instantly, so
 * there is no loading gap between clips.
 */
export function CustomizeVideoSeries() {
  const n = clips.length;
  const [slots, setSlots] = useState<[number, number]>([0, 1 % n]);
  const [active, setActive] = useState<0 | 1>(0);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const activeRef = useRef<0 | 1>(0);

  const toggle = () => {
    const v = refs[active].current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
  };

  const handleEnded = (slot: 0 | 1) => {
    if (slot !== activeRef.current) return;
    const nextSlot = (1 - slot) as 0 | 1;
    const next = refs[nextSlot].current;
    const nextIdx = slots[nextSlot];
    if (next) {
      next.currentTime = 0;
      void next.play().catch(() => undefined);
    }
    activeRef.current = nextSlot;
    setActive(nextSlot);
    // Preload the clip after next into the slot that just finished.
    setSlots((prev) => {
      const copy: [number, number] = [prev[0], prev[1]];
      copy[slot] = (nextIdx + 1) % n;
      return copy;
    });
  };

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
              {([0, 1] as const).map((slot) => (
                <video
                  key={slot}
                  ref={refs[slot]}
                  src={clips[slots[slot]]}
                  aria-label="How to customize your Larp Insight"
                  playsInline
                  preload="auto"
                  style={{ opacity: active === slot ? 1 : 0, pointerEvents: "none" }}
                  onPlay={() => { if (slot === activeRef.current) setPlaying(true); }}
                  onPause={() => { if (slot === activeRef.current && !refs[slot].current?.ended) setPlaying(false); }}
                  onEnded={() => handleEnded(slot)}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  if (!started) {
                    setStarted(true);
                    void refs[0].current?.play().catch(() => undefined);
                  } else toggle();
                }}
                aria-label={playing ? "Pause video" : "Play video"}
                className="absolute inset-0 flex items-center justify-center"
              >
                {!playing && (
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand shadow-glow">
                    <Play className="ml-1 h-7 w-7 text-primary-foreground" fill="currentColor" />
                  </span>
                )}
              </button>
            </div>
            <div className="instagram-iphone-home" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
