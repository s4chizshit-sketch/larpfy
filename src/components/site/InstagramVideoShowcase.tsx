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

const recordings = [
  { label: "Home interface", url: homeVideo, webm: homeWebm },
  { label: "Scrolling feed", url: feedVideo, webm: feedWebm },
  { label: "Profile", url: profileVideo, webm: profileWebm },
  { label: "View insight", url: insightVideo, webm: insightWebm },
  { label: "Professional dashboard", url: dashboardVideo, webm: dashboardWebm },
  { label: "Share", url: shareVideo, webm: shareWebm },
  { label: "Reels tab", url: reelsVideo, webm: reelsWebm },
];

export function InstagramVideoShowcase() {
  return <RecordingVideoShowcase title="Instagram Larp Insight App UI" platform="Instagram" recordings={recordings} />;
}

export function RecordingVideoShowcase({ title, platform, recordings }: {
  title: string;
  platform: string;
  recordings: { label: string; url: string; webm: string }[];
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

  useEffect(() => {
    if (!carouselApi) return;
    let timer: number | undefined;
    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      if (userControlled.current) return;
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
  }, [carouselApi]);

  return (
    <div className="min-w-0 py-4">
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
                  <div className="instagram-iphone-status" aria-hidden="true">
                    <span>9:41</span>
                    <span className="instagram-iphone-island" />
                    <span className="instagram-iphone-status-icons"><Signal /><Wifi /><BatteryFull /></span>
                  </div>
                  <div className="instagram-iphone-recording">
                <video
                  aria-label={`${recording.label} screen recording`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  onCanPlay={(event) => { void event.currentTarget.play().catch(() => undefined); }}
                   className="pointer-events-none"
                >
                  <source src={recording.webm} type="video/webm" />
                  <source src={recording.url} type="video/mp4" />
                </video>
                  </div>
                  <div className="instagram-iphone-home" aria-hidden="true" />
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