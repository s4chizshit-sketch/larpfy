// Fallback public (publishable) backend values for self-hosted deployments
// (e.g. Vercel) where env vars are not set. Safe to ship: these are public keys.
const PUBLIC_BACKEND_URL = "https://ypvmiwiqxkvhacoczarf.supabase.co";
const PUBLIC_BACKEND_KEY = "sb_publishable_wbaBgP7XB3dawItywsbGkg_BgyPRShs";

// The backend the browser signs users into (fixed at build time).
const CLIENT_BACKEND_URL = (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || PUBLIC_BACKEND_URL;
const CLIENT_BACKEND_KEY = (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) || PUBLIC_BACKEND_KEY;

export function alignServerBackend(env: Record<string, string | undefined>) {
  // On Vercel the server must verify logins against the same backend the browser
  // used; a mismatched SUPABASE_URL makes every signed-in request "Unauthorized".
  if (env["VERCEL"]) {
    env["SUPABASE_URL"] = CLIENT_BACKEND_URL;
    env["SUPABASE_PUBLISHABLE_KEY"] = CLIENT_BACKEND_KEY;
    return;
  }
  if (!env["SUPABASE_URL"]) env["SUPABASE_URL"] = PUBLIC_BACKEND_URL;
  if (!env["SUPABASE_PUBLISHABLE_KEY"]) env["SUPABASE_PUBLISHABLE_KEY"] = PUBLIC_BACKEND_KEY;
}

if (typeof process !== "undefined" && process.env) alignServerBackend(process.env);
