import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/lib/content";
import instagramLogo from "@/assets/instagram-plan.png.asset.json";
import tiktokLogo from "@/assets/tiktok-plan.png.asset.json";

export function PlatformPlans() {
  const { data, isLoading, error } = usePlans();
  const [viewportRef, carousel] = useEmblaCarousel({ align: "center", containScroll: "trimSnaps", dragThreshold: 5 });
  const [selected, setSelected] = useState(0);
  const manual = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const stop = useCallback(() => { manual.current = true; }, []);

  useEffect(() => {
    if (!carousel) return;
    const select = () => setSelected(carousel.selectedScrollSnap());
    carousel.on("select", select).on("reInit", select);
    select();
    let timer: number | undefined;
    const advance = () => {
      if (manual.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (carousel.canScrollNext()) carousel.scrollNext();
      else carousel.scrollTo(0);
    };
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry?.isIntersecting) timer = window.setInterval(advance, 7000);
    }, { threshold: 0.35 });
    observer.observe(carousel.rootNode());
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      carousel.off("select", select).off("reInit", select);
    };
  }, [carousel, stop]);

  if (isLoading) return <div className="grid gap-6 md:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>;
  if (error) return <p className="text-center text-destructive">Couldn't load pricing. Please refresh.</p>;
  if (!data?.length) return <p className="text-center text-muted-foreground">Plans are coming soon.</p>;

  const platforms = [
    { name: "Instagram", logo: instagramLogo.url, wordClass: "word-ig", glowClass: "glyph-ig" },
    { name: "TikTok", logo: tiktokLogo.url, wordClass: "word-tt", glowClass: "glyph-tt" },
  ];

  return (
    <div className="mx-auto max-w-4xl" aria-label="Instagram and TikTok plans">
      <div ref={viewportRef} className="platform-plans-window"
        onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
        onPointerMove={(event) => {
          const start = pointerStart.current;
          if (!start) return;
          const dx = Math.abs(event.clientX - start.x);
          const dy = Math.abs(event.clientY - start.y);
          if (dx > 10 && dx > dy) stop();
        }}
        onPointerUp={() => { pointerStart.current = null; }}
        onPointerCancel={() => { pointerStart.current = null; }}>
        <div className="platform-plans-track">
          {platforms.map((platform) => {
            const plans = data.filter((plan) => plan.name.toLowerCase().startsWith(platform.name.toLowerCase()));
            return (
              <article key={platform.name} className="platform-plan-card" aria-label={`${platform.name} plans`}>
                <header className="flex items-center gap-4">
                  <img src={platform.logo} alt={`${platform.name} logo`} draggable={false} className={`h-14 w-14 shrink-0 object-contain ${platform.glowClass}`} />
                  <h3 className={`${platform.wordClass} text-3xl leading-tight`}>{platform.name}</h3>
                </header>
                <div className="mt-8 divide-y divide-border">
                  {plans.map((plan) => (
                    <div key={plan.id} className="py-6 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-display text-lg font-semibold">{plan.name.replace(new RegExp(`^${platform.name}\\s*`, "i"), "")}</h4>
                        <p className="flex items-baseline gap-1 font-display">
                          <span className="title-gradient text-4xl font-extrabold">${Number(plan.price)}</span>
                          <span className="text-xs text-muted-foreground">{plan.billing_period === "once" ? "/ lifetime" : `/ ${plan.billing_period}`}</span>
                        </p>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{feature}</li>)}
                      </ul>
                      <Button asChild className="btn-plan mt-5 h-10 px-5 text-xs font-bold">
                        <Link to="/signup">{plan.cta}<ArrowRight /></Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-2 md:hidden">
        {platforms.map((platform, index) => (
          <Button key={platform.name} variant="ghost" size="icon" aria-label={`Show ${platform.name} plans`} aria-pressed={selected === index} onClick={() => { stop(); carousel?.scrollTo(index); }} className="h-8 w-8 rounded-full">
            <span className={`h-2 rounded-full transition-all duration-300 ${selected === index ? "w-5 bg-glow" : "w-2 bg-muted-foreground/40"}`} />
          </Button>
        ))}
      </div>
    </div>
  );
}