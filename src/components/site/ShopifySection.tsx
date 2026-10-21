import { ShoppingBag } from "lucide-react";
import shopifyShowcase from "@/assets/shopify-insights-showcase.jpg";
import { Reveal } from "./Reveal";

export function ShopifySection() {
  return (
    <section aria-labelledby="shopify-section-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-5 py-2 text-sm font-semibold text-foreground">
            <ShoppingBag className="h-5 w-5 text-primary" aria-hidden="true" />
            Shopify
          </span>
          <h2 id="shopify-section-title" className="title-gradient mt-5 font-sans text-3xl font-extrabold leading-tight sm:text-5xl">
            Shopify Dashboard Insights
            <span className="mt-3 block text-2xl sm:text-3xl">App UI &amp; Flex Your Notifications</span>
          </h2>
        </div>
        <figure className="mx-auto mt-10 max-w-5xl">
          <img
            src={shopifyShowcase}
            alt="Demo Shopify-style dashboard with sales insights and a phone displaying sample order notifications"
            width={1536}
            height={1024}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full rounded-lg"
          />
          <figcaption className="mt-4 text-center text-xs text-muted-foreground">
            Demo preview · Sample sales and notifications, not live store data.
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}