import { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import homeVideo from "@/assets/instagram-home.mp4.asset.json";
import profileVideo from "@/assets/instagram-profile.mp4.asset.json";
import homeWebm from "@/assets/instagram-home.webm.asset.json";
import profileWebm from "@/assets/instagram-profile.webm.asset.json";
import feedVideo from "@/assets/instagram-feed.mp4.asset.json";
import feedWebm from "@/assets/instagram-feed.webm.asset.json";
import insightVideo from "@/assets/instagram-insight.mp4.asset.json";
import insightWebm from "@/assets/instagram-insight.webm.asset.json";
import dashboardVideo from "@/assets/instagram-dashboard.mp4.asset.json";
import dashboardWebm from "@/assets/instagram-dashboard.webm.asset.json";
import shareVideo from "@/assets/instagram-share.mp4.asset.json";
import shareWebm from "@/assets/instagram-share.webm.asset.json";
import reelsVideo from "@/assets/instagram-reels.mp4.asset.json";
import reelsWebm from "@/assets/instagram-reels.webm.asset.json";

const recordings = [
  { label: "Home interface", url: homeVideo.url, webm: homeWebm.url },
  { label: "Scrolling feed", url: feedVideo.url, webm: feedWebm.url },
  { label: "Profile", url: profileVideo.url, webm: profileWebm.url },
  { label: "View insight", url: insightVideo.url, webm: insightWebm.url },
  { label: "Professional dashboard", url: dashboardVideo.url, webm: dashboardWebm.url },
  { label: "Share", url: shareVideo.url, webm: shareWebm.url },
  { label: "Reels tab", url: reelsVideo.url, webm: reelsWebm.url },
];

export function InstagramVideoShowcase() {
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
      <h3 className="mb-7 text-center text-xl font-semibold tracking-normal sm:text-2xl">Instagram Larp Insight App UI</h3>
      <div ref={carouselRef} className="instagram-video-window" role="region" aria-label="Instagram recordings" aria-roledescription="carousel">
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