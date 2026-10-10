import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

function telegramLink(planName: string, billingPeriod: string) {
  const n = planName.toLowerCase();
  const platform = n.includes("tiktok") ? "TikTok" : n.includes("instagram") ? "Instagram" : "";
  const p = `${billingPeriod} ${n}`.toLowerCase();
  const period = p.includes("once") || p.includes("life") ? "Lifetime" : "Monthly";
  const label = [platform, period].filter(Boolean).join(" ");
  return `https://t.me/larpinght?text=${encodeURIComponent(
    `Hi, I purchased the ${label} Plan. My payment is complete.`,
  )}`;
}

/** Paid purchases for the signed-in user; polls so the card appears right after OxaPay confirms. */
export function usePaidPurchases() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["plan-purchases", user?.id],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_purchases").select("*").eq("user_id", user!.id)
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function ProSubscriptionCard() {
  const { data } = usePaidPurchases();
  const active = data?.find((p) => !p.expires_at || new Date(p.expires_at).getTime() > Date.now());
  if (!active) return null;
  return (
    <section className="pro-sub-card">
      <div className="flex items-start gap-3">
        <span className="pro-sub-icon"><BadgeCheck /></span>
        <div className="min-w-0 flex-1">
          <p className="pro-sub-kicker">Pro subscription active</p>
          <p className="pro-sub-plan">{active.plan_name}</p>
          <p className="pro-sub-text">Payment confirmed. Send your payment screenshot on Telegram to receive your APK and Access API Key.</p>
        </div>
      </div>
      <a href={telegramLink(active.plan_name, active.billing_period)} target="_blank" rel="noopener noreferrer" className="pro-sub-tg">
        <Send className="size-4" /> Send screenshot on Telegram
      </a>
    </section>
  );
}
