import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import homeVideo from "@/assets/instagram-home.mp4";
import profileVideo from "@/assets/instagram-profile.mp4";
import homeWebm from "@/assets/instagram-home.webm";
import profileWebm from "@/assets/instagram-profile.webm";
import feedVideo from "@/assets/instagram-feed.mp4";
import feedWebm from "@/assets/instagram-feed.webm";
import insightVideo from "@/assets/instagram-insight.mp4";
import insightWebm from "@/assets/instagram-insight.webm";
import dashboardVideo from "@/assets/instagram-dashboard.mp4";
import dashboardWebm from "@/assets/instagram-dashboard.webm";
import shareVideo from "@/assets/instagram-share.mp4";
import shareWebm from "@/assets/instagram-share.webm";
import reelsVideo from "@/assets/instagram-reels.mp4";
import reelsWebm from "@/assets/instagram-reels.webm";
import homePoster from "@/assets/instagram-home-poster.jpg";
import feedPoster from "@/assets/instagram-feed-poster.jpg";
import profilePoster from "@/assets/instagram-profile-poster.jpg";
import insightPoster from "@/assets/instagram-insight-poster.jpg";
import dashboardPoster from "@/assets/instagram-dashboard-poster.jpg";
import sharePoster from "@/assets/instagram-share-poster.jpg";
import reelsPoster from "@/assets/instagram-reels-poster.jpg";

const recordings = [
  { label: "Home interface", url: homeVideo, webm: homeWebm, poster: homePoster },
  { label: "Scrolling feed", url: feedVideo, webm: feedWebm, poster: feedPoster },
  { label: "Profile", url: profileVideo, webm: profileWebm, poster: profilePoster },
  { label: "View insight", url: insightVideo, webm: insightWebm, poster: insightPoster },
  { label: "Professional dashboard", url: dashboardVideo, webm: dashboardWebm, poster: dashboardPoster },
  { label: "Share", url: shareVideo, webm: shareWebm, poster: sharePoster },
  { label: "Reels tab", url: reelsVideo, webm: reelsWebm, poster: reelsPoster },
];

export function InstagramVideoShowcase() {
  return <RecordingVideoShowcase title="Instagram Larp Insight App UI" platform="Instagram" recordings={recordings} />;
}

export function RecordingVideoShowcase({ title, platform, recordings, withSound = false, preserveFullRecording = false }: {
  title: string;
  platform: string;
  recordings: { label: string; url: string; webm?: string; poster?: string }[];
  withSound?: boolean;
  preserveFullRecording?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    duration: 30,
    dragThreshold: 5,
  });

  // Once the user swipes or taps a dot, auto-advance stays off so they can watch the chosen video.
  const userControlled = useRef(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const visibleRef = useRef(false);
  const [nearby, setNearby] = useState(false);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: "600px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    // Sound sections only count as visible when a real part is on screen, so audio stops as soon as the user leaves.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = withSound ? entry.intersectionRatio >= 0.25 : entry.isIntersecting;
        visibleRef.current = isVisible;
        setVisible(isVisible);
        if (!isVisible) node.querySelectorAll("video").forEach((v) => v.pause());
      },
      withSound ? { threshold: [0, 0.25, 0.5] } : { rootMargin: "100px" },
    );
    observer.observe(node);
    const onHide = () => { if (document.hidden) node.querySelectorAll("video").forEach((v) => v.pause()); };
    document.addEventListener("visibilitychange", onHide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", onHide); };
  }, [withSound]);

  // Run after React has attached sources, not during the element ref commit.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const syncPlayback = () => {
      node.querySelectorAll("video").forEach((video, index) => {
        const source = video.querySelector("source")?.getAttribute("src");
        if (source && video.dataset.loadedSource !== source) {
          video.dataset.loadedSource = source;
          video.load();
        }
        if (index !== active || !visible || document.hidden) { video.pause(); return; }
        if (withSound && video.paused) video.currentTime = 0;
        void video.play().catch(() => {
          if (withSound) {
            video.muted = true;
            void video.play().catch(() => undefined);
          }
        });
      });
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [active, visible, nearby, withSound]);

  // Browsers block sound until the first tap/click/key; afterwards visibility alone controls audio.
  useEffect(() => {
    if (!withSound) return;
    const unlock = () => {
      if (!visibleRef.current) return;
      const video = sectionRef.current?.querySelector<HTMLVideoElement>(".is-active video");
      if (video) { video.muted = false; void video.play().catch(() => undefined); }
    };
    const events = ["pointerdown", "touchstart", "keydown"] as const;
    events.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, unlock));
  }, [withSound]);

  useEffect(() => {
    if (!carouselApi) return;
    let timer: number | undefined;
    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      if (userControlled.current || !visible || document.hidden) return;
      timer = window.setTimeout(() => {
        if (userControlled.current) return;
        if (carouselApi.canScrollNext()) carouselApi.scrollNext();
        else carouselApi.scrollTo(0);
      }, 7000);
    };
    const takeControl = () => { userControlled.current = true; stop(); };
    const sync = () => setActive(carouselApi.selectedScrollSnap());
    const reinitialize = () => { sync(); schedule(); };
    carouselApi.on("select", sync);
    carouselApi.on("pointerDown", takeControl);
    carouselApi.on("settle", schedule);
    carouselApi.on("reInit", reinitialize);
    sync();
    schedule();
    return () => {
      stop();
      carouselApi.off("select", sync);
      carouselApi.off("pointerDown", takeControl);
      carouselApi.off("settle", schedule);
      carouselApi.off("reInit", reinitialize);
    };
  }, [carouselApi, visible]);

  return (
    <div ref={sectionRef} className={`min-w-0 py-4${preserveFullRecording ? " full-recording-showcase" : ""}`}>
      <h3 className="title-gradient mb-7 text-center font-sans text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
        {title}
      </h3>
      <div ref={carouselRef} className="instagram-video-window" role="region" aria-label={`${platform} recordings`} aria-roledescription="carousel">
        <div className="instagram-video-track">
          {recordings.map((recording, index) => (
            <figure key={recording.label} className={`instagram-video-slide ${active === index ? "is-active" : ""}`}>
              <figcaption className="mb-3 text-center text-xs font-medium text-muted-foreground">{recording.label}</figcaption>
              <div className="instagram-video-phone">
                <span aria-hidden="true" className="instagram-iphone-button silent" />
                <span aria-hidden="true" className="instagram-iphone-button volume-up" />
                <span aria-hidden="true" className="instagram-iphone-button volume-down" />
                <span aria-hidden="true" className="instagram-iphone-button power" />
                <div className="instagram-iphone-screen">
                  {!preserveFullRecording && <div className="instagram-iphone-status" aria-hidden="true">
                    <span>9:41</span>
                    <span className="instagram-iphone-island" />
                    <span className="instagram-iphone-status-icons"><Signal /><Wifi /><BatteryFull /></span>
                  </div>}
                  <div className="instagram-iphone-recording">
                <video
                  aria-label={`${recording.label} screen recording`}
                  autoPlay={active === index && visible}
                  muted={!withSound}
                  loop
                  playsInline
                  poster={nearby ? recording.poster : undefined}
                  preload={active === index ? "auto" : "metadata"}
                  disablePictureInPicture
                  className="pointer-events-none"
                >
                  {(nearby && Math.abs(active - index) <= 1) && <>
                    {recording.webm && <source src={recording.webm} type="video/webm" />}
                    <source src={recording.url} type="video/mp4" />
                  </>}
                </video>
                  </div>
                  {!preserveFullRecording && <div className="instagram-iphone-home" aria-hidden="true" />}
                </div>
              </div>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2" aria-label="Recording selection">
        {recordings.map((recording, index) => (
          <Button key={recording.label} variant="ghost" size="icon" className="h-7 w-8" aria-label={`Show ${recording.label}`} aria-pressed={active === index} onClick={() => { userControlled.current = true; carouselApi?.scrollTo(index); }}>
            <span className={`h-1.5 rounded-full transition-all duration-500 ${active === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          </Button>
        ))}
      </div>
    </div>
  );
}