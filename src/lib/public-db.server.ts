import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Server-side client using only the public (publishable) key.
// Privileged work goes through SECURITY DEFINER database functions,
// so no secret service key is needed on any host (e.g. Vercel).
export function publicDb() {
  const url = process.env["SUPABASE_URL"] || "https://kxsqiannkfzsfqpqioly.supabase.co";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_ByviDC8YrMhLPfLFAtQXKA_8J2mfZHC";
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export async function sha256Hex(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
