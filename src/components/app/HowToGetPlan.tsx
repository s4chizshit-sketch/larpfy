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
    <section className="howto-box mt-8 p-7 sm:p-9" aria-labelledby="howto-title">
      <p className="howto-eyebrow">Getting started</p>
      <h2 id="howto-title" className="pro-title mt-2 text-2xl sm:text-[28px]">
        How to Get Subscription (Plan)
      </h2>
      <p className="mt-2 text-[15px] text-muted-foreground">Four simple steps from picking a plan to using the app.</p>
      <ol className="mt-7 space-y-3">
        {steps.map((s, i) => (
          <li key={s.t} className="howto-step" style={{ animationDelay: `${i * 90}ms` }}>
            <span className="howto-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
            <span className="howto-icon" aria-hidden>
              <s.icon className="h-5 w-5" />
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
