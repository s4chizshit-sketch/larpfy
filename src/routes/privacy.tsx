import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Privacy Policy — LARPFY" },
      { name: "description", content: "How LARPFY collects and uses your data." },
      { property: "og:title", content: "Privacy Policy — LARPFY" },
      { property: "og:description", content: "How LARPFY collects and uses your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Your name, email address, the projects you save, subscription status, and — if you join the affiliate program — referral clicks, signups and commissions linked to your link.</p>
      <h2>How we use it</h2>
      <p>To run your account, save your work, process subscriptions and affiliate payouts, and send essential account emails such as password resets.</p>
      <h2>Sharing</h2>
      <p>We don't sell personal data. We share it only with service providers required to operate LARPFY.</p>
      <h2>Your choices</h2>
      <p>You can update your name in Settings, delete your projects at any time, and contact us to delete your account.</p>
    </LegalPage>
  ),
});
