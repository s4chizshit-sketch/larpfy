import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/api/public/lifetime-apk")({
  server: { handlers: { POST: async ({ request }) => {
    const bearer = request.headers.get("authorization");
    if (!bearer?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
    const { publicDb } = await import("@/lib/public-db.server");
    const { data: identity, error } = await publicDb().auth.getUser(bearer.slice(7));
    if (error || !identity.user?.email_confirmed_at) return new Response("Unauthorized", { status: 401 });
    const input = z.object({ purchaseId: z.string().uuid() }).safeParse(await request.json().catch(() => null));
    if (!input.success) return new Response("Invalid order", { status: 400 });
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
      const backend = process.env["SUPABASE_URL"];
      if (!key || !backend) return new Response("Not configured", { status: 503 });
      const db = createClient(backend, key, { global: { headers: { Authorization: bearer } }, auth: { persistSession: false } });
      const { data: receipt } = await db.from("lifetime_orders").select("*").eq("id", input.data.purchaseId).eq("user_id", identity.user.id).maybeSingle();
      if (receipt?.status !== "fulfilled") return new Response("Download unavailable", { status: 403 });
      const { data: apk, error: downloadError } = await db.storage.from("lifetime-apks").download(`${receipt.product}.apk`);
      if (downloadError || !apk) return new Response("APK unavailable", { status: 503 });
      return new Response(apk, { headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${receipt.product}-editor.apk"`,
        "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
      } });
    } catch { return new Response("Download service unavailable", { status: 503 }); }
  } } },
});