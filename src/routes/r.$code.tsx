import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/r/$code")({
  head: () => ({
    meta: [
      { title: "You're invited — LARPIFY" },
      { name: "description", content: "Join LARPIFY and start customizing social insight demos." },
      { property: "og:title", content: "You're invited to LARPIFY" },
      { property: "og:description", content: "Customize Instagram and TikTok insight demo visuals." },
    ],
  }),
  ssr: false,
  component: Referral,
});

function Referral() {
  const { code } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const clean = code.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
    localStorage.setItem("larp_ref", JSON.stringify({ code: clean, at: Date.now() }));
    supabase.rpc("track_referral_click", { _code: clean }).then(() => navigate({ to: "/", replace: true }));
  }, [code, navigate]);
  return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Redirecting…</div>;
}
