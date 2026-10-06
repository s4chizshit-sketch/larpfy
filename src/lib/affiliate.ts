import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth";

export function useAffiliateStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["affiliate", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [{ data: aff }, clicks, { data: refs }, { data: payouts }] = await Promise.all([
        supabase.from("affiliates").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("referral_clicks").select("id", { count: "exact", head: true }).eq("affiliate_user_id", uid),
        supabase.from("referrals").select("*").eq("affiliate_user_id", uid).order("created_at", { ascending: false }),
        supabase.from("payouts").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);
      const r = refs ?? [];
      const earned = r.reduce((s, x) => s + Number(x.commission), 0);
      const paidOut = (payouts ?? []).filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
      const requested = (payouts ?? []).filter((p) => p.status === "pending" || p.status === "approved").reduce((s, p) => s + Number(p.amount), 0);
      return {
        affiliate: aff,
        clicks: clicks.count ?? 0,
        signups: r.length,
        paidCustomers: r.filter((x) => x.status === "paid").length,
        earned,
        paidOut,
        requested,
        pending: Math.max(earned - paidOut, 0),
        available: Math.max(earned - paidOut - requested, 0),
        referrals: r,
        payouts: payouts ?? [],
      };
    },
  });
}
