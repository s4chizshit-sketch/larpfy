import instagramLogo from "@/assets/instagram-plan.png";
import tiktokLogo from "@/assets/tiktok-plan.png";
import shopifyLogo from "@/assets/shopify-logo.svg";

export type WorkspacePlatform = "instagram" | "tiktok" | "shopify";

const brands = {
  instagram: { name: "Instagram", logo: instagramLogo, wordClass: "word-ig" },
  tiktok: { name: "TikTok", logo: tiktokLogo, wordClass: "word-tt" },
  shopify: { name: "Shopify", logo: shopifyLogo, wordClass: "font-display font-semibold" },
};

export function PlatformLogo({ platform, className = "h-6 w-6" }: { platform: WorkspacePlatform; className?: string }) {
  const brand = brands[platform];
  return <img src={brand.logo} alt={`${brand.name} logo`} width={44} height={44} draggable={false} className={`shrink-0 object-contain ${className}`} />;
}

export function PlatformName({ platform }: { platform: WorkspacePlatform }) {
  const brand = brands[platform];
  return <span className={`${brand.wordClass} text-xl leading-normal`}>{brand.name}</span>;
}

export function InstagramIcon({ className }: { className?: string }) { return <PlatformLogo platform="instagram" className={className} />; }
export function TiktokIcon({ className }: { className?: string }) { return <PlatformLogo platform="tiktok" className={className} />; }
export function ShopifyIcon({ className }: { className?: string }) { return <PlatformLogo platform="shopify" className={className} />; }