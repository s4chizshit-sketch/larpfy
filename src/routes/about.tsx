import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PublicLayout, SectionHeading } from "@/components/site/Sections";
import instagramLogo from "@/assets/instagram-about.png";
import telegramLogo from "@/assets/telegram-about.png";

// TODO(user): Instagram link pending — user will provide the real profile URL.
const INSTAGRAM_URL = "https://www.instagram.com/";
const TELEGRAM_URL = "https://t.me/+HAwfutUg1gNlZDZl";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — LARP Insight" },
      { name: "description", content: "Learn about LARP Insight and follow us on Telegram and Instagram." },
      { property: "og:title", content: "About — LARP Insight" },
      { property: "og:description", content: "Learn about LARP Insight and follow us on Telegram and Instagram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="hero-bg">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <SectionHeading
            eyebrow="About"
            title="Larp Insight"
            sub="Premium insight demo editors for Instagram and TikTok. Follow us on our official channels for updates, tips and new features."
          />
          <div className="mx-auto mt-14 grid max-w-3xl gap-5 sm:grid-cols-2">
            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-card group"
            >
              <img
                src={telegramLogo.url}
                alt="Telegram logo"
                draggable={false}
                className="about-social-logo about-logo-telegram"
              />
              <div>
                <h3 className="font-display text-xl font-bold">Telegram Channel</h3>
                <p className="mt-1 text-sm text-muted-foreground">Join our official channel for news and updates.</p>
              </div>
              <ArrowUpRight className="about-social-arrow" />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-social-card group"
            >
              <img
                src={instagramLogo.url}
                alt="Instagram logo"
                draggable={false}
                className="about-social-logo about-logo-instagram"
              />
              <div>
                <h3 className="font-display text-xl font-bold">Instagram</h3>
                <p className="mt-1 text-sm text-muted-foreground">Follow us for behind-the-scenes and feature drops.</p>
              </div>
              <ArrowUpRight className="about-social-arrow" />
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
