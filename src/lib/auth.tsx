import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { recordVisit, trackSiteVisit } from "./visit.functions";

type AuthCtx = { session: Session | null; user: User | null; loading: boolean };
const Ctx = createContext<AuthCtx>({ session: null, user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  // Count every browser session once (anonymous visitors included).
  useEffect(() => {
    try {
      if (sessionStorage.getItem("site-visit")) return;
      sessionStorage.setItem("site-visit", "1");
      const t = setTimeout(() => trackSiteVisit().catch(() => {}), 1500);
      return () => clearTimeout(t);
    } catch {}
  }, []);
  const uid = session?.user?.id;
  useEffect(() => {
    if (!uid) return;
    const k = `visit:${uid}`;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    recordVisit().catch(() => sessionStorage.removeItem(k));
  }, [uid]);
  // Time-on-site: add 30s every 30s while the tab is visible.
  useEffect(() => {
    if (!uid) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") supabase.rpc("add_visit_time", { _seconds: 30 }).then(() => {});
    }, 30000);
    return () => clearInterval(t);
  }, [uid]);
  return <Ctx.Provider value={{ session, user: session?.user ?? null, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) throw new Error("Sign in to load your profile.");
      const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
        supabase.from("profiles").select("*, plans(*)").eq("id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id),
      ]);
      if (profileError) throw profileError;
      if (rolesError) throw rolesError;
      return { profile, isAdmin: !!roles?.some((r) => r.role === "admin") };
    },
  });
}
