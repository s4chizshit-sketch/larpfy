import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const cols = [
  { title: "Product", links: [["/", "Home"], ["/features", "Features"], ["/pricing", "Pricing"], ["/faq", "FAQ"]] },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Visual insight customization for Instagram and TikTok demos.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="md:text-right">
            <h4 className="text-sm font-semibold">{c.title}</h4>
            <ul className="mt-4 flex flex-wrap gap-x-7 gap-y-2.5 md:justify-end">
              {c.links.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground">{label}</Link>
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
