import { CreditCard, KeyRound, MousePointerClick, Smartphone } from "lucide-react";

const steps = [
  { icon: MousePointerClick, t: "Choose lifetime access", d: "Select Instagram or TikTok. Shorter plans are sold separately in the Telegram bot." },
  { icon: CreditCard, t: "Pay securely", d: "Sign in and complete the $25 USDT payment through OxaPay." },
  { icon: KeyRound, t: "Get verified access", d: "After server verification, reopen purchase history for your matching APK and access key." },
  {
    icon: Smartphone,
    t: "Install the App",
    d: "Download the matching APK on Android, install it, and enter your access key. Follow your product's how-to video.",
  },
];

export function HowToGetPlan() {
  return (
    <section className="howto-box mt-6 p-5 sm:p-6" aria-labelledby="howto-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="howto-title" className="pro-title text-lg sm:text-xl">
          How to Get Subscription (Plan)
        </h2>
        <p className="howto-eyebrow">Getting started</p>
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.t} className="howto-step" style={{ animationDelay: `${i * 70}ms` }}>
            <span className="howto-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <span className="howto-icon" aria-hidden>
              <s.icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="howto-title">{s.t}</span>
              <span className="howto-desc">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
