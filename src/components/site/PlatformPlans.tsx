import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/lib/content";
import { PlanPaymentDialog } from "@/components/site/PlanPaymentDialog";
import instagramLogo from "@/assets/instagram-plan.png";
import tiktokLogo from "@/assets/tiktok-plan.png";
import { ProductVideo, ShorterPlans } from "./EditorProductInfo";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lifetimeAvailability } from "@/lib/lifetime.functions";

export function PlatformPlans({ product }: { product?: "instagram" | "tiktok" } = {}) {
  const { data, isLoading, error } = usePlans();
  const availabilityFn = useServerFn(lifetimeAvailability);
  const availability = useQuery({ queryKey: ["lifetime-availability"], queryFn: () => availabilityFn(), staleTime: 15000, retry: false });
  const [viewportRef, carousel] = useEmblaCarousel({ align: "center", containScroll: "trimSnaps", dragThreshold: 5 });
  const [selected, setSelected] = useState(0);
  const [paymentPlan, setPaymentPlan] = useState<{ id: string; name: string; price: number; billingPeriod: string } | null>(null);
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
    { name: "Instagram", logo: instagramLogo, wordClass: "word-ig", glowClass: "glyph-ig" },
    { name: "TikTok", logo: tiktokLogo, wordClass: "word-tt", glowClass: "glyph-tt" },
  ].filter(platform => !product || platform.name.toLowerCase() === product);

  return (
    <div className="mx-auto max-w-4xl" aria-label="Instagram and TikTok lifetime plans">
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
            const available = availability.data?.[platform.name === "Instagram" ? "instagram" : "tiktok"] === true;
            return (
              <article key={platform.name} className="platform-plan-card" aria-label={`${platform.name} plans`}>
                <header className="flex items-center gap-4">
                  <img src={platform.logo} alt={`${platform.name} logo`} draggable={false} className={`h-14 w-14 shrink-0 object-contain ${platform.glowClass}`} />
                  <h3 className={`${platform.wordClass} text-3xl leading-tight`}>{platform.name}</h3>
                </header>
                <ProductVideo product={platform.name === "Instagram" ? "instagram" : "tiktok"} />
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Edited analytics change presentation only—not real views, engagement or earnings.</p>
                <div className="mt-7 border-t border-border pt-5 plan-tiers">
                  {plans.map((plan) => (
                    <div key={plan.id} className="plan-tier py-6 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-display text-lg font-semibold">Lifetime access</h4>
                        <p className="flex items-baseline gap-1 font-display">
                          <span className="title-gradient text-4xl font-extrabold">${Number(plan.price)}</span>
                          <span className="text-xs text-muted-foreground">{plan.billing_period === "once" ? "/ lifetime" : `/ ${plan.billing_period}`}</span>
                        </p>
                      </div>
                      <p className="mt-2 text-xs font-medium text-primary">Website purchase · One-time payment · No expiry</p>
                      <ul className="mt-4 space-y-2">
                        {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm font-medium text-foreground/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-glow" />{feature}</li>)}
                      </ul>
                      <Button type="button" disabled={!available} className="btn-plan mt-5 h-10 px-5 text-xs font-bold" onClick={() => setPaymentPlan({ id: plan.id, name: plan.name, price: Number(plan.price), billingPeriod: plan.billing_period })}>
                        {available ? plan.cta : availability.isPending ? "Checking availability…" : "Lifetime delivery unavailable"}<ArrowRight />
                      </Button>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Pay with USDT through OxaPay. After server verification, your matching APK and one access key appear automatically in your website purchase history. No owner approval or bot connection is required.</p>
                    </div>
                  ))}
                </div>
                <ShorterPlans product={platform.name === "Instagram" ? "instagram" : "tiktok"} />
              </article>
            );
          })}
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {platforms.map((platform, index) => (
          <Button key={platform.name} variant="ghost" size="icon" aria-label={`Show ${platform.name} plans`} aria-pressed={selected === index} onClick={() => { stop(); carousel?.scrollTo(index); }} className="h-8 w-8 rounded-full">
            <span className={`h-2 rounded-full transition-all duration-300 ${selected === index ? "w-5 bg-glow" : "w-2 bg-muted-foreground/40"}`} />
          </Button>
        ))}
      </div>
      <PlanPaymentDialog plan={paymentPlan} open={paymentPlan !== null} onOpenChange={(open) => { if (!open) setPaymentPlan(null); }} />
      <p className="mt-6 text-center text-sm text-muted-foreground">Daily, weekly or monthly plans: <a className="text-primary underline" href="https://t.me/Insightseditorall_bot" target="_blank" rel="noopener noreferrer">Insights Editor bot</a> · <a className="text-primary underline" href="https://t.me/TheDanielBrooks" target="_blank" rel="noopener noreferrer">Contact owner</a></p>
    </div>
  );
}