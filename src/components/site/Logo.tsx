import { Link } from "@tanstack/react-router";
import markAsset from "@/assets/larp-mark.png";
import logoAsset from "@/assets/larp-logo-original.png";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={markAsset.url} alt="" className={`${className} object-contain`} aria-hidden />;
}

export function Logo({ to = "/" as const }: { to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className="flex shrink-0 items-center" aria-label="LARP Insight home">
      <img src={logoAsset.url} alt="LARP Insight" width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
    </Link>
  );
}
