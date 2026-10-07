import { useEffect, useRef, useState } from "react";
import { BatteryFull, Play, Signal, Wifi } from "lucide-react";
import clip1 from "@/assets/customize-1.mp4.asset.json";
import clip2 from "@/assets/customize-2.mp4.asset.json";
import clip3 from "@/assets/customize-3.mp4.asset.json";
import clip4 from "@/assets/customize-4.mp4.asset.json";
import clip5 from "@/assets/customize-5.mp4.asset.json";
import clip6 from "@/assets/customize-6.mp4.asset.json";
import clip7 from "@/assets/customize-7.mp4.asset.json";
import clip8 from "@/assets/customize-8.mp4.asset.json";
import clip9 from "@/assets/customize-9.mp4.asset.json";
import clip10 from "@/assets/customize-10-replacement.mp4.asset.json";

export interface CustomizeClip {
  url: string;
  duration: number;
  caption: string;
}

// Add further clips here in order (with their length in seconds); they play back-to-back
// as if they were one recording, and the seek bar spans the combined length.
const instagramClipList: CustomizeClip[] = [
  { url: clip1.url, duration: 53.08, caption: "Enter your Instagram account username and clone it." },
  { url: clip2.url, duration: 68.76, caption: "Go to the profile, open any Reel insight, and customize the insights according to your preferences." },
  { url: clip3.url, duration: 65.12, caption: "Click Reel Insights, activate Edit Mode, and customize it your way." },
  { url: clip4.url, duration: 79.23, caption: "Click Reel Insights, activate Edit Mode, and customize it your way." },
  { url: clip5.url, duration: 63.3, caption: "Click Reel Insights, activate Edit Mode, and customize it your way." },
  { url: clip6.url, duration: 58.63, caption: "Go to Edit Profile and customize your Followers, Following, Dark Mode, Story, Notes, Bio, and Link." },
  { url: clip7.url, duration: 57.67, caption: "Press and hold the search icon for 2 seconds to activate Dark Mode." },
  { url: clip8.url, duration: 66.83, caption: "Press and hold Professional Dashboard to customize it, then tap Insight to edit its content." },
  { url: clip9.url, duration: 83, caption: "Repeat the same steps to customize another Reel." },
  { url: clip10.url, duration: 46.5, caption: "To clone another account, tap the Instagram logo, enter your username, and continue." },
];

function fmt(sec: number) {
  const t = Math.max(0, Math.floor(sec));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Two stacked <video> elements: while one plays, the other has the next clip
 * preloaded. When the playing clip ends the standby one starts instantly, so
 * there is no loading gap between clips.
 */
export function CustomizeSeriesPlayer({ title, subtitle, clipList }: { title: string; subtitle: string; clipList: CustomizeClip[] }) {
  const n = clipList.length;
  const clips = clipList.map((c) => c.url);
  const offsets = clipList.reduce<number[]>((acc, c, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + clipList[i - 1].duration);
    return acc;
  }, []);
  const total = clipList.reduce((sum, c) => sum + c.duration, 0);
  const [slots, setSlotsState] = useState<[number, number]>([0, 1 % n]);
  const [active, setActive] = useState<0 | 1>(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const refs = [useRef<HTMLVideoElement>(null), useRef<HTMLVideoElement>(null)];
  const activeRef = useRef<0 | 1>(0);
  const slotsRef = useRef<[number, number]>([0, 1 % n]);
  const pendingSeek = useRef<{ slot: 0 | 1; time: number; play: boolean } | null>(null);
  const scrubRef = useRef(false);
  const barRef = useRef<HTMLDivElement>(null);

  const updateSlots = (fn: (prev: [number, number]) => [number, number]) => {
    const next = fn(slotsRef.current);
    slotsRef.current = next;
    setSlotsState(next);
  };

  const syncTime = () => {
    if (scrubRef.current || pendingSeek.current) return;
    const v = refs[activeRef.current].current;
    if (!v) return;
    setCurrent(Math.min(total, offsets[slotsRef.current[activeRef.current]] + v.currentTime));
  };

  // Smooth progress while playing.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      syncTime();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const toggle = () => {
    const v = refs[activeRef.current].current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
  };

  const seekTo = (target: number) => {
    const t = Math.min(Math.max(0, target), total - 0.05);
    let idx = 0;
    while (idx < n - 1 && t >= offsets[idx + 1]) idx++;
    const local = t - offsets[idx];
    const cur = activeRef.current;
    const other = (1 - cur) as 0 | 1;
    const s = slotsRef.current;
    const curVideo = refs[cur].current;
    const wasPlaying = !!curVideo && !curVideo.paused;
    setCurrent(t);

    if (s[cur] === idx) {
      if (curVideo) curVideo.currentTime = local;
      return;
    }
    if (s[other] === idx) {
      const nv = refs[other].current;
      if (nv) {
        nv.currentTime = local;
        if (wasPlaying) void nv.play().catch(() => undefined);
      }
      curVideo?.pause();
      activeRef.current = other;
      setActive(other);
      updateSlots((prev) => {
        const copy: [number, number] = [prev[0], prev[1]];
        copy[cur] = (idx + 1) % n;
        return copy;
      });
      return;
    }
    // Neither slot holds the target clip: load it into the active slot, then jump.
    pendingSeek.current = { slot: cur, time: local, play: wasPlaying };
    updateSlots(() => {
      const copy: [number, number] = [0, 0];
      copy[cur] = idx;
      copy[other] = (idx + 1) % n;
      return copy;
    });
  };

  const handleLoadedMetadata = (slot: 0 | 1) => {
    const p = pendingSeek.current;
    if (!p || p.slot !== slot) return;
    const v = refs[slot].current;
    if (!v) return;
    pendingSeek.current = null;
    v.currentTime = p.time;
    if (p.play) void v.play().catch(() => undefined);
    else setPlaying(false);
  };

  const handleEnded = (slot: 0 | 1) => {
    if (slot !== activeRef.current) return;
    const nextSlot = (1 - slot) as 0 | 1;
    const next = refs[nextSlot].current;
    const nextIdx = slotsRef.current[nextSlot];
    if (next) {
      next.currentTime = 0;
      void next.play().catch(() => undefined);
    }
    activeRef.current = nextSlot;
    setActive(nextSlot);
    setCurrent(offsets[nextIdx]);
    // Preload the clip after next into the slot that just finished.
    updateSlots((prev) => {
      const copy: [number, number] = [prev[0], prev[1]];
      copy[slot] = (nextIdx + 1) % n;
      return copy;
    });
  };

  const timeFromPointer = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * total;
  };

  const shown = Math.min(current, total);
  const pct = (shown / total) * 100;
  let captionIndex = 0;
  while (captionIndex < n - 1 && shown >= offsets[captionIndex + 1]) captionIndex++;

  return (
    <div className="min-w-0 py-4">
      {(() => {
        const accent = title.match(/^(.*?)\s*(App UI)$/i);
        return (
          <h3 className="text-center font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {accent ? (
              <>
                {accent[1]}{" "}
                <span className="font-premium font-normal italic text-gradient">App UI</span>
              </>
            ) : (
              title
            )}
          </h3>
        );
      })()}
      <p className="mb-7 mt-2 text-center text-sm text-muted-foreground sm:text-base">{subtitle}</p>
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
                  onLoadedMetadata={() => handleLoadedMetadata(slot)}
                  onTimeUpdate={() => { if (slot === activeRef.current) syncTime(); }}
                  onPause={() => { if (slot === activeRef.current && !refs[slot].current?.ended && !pendingSeek.current) setPlaying(false); }}
                  onEnded={() => handleEnded(slot)}
                />
              ))}
              <button
                type="button"
                onClick={toggle}
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
        <div className="mt-5 select-none">
          <div
            ref={barRef}
            role="slider"
            tabIndex={0}
            aria-label="Seek video"
            aria-valuemin={0}
            aria-valuemax={Math.round(total)}
            aria-valuenow={Math.round(shown)}
            aria-valuetext={`${fmt(shown)} of ${fmt(total)}`}
            className="group relative flex h-6 cursor-pointer items-center"
            style={{ touchAction: "none" }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              scrubRef.current = true;
              setScrubbing(true);
              setCurrent(timeFromPointer(e.clientX));
            }}
            onPointerMove={(e) => {
              if (scrubRef.current) setCurrent(timeFromPointer(e.clientX));
            }}
            onPointerUp={(e) => {
              if (!scrubRef.current) return;
              scrubRef.current = false;
              setScrubbing(false);
              seekTo(timeFromPointer(e.clientX));
            }}
            onPointerCancel={() => {
              scrubRef.current = false;
              setScrubbing(false);
              syncTime();
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); seekTo(shown + 5); }
              else if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(shown - 5); }
              else if (e.key === "Home") { e.preventDefault(); seekTo(0); }
              else if (e.key === "End") { e.preventDefault(); seekTo(total - 0.1); }
            }}
          >
            <div className={`relative w-full overflow-hidden rounded-full bg-foreground/20 transition-all ${scrubbing ? "h-2" : "h-1 group-hover:h-2"}`}>
              <div className="absolute inset-y-0 left-0 bg-brand" style={{ width: `${pct}%` }} />
              {offsets.slice(1).map((o) => (
                <span key={o} aria-hidden="true" className="absolute inset-y-0 w-0.5 bg-background/70" style={{ left: `${(o / total) * 100}%` }} />
              ))}
            </div>
            <span
              aria-hidden="true"
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-glow transition-transform ${scrubbing ? "scale-125" : "scale-100"}`}
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs tabular-nums text-muted-foreground">
            <span>{fmt(shown)}</span>
            <span>{fmt(total)}</span>
          </div>
          <div className="caption-glass mt-4 min-h-24 px-5 py-4" aria-live="polite">
            <p key={captionIndex} className="text-center text-sm font-medium leading-relaxed text-foreground/90 sm:text-[0.95rem]">
              {clipList[captionIndex].caption}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export function CustomizeVideoSeries() {
  return <CustomizeSeriesPlayer title="Instagram Larp Insight App UI" subtitle="How to Customize your Larp Insight" clipList={instagramClipList} />;
}
