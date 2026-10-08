import { CreditCard, KeyRound, MousePointerClick, Smartphone } from "lucide-react";

const steps = [
  { icon: MousePointerClick, t: "Choose a Plan", d: "Select your plan and click Get Plan." },
  { icon: CreditCard, t: "Complete Payment", d: "Choose your payment method and complete the payment." },
  { icon: KeyRound, t: "Get Access", d: "Receive your APK & Access API Key after payment." },
  {
    icon: Smartphone,
    t: "Install the App",
    d: "Install the APK on your Android/iOS phone, open the app, enter your Access API Key, and start using it. ☺️",
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
