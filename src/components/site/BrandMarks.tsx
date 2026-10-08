import { useId } from "react";

/**
 * Official-style brand marks.
 * Instagram glyph uses the real gradient (yellow → orange → magenta → purple → blue);
 * TikTok glyph uses the real note path with its cyan/red chromatic offset.
 * Wordmarks: Grand Hotel (Instagram script) / Poppins (TikTok bold sans).
 */

const TIKTOK_NOTE =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.58.07-5.36.01-4.03-.01-8.05.02-12.07z";

export function InstagramGlyph({ className = "h-6 w-6" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" className={`glyph-ig ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="21.5" y1="21.5" x2="5" y2="4">
          <stop offset="0" stopColor="#FFDD55" />
          <stop offset="0.25" stopColor="#FF543E" />
          <stop offset="0.5" stopColor="#DB2D78" />
          <stop offset="0.75" stopColor="#8A3AB9" />
          <stop offset="1" stopColor="#2F5EA8" />
        </linearGradient>
      </defs>
      <rect
        x="2.2"
        y="2.2"
        width="19.6"
        height="19.6"
        rx="5.6"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="2.1"
      />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke={`url(#${id})`} strokeWidth="2.1" />
      <circle cx="17.6" cy="6.4" r="1.25" fill={`url(#${id})`} />
    </svg>
  );
}

export function TiktokGlyph({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`glyph-tt ${className}`} aria-hidden="true">
      <path d={TIKTOK_NOTE} fill="#25F4EE" transform="translate(-1 -1)" />
      <path d={TIKTOK_NOTE} fill="#FE2C55" transform="translate(1 1)" />
      <path d={TIKTOK_NOTE} fill="#FFFFFF" />
    </svg>
  );
}

export function InstagramMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <InstagramGlyph className="h-7 w-7" />
      <span className="word-ig text-[27px] leading-none">Instagram</span>
    </span>
  );
}

export function TiktokMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <TiktokGlyph className="h-7 w-7" />
      <span className="word-tt text-xl font-semibold leading-none tracking-tight">TikTok</span>
    </span>
  );
}
