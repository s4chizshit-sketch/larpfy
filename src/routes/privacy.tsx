import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — LARP Insight" },
      { name: "description", content: "How LARP Insight collects and uses your data." },
      { property: "og:title", content: "Privacy Policy — LARP Insight" },
      { property: "og:description", content: "How LARP Insight collects and uses your data." },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <h2>What we collect</h2>
      <p>Your name, email address, the projects you save, subscription status, and — if you join the affiliate program — referral clicks, signups and commissions linked to your link.</p>
      <h2>How we use it</h2>
      <p>To run your account, save your work, process subscriptions and affiliate payouts, and send essential account emails such as password resets.</p>
      <h2>Sharing</h2>
      <p>We don't sell personal data. We share it only with service providers required to operate LARP Insight.</p>
      <h2>Your choices</h2>
      <p>You can update your name in Settings, delete your projects at any time, and contact us to delete your account.</p>
    </LegalPage>
  ),
});
