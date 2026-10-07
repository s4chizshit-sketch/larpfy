import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/larp-mark.png.asset.json";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={markAsset.url} alt="" className={`${className} object-contain`} aria-hidden />;
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
