import { useRef, useState } from "react";
import { Check, Move3d, ShoppingBag } from "lucide-react";
import laptopScreen from "@/assets/shopify-laptop-screen.jpg";
import phoneShot from "@/assets/shopify-phone.jpg";
import shopify1 from "@/assets/shopify-1.mp4";
import shopify2 from "@/assets/shopify-2.mp4";
import shopify3 from "@/assets/shopify-3.mp4";
import { RecordingVideoShowcase } from "./InstagramVideoShowcase";
import { Reveal } from "./Reveal";

const recordings = [
  { label: "Dashboard", url: shopify1 },
  { label: "Notifications", url: shopify2 },
  { label: "Customize", url: shopify3 },
];

const bullets = [
  "Customize your Shopify dashboard",
  "Flex your order notifications",
  "Edit total sales, orders and conversion rate",
  "Customize sales graphs and date ranges",
  "Save and share your customized demo visuals",
];

function Laptop3D() {
  const [rot, setRot] = useState({ x: -8, y: -18 });
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null);
  return (
    <div
      className="laptop3d-stage"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        setRot({
          x: Math.max(-60, Math.min(40, d.rx - (e.clientY - d.y) * 0.4)),
          y: d.ry + (e.clientX - d.x) * 0.5,
        });
      }}
      onPointerUp={() => { drag.current = null; }}
      onPointerCancel={() => { drag.current = null; }}
      role="img"
      aria-label="3D laptop showing a demo Shopify dashboard. Drag to rotate."
    >
      <div className="laptop3d" style={{ transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
        <div className="laptop3d-lid">
          <div className="laptop3d-lid-front">
            <img src={laptopScreen} alt="" draggable={false} width={984} height={736} />
          </div>
          <div className="laptop3d-lid-back" />
        </div>
        <div className="laptop3d-base">
          <div className="laptop3d-keyboard" />
        </div>
      </div>
    </div>
  );
}

export function ShopifySection() {
  return (
    <section aria-labelledby="shopify-section-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2 text-sm font-semibold text-foreground">
              <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
              Shopify
            </span>
            <h2 id="shopify-section-title" className="title-gradient mt-5 font-sans text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Shopify Dashboard Insights
            </h2>
            <p className="mt-5 text-lg font-semibold leading-relaxed text-foreground/85 sm:text-xl">
              App UI &amp; flex your notifications with an{" "}
              <span className="font-premium italic whitespace-nowrap text-foreground/90">easy-to-use</span> editor.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {bullets.map((b, i) => (
                <Reveal key={b} delay={i * 80} className="bullet-reveal">
                  <li className="group flex h-full items-start gap-3.5 rounded-xl border border-border/70 bg-card/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/[0.06] hover:shadow-glow">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-primary">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-[15px] font-semibold leading-snug text-foreground/90 sm:text-base">{i + 1}. {b}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </Reveal>
        <RecordingVideoShowcase title="Shopify Dashboard Insights App UI" platform="Shopify" recordings={recordings} />
      </div>

      <Reveal>
        <figure className="mx-auto mt-16 max-w-5xl">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="min-w-0 flex-[3]"><Laptop3D /></div>
            <img
              src={phoneShot}
              alt="Phone showing sample Shopify order notifications"
              width={365}
              height={767}
              loading="lazy"
              decoding="async"
              className="block h-auto min-w-0 flex-1 max-w-[180px]"
            />
          </div>
          <figcaption className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
            <Move3d className="h-4 w-4" aria-hidden="true" /> Drag the laptop to rotate it in 3D · Demo preview, not live store data.
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
