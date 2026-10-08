import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  { title: "Product", links: [["/", "Home"], ["/features", "Features"], ["/pricing", "Pricing"], ["/faq", "FAQ"]] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{c.title}</h4>
            <ul className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="footer-link"
                    activeProps={{ className: "is-active" }}
                    activeOptions={{ exact: true }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
            LARP Insight is an independent third-party tool. It is not affiliated with, endorsed by, or officially
            connected to Instagram, TikTok, Meta, or ByteDance. Customized visuals are intended for demonstration,
            presentation, entertainment, and creative purposes and should not be represented as authentic platform
            analytics.
          </p>
          <p className="shrink-0 text-xs text-muted-foreground">© {new Date().getFullYear()} LARP Insight</p>
        </div>
      </div>
    </footer>
  );
}
