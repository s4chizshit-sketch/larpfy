import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/larpify-logo.png";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return <img src={logoAsset} alt="" className={`${className} object-contain`} aria-hidden />;
}

export function Logo({ to = "/" as const }: { to?: "/" | "/dashboard" | "/admin" }) {
  return (
    <Link to={to} className="brand-logo flex shrink-0 items-center gap-2" aria-label="LARPIFY home">
      <img src={logoAsset} alt="" width={56} height={56} className="h-14 w-14 rounded-lg object-contain" />
      <span className="brand-logo-name font-display text-lg font-bold">LARPIFY</span>
    </Link>
  );
}
