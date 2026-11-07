import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — LARPIFY" },
      { name: "description", content: "Terms governing the use of LARPIFY." },
      { property: "og:title", content: "Terms of Service — LARPIFY" },
      { property: "og:description", content: "Terms governing the use of LARPIFY." },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Service">
      <p>By creating an account or using LARPIFY you agree to these terms.</p>
      <h2>1. The service</h2>
      <p>LARPIFY is a visual customization tool for creating demo and mock insight visuals styled after social platforms. It does not access, modify, or report real analytics from any platform.</p>
      <h2>2. Acceptable use</h2>
      <p>Visuals you create are for demonstration, presentation, entertainment, and creative purposes. You must not represent customized visuals as authentic platform analytics, use them to deceive advertisers, partners, or the public, or use them for fraud of any kind.</p>
      <h2>3. No affiliation</h2>
      <p>LARPIFY is not affiliated with, endorsed by, or officially connected to Instagram, TikTok, Meta, or ByteDance. All trademarks belong to their respective owners.</p>
      <h2>4. Accounts & subscriptions</h2>
      <p>You are responsible for your account credentials. Subscriptions renew per the billing period of your plan until cancelled. We may suspend accounts that violate these terms.</p>
      <h2>5. Affiliate program</h2>
      <p>Commissions are earned on qualifying paid referrals at the rate shown in your affiliate dashboard. Self-referrals and abusive traffic are not eligible.</p>
      <h2>6. Liability</h2>
      <p>The service is provided "as is". To the maximum extent permitted by law, LARPIFY is not liable for indirect or consequential damages arising from use of the service.</p>
    </LegalPage>
  ),
});
