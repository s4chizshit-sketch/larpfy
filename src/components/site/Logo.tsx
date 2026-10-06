import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.72 0.18 290)" />
          <stop offset="1" stopColor="oklch(0.66 0.16 245)" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)" />
      <rect x="10" y="22" width="4.5" height="9" rx="2.25" fill="white" opacity=".55" />
      <rect x="17.75" y="16" width="4.5" height="15" rx="2.25" fill="white" opacity=".8" />
      <rect x="25.5" y="9" width="4.5" height="22" rx="2.25" fill="white" />
    </svg>
  );
}

export function Logo({ to = "/" as const }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-2.5" aria-label="LARP Insight home">
      <LogoMark />
      <span className="font-display text-[17px] font-semibold tracking-tight">
        LARP <span className="text-muted-foreground font-medium">Insight</span>
      </span>
    </Link>
  );
}
