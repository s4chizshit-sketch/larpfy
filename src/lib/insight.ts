export type Country = { name: string; pct: number };
export type InsightData = {
  username: string;
  dateRange: string;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profileActivity: number;
  followers: number;
  followerPct: number;
  countries: Country[];
  graph: number[];
};

export const defaultInsight = (platform: "instagram" | "tiktok"): InsightData => ({
  username: platform === "instagram" ? "@yourbrand" : "@yourcreator",
  dateRange: "Last 30 days",
  views: 1284000,
  reach: 842300,
  likes: 96400,
  comments: 3120,
  shares: 8450,
  saves: 12900,
  profileActivity: 24800,
  followers: 18240,
  followerPct: 42.6,
  countries: [
    { name: "India", pct: 38.4 },
    { name: "United States", pct: 21.2 },
    { name: "United Kingdom", pct: 9.7 },
    { name: "Brazil", pct: 6.1 },
  ],
  graph: [32, 45, 38, 62, 58, 80, 96],
});

export const fmt = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 10_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString("en-US");
};
