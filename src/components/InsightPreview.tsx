import { forwardRef } from "react";
import { fmt, type InsightData } from "@/lib/insight";

/** Phone-style mock insight screen. Colors are inline so exported PNGs match exactly. */
export const InsightPreview = forwardRef<HTMLDivElement, { data: InsightData; platform: "instagram" | "tiktok"; compact?: boolean }>(
  function InsightPreview({ data, platform, compact }, ref) {
    const accent = platform === "instagram" ? "#a78bfa" : "#22d3ee";
    const accent2 = platform === "instagram" ? "#f472b6" : "#f43f5e";
    const max = Math.max(...data.graph, 1);
    return (
      <div
        ref={ref}
        className="relative mx-auto w-full overflow-hidden rounded-[2.2rem] border border-white/10 p-1.5"
        style={{ maxWidth: compact ? 280 : 340, background: "#0b0b12", boxShadow: "0 30px 80px -30px rgba(120,90,255,.45)" }}
      >
        <div className="rounded-[1.8rem] px-4 pb-5 pt-3" style={{ background: "#101018", color: "#f4f4f8", fontFamily: "Manrope, sans-serif" }}>
          <div className="flex items-center justify-between text-[10px] opacity-70">
            <span>9:41</span>
            <span className="h-4 w-16 rounded-full" style={{ background: "#000" }} />
            <span>100%</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold">{platform === "instagram" ? "Insights" : "Analytics"}</div>
              <div className="text-[10px] opacity-60">{data.username}</div>
            </div>
            <span className="rounded-full px-2.5 py-1 text-[10px]" style={{ background: "#1c1c28" }}>{data.dateRange}</span>
          </div>

          <div className="mt-4 rounded-2xl p-3" style={{ background: "#16161f" }}>
            <div className="text-[10px] opacity-60">Views</div>
            <div className="text-2xl font-bold tracking-tight">{fmt(data.views)}</div>
            <div className="mt-3 flex h-20 items-end gap-1.5">
              {data.graph.map((v, i) => (
                <div key={i} className="flex-1 rounded-t-md" style={{ height: `${(v / max) * 100}%`, background: `linear-gradient(${accent}, ${accent2})`, opacity: 0.35 + (i / data.graph.length) * 0.65 }} />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["Reach", data.reach],
              ["Likes", data.likes],
              ["Comments", data.comments],
              ["Shares", data.shares],
              ["Saves", data.saves],
              ["Profile", data.profileActivity],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl p-2" style={{ background: "#16161f" }}>
                <div className="text-[9px] opacity-60">{k}</div>
                <div className="text-[13px] font-semibold">{fmt(v as number)}</div>
              </div>
            ))}
          </div>

          {!compact && (
            <div className="mt-3 rounded-2xl p-3" style={{ background: "#16161f" }}>
              <div className="flex justify-between text-[10px]">
                <span className="opacity-60">Top countries</span>
                <span className="opacity-60">{fmt(data.followers)} followers · {data.followerPct}%</span>
              </div>
              <div className="mt-2 space-y-2">
                {data.countries.map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[11px]"><span>{c.name}</span><span className="opacity-70">{c.pct}%</span></div>
                    <div className="mt-1 h-1.5 rounded-full" style={{ background: "#24243a" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(c.pct, 100)}%`, background: accent }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 text-center text-[8px] uppercase tracking-[0.2em] opacity-40">Demo visual · LARPIFY</div>
        </div>
      </div>
    );
  },
);
