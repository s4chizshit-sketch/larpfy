import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import homeVideo from "@/assets/instagram-home.mp4.asset.json";
import profileVideo from "@/assets/instagram-profile.mp4.asset.json";
import homeWebm from "@/assets/instagram-home.webm.asset.json";
import profileWebm from "@/assets/instagram-profile.webm.asset.json";

const recordings = [
  { label: "Home interface", url: homeVideo.url, webm: homeWebm.url },
  { label: "Profile", url: profileVideo.url, webm: profileWebm.url },
];

export function InstagramVideoShowcase() {
  const [active, setActive] = useState(0);
  const [carouselRef, carouselApi] = useEmblaCarousel({
    align: "center",
    containScroll: false,
    duration: 30,
    dragThreshold: 5,
  });

  useEffect(() => {
    if (!carouselApi) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const stop = () => window.clearTimeout(timer);
    const schedule = () => {
      stop();
      timer = window.setTimeout(() => {
        if (carouselApi.canScrollNext()) carouselApi.scrollNext();
        else carouselApi.scrollTo(0);
      }, 7000);
    };
    const sync = () => setActive(carouselApi.selectedScrollSnap());
    const reinitialize = () => { sync(); schedule(); };
    carouselApi.on("select", sync);
    carouselApi.on("pointerDown", stop);
    carouselApi.on("pointerUp", schedule);
    carouselApi.on("settle", schedule);
    carouselApi.on("reInit", reinitialize);
    sync();
    schedule();
    return () => {
      stop();
      carouselApi.off("select", sync);
      carouselApi.off("pointerDown", stop);
      carouselApi.off("pointerUp", schedule);
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
                <video
                  aria-label={`${recording.label} screen recording`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  onCanPlay={(event) => { void event.currentTarget.play().catch(() => undefined); }}
                  className="pointer-events-none block aspect-[1732/3840] w-full object-contain"
                >
                  <source src={recording.webm} type="video/webm" />
                  <source src={recording.url} type="video/mp4" />
                </video>
              </div>
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-6 flex justify-center gap-2" aria-label="Recording selection">
        {recordings.map((recording, index) => (
          <Button key={recording.label} variant="ghost" size="icon" className="h-7 w-8" aria-label={`Show ${recording.label}`} aria-pressed={active === index} onClick={() => carouselApi?.scrollTo(index)}>
            <span className={`h-1.5 rounded-full transition-all duration-500 ${active === index ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/40"}`} />
          </Button>
        ))}
      </div>
    </div>
  );
}