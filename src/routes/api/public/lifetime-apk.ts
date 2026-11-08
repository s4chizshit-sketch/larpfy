import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkedReceipt } from "@/lib/lifetime-contract";

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
      const { bridgeRequest } = await import("@/lib/lifetime-bridge.server");
      const body = { website_user_id: identity.user.id };
      const receipt = checkedReceipt(await (await bridgeRequest(`purchases/${input.data.purchaseId}/verify`, body)).json(), identity.user.id);
      if (receipt.status !== "fulfilled") return new Response("Download unavailable", { status: 403 });
      const apk = await bridgeRequest(`purchases/${receipt.id}/apk`, body);
      if (apk.headers.get("x-apk-product") !== receipt.product || apk.headers.get("content-type")?.split(";")[0] !== "application/vnd.android.package-archive") return new Response("Invalid APK", { status: 502 });
      return new Response(apk.body, { headers: {
        "Content-Type": "application/vnd.android.package-archive",
        "Content-Disposition": `attachment; filename="${receipt.product}-editor.apk"`,
        "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
      } });
    } catch { return new Response("Download service unavailable", { status: 503 }); }
  } } },
});